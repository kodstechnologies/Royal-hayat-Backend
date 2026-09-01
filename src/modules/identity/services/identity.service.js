import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';
import { emitIdentityComplete } from '../../../config/socket.js';
import {
  buildClientPayload,
  extractName,
  getOperation,
  operationStore,
  setOperation
} from '../store/identity.store.js';
import { identityLog, identityLogJson } from '../utils/identity.logger.js';
import {
  buildMockDataResult,
  buildMockIdentityRaw,
  buildMockStartResult,
  isMockCivilId,
  isMockCivilIdForStart,
} from '../data/identity.mock.js';
import { createApiLog } from '../../externalApiLogs/services/externalApiLog.service.js';

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};


const SHARPER_BASE_URL = getRequiredEnv('SHARPER_BASE_URL');
const SHARPER_API_KEY = getRequiredEnv('SHARPER_API_KEY');
const SHARPER_USER = getRequiredEnv('SHARPER_USER');
const SHARPER_PASS = getRequiredEnv('SHARPER_PASS');
const SHARPER_CALLBACK_URL = getRequiredEnv('SHARPER_CALLBACK_URL');

const sharperHeaders = (extra = {}) => ({
  'API-KEY': SHARPER_API_KEY,
  Authorization: `Basic ${Buffer.from(`${SHARPER_USER}:${SHARPER_PASS}`).toString('base64')}`,
  ...extra,
});

const parseResponseJson = async (resp) => {
  return resp.json().catch(() => null);
};

const isDataNotAvailableError = (statusCode, responseBody) => {
  if ([204, 404].includes(statusCode)) {
    return true;
  }
  const message = `${responseBody?.detail || ''} ${responseBody?.message || ''}`.toLowerCase();
  return (
    statusCode === 400 &&
    (message.includes('not found') || message.includes('no data') || message.includes('not available'))
  );
};

const fetchIdentityDataRaw = async (civilId, options = { allowMissing: false }) => {
  const startTime = Date.now();
  const endpoint = `data/${encodeURIComponent(civilId)}`;
  
  const dataResp = await fetch(`${SHARPER_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: sharperHeaders(),
  });
  console.log('dataResp', dataResp);
  const dataBody = await parseResponseJson(dataResp);
  const responseTime = Date.now() - startTime;
  
  // Log the API call
  createApiLog({
    service: 'identity',
    endpoint: endpoint,
    method: 'GET',
    civilId: civilId,
    requestData: { civilId },
    responseData: dataBody,
    statusCode: dataResp.status,
    success: dataResp.ok,
    errorMessage: !dataResp.ok ? (dataBody?.detail || dataBody?.message || 'Failed to fetch identity data') : undefined,
    responseTime: responseTime,
  }).catch(err => console.error('[fetchIdentityDataRaw] Failed to log API call:', err));
  
  if (!dataResp.ok) {
    if (options.allowMissing && isDataNotAvailableError(dataResp.status, dataBody)) {
      return null;
    }
    throw new ApiError(
      dataResp.status || httpStatus.BAD_GATEWAY,
      dataBody?.detail || dataBody?.message || 'Failed to fetch identity data',
      dataBody || null
    );
  }

  return dataBody;
};

const normalizeStatusPayload = (rawBody) => {
  const payload = rawBody?.payload || rawBody;
  const success = payload?.success;
  const name = extractName(payload);

  if (success === true) {
    return {
      status: 'verified',
      verified: true,
      personName: name,
      civilId: payload?.civilId || null,
      raw: rawBody
    };
  }

  if (success === false) {
    return {
      status: 'not_verified',
      verified: false,
      personName: name,
      civilId: payload?.civilId || null,
      raw: rawBody
    };
  }

  return {
    status: 'pending',
    verified: null,
    personName: name,
    civilId: payload?.civilId || null,
    raw: rawBody
  };
};

const persistAndEmit = async (operationId, entry) => {
  let identityData = entry.identityData ?? null;
  const effectiveCivilId = entry.civilId || null;

  if (entry.verified === true && effectiveCivilId && !identityData) {
    if (isMockCivilId(effectiveCivilId) || entry.mockBypass === true) {
      identityData = buildMockIdentityRaw(effectiveCivilId, entry.mockReason);
    } else {
      identityData = await fetchIdentityDataRaw(effectiveCivilId, { allowMissing: true });
    }
  }

  const stored = setOperation(operationId, {
    ...entry,
    identityData,
    updatedAt: new Date().toISOString()
  });

  const clientPayload = buildClientPayload(operationId, stored, identityData);

  if (stored.status !== 'pending') {
    identityLog('socket', `emit identity:complete operationId=${operationId} status=${stored.status}`);
    identityLogJson('socket', 'emit payload', clientPayload);
    emitIdentityComplete(operationId, clientPayload);
  } else {
    identityLog('socket', `skip emit (still pending) operationId=${operationId}`);
  }

  return clientPayload;
};

const startIdentityVerification = async ({ civilId, callbackUrl, serviceName, reason }) => {
  if (isMockCivilIdForStart(civilId, serviceName, reason)) {
    identityLog('start', `service: mock bypass civilId=${civilId} (simulated callback)`);
    const mockResult = buildMockStartResult(civilId, reason);
    const operationId = mockResult.operationId || `mock-${civilId}`;

    setOperation(operationId, {
      operationId,
      civilId,
      status: 'pending',
      verified: null,
      callbackReceived: false,
      callbackData: null,
      identityData: null,
      latestStatusRaw: null,
      mockBypass: true,
      mockReason: reason || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setImmediate(() => {
      handleIdentityCallback({
        payload: {
          operationId,
          success: true,
          civilId,
          name: mockResult.personName,
        },
      }).catch((err) => {
        console.error('[identity][mock] simulated callback failed:', err?.message || err);
      });
    });

    return {
      operationId,
      status: 'pending',
      verified: null,
      skippedStart: true,
      dataSource: mockResult.dataSource,
      civilId,
      personName: mockResult.personName,
      raw: mockResult.fixtureRaw || mockResult.raw,
      paciRequestId: mockResult.paciRequestId || null,
      statusUrl: mockResult.statusUrl || null,
      callbackUrl: mockResult.callbackUrl || callbackUrl || SHARPER_CALLBACK_URL,
    };
  }

  const startTime = Date.now();
  const endpoint = 'authenticate/start/push-notification';
  const payload = {
    civilId,
    callbackUrl: callbackUrl || SHARPER_CALLBACK_URL,
    serviceName: serviceName || { ar: 'طلب موعد', en: 'Appointment Request' },
    reason: reason || { ar: 'تجربة', en: 'test' }
  };

  identityLog('start', `service: calling Sharper push-notification civilId=${civilId}`);
  identityLogJson('start', 'service: Sharper request payload', payload);

  const response = await fetch(`${SHARPER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: sharperHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  const responseBody = await parseResponseJson(response);
  const responseTime = Date.now() - startTime;
  
  identityLog('start', `service: Sharper HTTP status=${response.status}`);
  identityLogJson('start', 'service: Sharper response body', responseBody);

  // Log the API call
  createApiLog({
    service: 'identity',
    endpoint: endpoint,
    method: 'POST',
    civilId: civilId,
    requestData: payload,
    responseData: responseBody,
    statusCode: response.status,
    success: response.ok,
    errorMessage: !response.ok ? (responseBody?.detail || responseBody?.message || 'Failed to start identity verification') : undefined,
    responseTime: responseTime,
  }).catch(err => console.error('[startIdentityVerification] Failed to log API call:', err));

  if (!response.ok) {
    identityLog('start', 'service: Sharper start FAILED');
    throw new ApiError(
      response.status || httpStatus.BAD_GATEWAY,
      responseBody?.detail || responseBody?.message || 'Failed to start identity verification',
      responseBody || null
    );
  }

  if (!responseBody?.operationId) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Missing operationId in SharperIntegration response', responseBody || null);
  }

  identityLog('start', `service: operationId=${responseBody.operationId} stored (pending)`);

  setOperation(responseBody.operationId, {
    operationId: responseBody.operationId,
    civilId,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    identityData: null,
    latestStatusRaw: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    operationId: responseBody.operationId,
    status: 'pending',
    verified: null,
    skippedStart: false,
    dataSource: 'start',
    paciRequestId: responseBody.paciRequestId || null,
    statusUrl: responseBody?.urls?.status || null,
    callbackUrl: payload.callbackUrl,
    raw: responseBody
  };
};

const getIdentityStatus = async (operationId) => {
  const existing = getOperation(operationId) || {
    operationId,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    identityData: null,
    latestStatusRaw: null,
    createdAt: null,
    updatedAt: null
  };

  if (existing.callbackReceived && existing.status !== 'pending') {
    return buildClientPayload(operationId, existing, existing.identityData ?? null);
  }

  const statusResp = await fetch(`${SHARPER_BASE_URL}status/${encodeURIComponent(operationId)}`, {
    method: 'GET',
    headers: sharperHeaders(),
  });

  if (statusResp.status === 204) {
    return {
      operationId,
      status: existing.status === 'pending' ? 'pending' : existing.status,
      verified: existing.verified,
      personName: extractName(existing.callbackData?.payload || existing.callbackData),
      callbackReceived: existing.callbackReceived,
      updatedAt: existing.updatedAt
    };
  }

  const statusBody = await parseResponseJson(statusResp);
  if (!statusResp.ok) {
    throw new ApiError(
      statusResp.status || httpStatus.BAD_GATEWAY,
      statusBody?.detail || statusBody?.message || 'Failed to fetch verification status',
      statusBody || null
    );
  }

  const normalized = normalizeStatusPayload(statusBody);
  const effectiveCivilId = normalized.civilId || existing.civilId || null;
  let identityData = existing.identityData ?? null;
  if (normalized.verified === true && effectiveCivilId && !identityData) {
    if (isMockCivilId(effectiveCivilId)) {
      identityData = buildMockIdentityRaw(effectiveCivilId);
    } else {
      identityData = await fetchIdentityDataRaw(effectiveCivilId, { allowMissing: true });
    }
  }

  const updated = setOperation(operationId, {
    ...existing,
    civilId: effectiveCivilId || existing.civilId,
    status: normalized.status,
    verified: normalized.verified,
    identityData,
    latestStatusRaw: normalized.raw,
    updatedAt: new Date().toISOString()
  });

  return buildClientPayload(operationId, updated, identityData);
};

const getIdentityData = async (civilId) => {
  if (isMockCivilId(civilId)) {
    identityLog('data', `service: mock data civilId=${civilId}`);
    return buildMockDataResult(civilId);
  }

  const dataBody = await fetchIdentityDataRaw(civilId);
  return {
    civilId,
    raw: dataBody
  };
};

const handleIdentityCallback = async (callbackBody) => {
  identityLog('callback', 'service: handleIdentityCallback entered');
  identityLogJson('callback', 'received from Sharper (raw body)', callbackBody);

  const payload = callbackBody?.payload || callbackBody;
  const operationId = payload?.operationId || callbackBody?.operationId;

  identityLogJson('callback', 'extracted payload', {
    operationId: operationId || null,
    civilId: payload?.civilId || callbackBody?.civilId || null,
    success: payload?.success ?? callbackBody?.success ?? null,
    name: payload?.name || callbackBody?.name || null,
  });

  if (!operationId) {
    identityLog('callback', 'service: MISSING operationId in callback');
    throw new ApiError(httpStatus.BAD_REQUEST, 'operationId is required in callback payload');
  }

  identityLog('callback', `service: operationId=${operationId}`);

  const existing = getOperation(operationId) || {
    operationId,
    civilId: payload?.civilId || null,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    identityData: null,
    latestStatusRaw: null,
    createdAt: new Date().toISOString(),
    updatedAt: null
  };

  const normalized = normalizeStatusPayload(callbackBody);
  identityLogJson('callback', 'service: normalized status', normalized);

  const clientPayload = await persistAndEmit(operationId, {
    ...existing,
    civilId: normalized.civilId || existing.civilId,
    status: normalized.status,
    verified: normalized.verified,
    callbackReceived: true,
    callbackData: callbackBody,
    latestStatusRaw: normalized.raw
  });

  identityLog(
    'callback',
    `service: done operationId=${operationId} status=${clientPayload.status} verified=${clientPayload.verified}`
  );
  identityLogJson('callback', 'emitted to website via socket (identity:complete)', clientPayload);

  return {
    operationId,
    status: clientPayload.status,
    verified: clientPayload.verified
  };
};

export default {
  startIdentityVerification,
  getIdentityStatus,
  getIdentityData,
  handleIdentityCallback
};
