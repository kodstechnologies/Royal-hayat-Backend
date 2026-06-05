const SAME_DOCTOR_SAME_DAY_MESSAGE =
  'Patient already has an active booking with this doctor on the same day';

const cleanBookingMessage = (raw) =>
  String(raw || '')
    .replace(/^Error:\s*/i, '')
    .trim()
    .replace(/care provider/gi, 'doctor');

const parseExistingBookingFromMessage = (message) => {
  const appointmentDuringTimeSlot = message.match(
    /already has an appointment with\s+(.+?)\s+\((\d{1,2}:\d{2})(?:\s*-\s*\d{1,2}:\d{2})?\)\s+during this time slot/i
  );
  if (appointmentDuringTimeSlot) {
    return {
      existingDoctor: appointmentDuringTimeSlot[1]?.trim(),
      existingTime: appointmentDuringTimeSlot[2]?.trim()
    };
  }

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

const isDuplicateBookingHint = (lower) =>
  lower.includes('active booking') ||
  lower.includes('already has an appointment') ||
  lower.includes('already has a booking') ||
  lower.includes('during this time slot') ||
  lower.includes('book at a different date or time') ||
  (lower.includes('already has') &&
    (lower.includes('booking') || lower.includes('appointment')));

const isSameDoctorSameDayHint = (lower) =>
  (lower.includes('same doctor') && lower.includes('same day')) ||
  (lower.includes('this doctor') && lower.includes('same day'));

const isSameTimeConflictHint = (lower, parsed) =>
  lower.includes('same time') ||
  lower.includes('same day and time') ||
  lower.includes('during this time slot') ||
  lower.includes('book at a different date or time') ||
  Boolean(parsed.existingDoctor && (parsed.existingDate || parsed.existingTime));

const classifyBookingConflict = (raw) => {
  const message = cleanBookingMessage(raw);
  if (!message) return null;

  const lower = message.toLowerCase();
  const parsed = parseExistingBookingFromMessage(message);

  if (
    lower === SAME_DOCTOR_SAME_DAY_MESSAGE.toLowerCase() ||
    isSameDoctorSameDayHint(lower)
  ) {
    return {
      code: 'DUPLICATE_SAME_DOCTOR_SAME_DAY',
      message:
        lower === SAME_DOCTOR_SAME_DAY_MESSAGE.toLowerCase()
          ? SAME_DOCTOR_SAME_DAY_MESSAGE
          : message,
      ...parsed
    };
  }

  if (!isDuplicateBookingHint(lower)) {
    if (parsed.existingDoctor && parsed.existingDate && parsed.existingTime) {
      return {
        code: 'DUPLICATE_SAME_TIME_DIFFERENT_DOCTOR',
        message,
        ...parsed
      };
    }
    return null;
  }

  if (isSameTimeConflictHint(lower, parsed)) {
    return {
      code: 'DUPLICATE_SAME_TIME_DIFFERENT_DOCTOR',
      message,
      ...parsed
    };
  }

  return null;
};

export { classifyBookingConflict, cleanBookingMessage, SAME_DOCTOR_SAME_DAY_MESSAGE };
