import ApiError from '../../../utils/ApiError.js';
import httpStatus from 'http-status';

const operationStore = new Map();

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const SHARPER_BASE_URL = getRequiredEnv('SHARPER_BASE_URL');
const SHARPER_USER = getRequiredEnv('SHARPER_USER');
const SHARPER_PASS = getRequiredEnv('SHARPER_PASS');
const SHARPER_CALLBACK_URL = getRequiredEnv('SHARPER_CALLBACK_URL');

const basicAuth = `Basic ${Buffer.from(`${SHARPER_USER}:${SHARPER_PASS}`).toString('base64')}`;

const parseResponseJson = async (resp) => {
  return resp.json().catch(() => null);
};

const extractName = (payload) => {
  const nameObj = payload?.name;
  if (!nameObj) return { english: '', arabic: '' };
  return {
    english: nameObj.english || nameObj.en || '',
    arabic: nameObj.arabic || nameObj.ar || ''
  };
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

const startIdentityVerification = async ({ civilId, callbackUrl, serviceName, reason }) => {
  const payload = {
    civilId,
    callbackUrl: callbackUrl || SHARPER_CALLBACK_URL,
    serviceName: serviceName || { ar: 'تجربة', en: 'Service Test' },
    reason: reason || { ar: 'تجربة', en: 'test' }
  };

  const response = await fetch(`${SHARPER_BASE_URL}authenticate/start/push-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth
    },
    body: JSON.stringify(payload)
  });

  const responseBody = await parseResponseJson(response);
  if (!response.ok) {
    throw new ApiError(
      response.status || httpStatus.BAD_GATEWAY,
      responseBody?.detail || responseBody?.message || 'Failed to start identity verification',
      responseBody || null
    );
  }

  if (!responseBody?.operationId) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Missing operationId in SharperIntegration response', responseBody || null);
  }

  operationStore.set(responseBody.operationId, {
    operationId: responseBody.operationId,
    civilId,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    latestStatusRaw: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    operationId: responseBody.operationId,
    paciRequestId: responseBody.paciRequestId || null,
    statusUrl: responseBody?.urls?.status || null,
    callbackUrl: payload.callbackUrl,
    raw: responseBody
  };
};

const getIdentityStatus = async (operationId) => {
  const existing = operationStore.get(operationId) || {
    operationId,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    latestStatusRaw: null,
    createdAt: null,
    updatedAt: null
  };

  const statusResp = await fetch(`${SHARPER_BASE_URL}status/${encodeURIComponent(operationId)}`, {
    method: 'GET',
    headers: {
      Authorization: basicAuth
    }
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
  const updated = {
    ...existing,
    status: normalized.status,
    verified: normalized.verified,
    latestStatusRaw: normalized.raw,
    updatedAt: new Date().toISOString()
  };
  operationStore.set(operationId, updated);

  return {
    operationId,
    status: normalized.status,
    verified: normalized.verified,
    personName: normalized.personName,
    civilId: normalized.civilId || existing.civilId || null,
    callbackReceived: updated.callbackReceived,
    updatedAt: updated.updatedAt
  };
};

const handleIdentityCallback = async (callbackBody) => {
  const payload = callbackBody?.payload || callbackBody;
  const operationId = payload?.operationId || callbackBody?.operationId;

  if (!operationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'operationId is required in callback payload');
  }

  const existing = operationStore.get(operationId) || {
    operationId,
    civilId: payload?.civilId || null,
    status: 'pending',
    verified: null,
    callbackReceived: false,
    callbackData: null,
    latestStatusRaw: null,
    createdAt: new Date().toISOString(),
    updatedAt: null
  };

  const normalized = normalizeStatusPayload(callbackBody);
  operationStore.set(operationId, {
    ...existing,
    status: normalized.status,
    verified: normalized.verified,
    callbackReceived: true,
    callbackData: callbackBody,
    updatedAt: new Date().toISOString()
  });

  return {
    operationId,
    status: normalized.status,
    verified: normalized.verified
  };
};

export default {
  startIdentityVerification,
  getIdentityStatus,
  handleIdentityCallback
};

