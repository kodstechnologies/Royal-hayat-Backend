const PREFIX = '[RoyalHayat]';

const ts = () => new Date().toISOString();

export const royalHayatLog = (tag, message, data = undefined) => {
  if (data !== undefined) {
    console.log(`${PREFIX}[${tag}] ${ts()} ${message}`, data);
    return;
  }
  console.log(`${PREFIX}[${tag}] ${ts()} ${message}`);
};

export const royalHayatLogJson = (tag, message, obj) => {
  console.log(`${PREFIX}[${tag}] ${ts()} ${message}`);
  try {
    console.log(JSON.stringify(obj, null, 2));
  } catch {
    console.log(obj);
  }
};
