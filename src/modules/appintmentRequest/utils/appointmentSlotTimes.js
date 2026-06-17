const trimValue = (value) => {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim();
};

export const applySlotTimesToPayload = (payload, body = {}) => {
  const timeSlot =
    body.timeSlot && typeof body.timeSlot === 'object' ? body.timeSlot : null;

  const from =
    body.slot_from_time ??
    timeSlot?.slot_from_time ??
    body.time ??
    timeSlot?.time ??
    timeSlot?.label;

  const to = body.slot_to_time ?? timeSlot?.slot_to_time;

  const fromValue = trimValue(from);
  const toValue = trimValue(to);

  if (fromValue) {
    payload.slot_from_time = fromValue;
  }

  if (toValue) {
    payload.slot_to_time = toValue;
  }

  return payload;
};

export const formatSlotTimesForDisplay = (record = {}) => {
  const from = trimValue(record.slot_from_time ?? record.time);
  const to = trimValue(record.slot_to_time);

  if (from && to) {
    return `${from} - ${to}`;
  }

  return from || 'N/A';
};
