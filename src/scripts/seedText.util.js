export const stripTrailingPeriod = (text) => {
  const trimmed = String(text ?? "").trim();
  return trimmed.replace(/\.+$/u, "");
};

export const toPointerArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => stripTrailingPeriod(item)).filter(Boolean);
};
