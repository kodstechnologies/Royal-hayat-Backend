const SAME_DOCTOR_SAME_DAY_MESSAGE =
  'Patient already has an active booking with this doctor on the same day';

const cleanBookingMessage = (raw) =>
  String(raw || '')
    .replace(/^Error:\s*/i, '')
    .trim()
    .replace(/care provider/gi, 'doctor');

const parseExistingBookingFromMessage = (message) => {
  const withProviderOnDateAtTime = message.match(
    /with\s+(?:doctor\s+|care\s+provider\s+)?(.+?)\s+on\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\s+(?:at\s+)?(\d{1,2}:\d{2}(?::\d{2})?)/i
  );
  if (withProviderOnDateAtTime) {
    return {
      existingDoctor: withProviderOnDateAtTime[1]?.trim(),
      existingDate: withProviderOnDateAtTime[2]?.trim(),
      existingTime: withProviderOnDateAtTime[3]?.trim()
    };
  }

  const onDateAtTimeWith = message.match(
    /on\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\s+at\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+with\s+(.+?)(?:\.|$)/i
  );
  if (onDateAtTimeWith) {
    return {
      existingDate: onDateAtTimeWith[1]?.trim(),
      existingTime: onDateAtTimeWith[2]?.trim(),
      existingDoctor: onDateAtTimeWith[3]?.trim()
    };
  }

  const doctorOnly = message.match(
    /(?:doctor|care\s+provider)\s+(.+?)(?:\s+on\s+|\s+at\s+|\.|$)/i
  );
  if (doctorOnly) {
    return { existingDoctor: doctorOnly[1]?.trim() };
  }

  return {};
};

const classifyBookingConflict = (raw) => {
  const message = cleanBookingMessage(raw);
  if (!message) return null;

  const lower = message.toLowerCase();
  if (lower === SAME_DOCTOR_SAME_DAY_MESSAGE.toLowerCase()) {
    return {
      code: 'DUPLICATE_SAME_DOCTOR_SAME_DAY',
      message: SAME_DOCTOR_SAME_DAY_MESSAGE
    };
  }

  if (!lower.includes('active booking')) {
    return null;
  }

  const parsed = parseExistingBookingFromMessage(message);
  const isSameDoctorSameDay =
    lower.includes('same doctor') && lower.includes('same day');

  if (isSameDoctorSameDay) {
    return {
      code: 'DUPLICATE_SAME_DOCTOR_SAME_DAY',
      message,
      ...parsed
    };
  }

  const isSameTimeConflict =
    lower.includes('same time') ||
    lower.includes('same day and time') ||
    Boolean(parsed.existingDoctor && (parsed.existingDate || parsed.existingTime));

  if (isSameTimeConflict) {
    return {
      code: 'DUPLICATE_SAME_TIME_DIFFERENT_DOCTOR',
      message,
      ...parsed
    };
  }

  return null;
};

export { classifyBookingConflict, cleanBookingMessage, SAME_DOCTOR_SAME_DAY_MESSAGE };
