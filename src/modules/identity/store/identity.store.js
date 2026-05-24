const operationStore = new Map();

const extractName = (payload) => {
  const nameObj = payload?.name;
  if (!nameObj) return { english: '', arabic: '' };
  return {
    english: nameObj.english || nameObj.en || '',
    arabic: nameObj.arabic || nameObj.ar || ''
  };
};

const buildClientPayload = (operationId, entry, identityData = null) => ({
  operationId,
  status: entry.status,
  verified: entry.verified,
  personName: extractName(entry.callbackData?.payload || entry.callbackData),
  civilId: entry.civilId || null,
  identityData,
  callbackReceived: entry.callbackReceived,
  updatedAt: entry.updatedAt
});

const getOperation = (operationId) => operationStore.get(operationId) || null;

const setOperation = (operationId, entry) => {
  operationStore.set(operationId, entry);
  return entry;
};

const getIdentitySnapshot = (operationId) => {
  const entry = getOperation(operationId);
  if (!entry) return null;
  return buildClientPayload(operationId, entry, entry.identityData ?? null);
};

export {
  operationStore,
  extractName,
  buildClientPayload,
  getOperation,
  setOperation,
  getIdentitySnapshot
};
