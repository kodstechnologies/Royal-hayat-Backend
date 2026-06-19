export function extractCombinedInitials(text) {
  return text
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function getDoctorCombinedInitialsVariants(name) {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) return [];

  const value = extractCombinedInitials(trimmedName);
  return value ? [value] : [];
}

export function matchesDoctorCombinedInitials(doctor, searchQuery) {
  const compact = String(searchQuery || '')
    .trim()
    .replace(/[\s.]/g, '')
    .toUpperCase();

  if (compact.length < 2) return false;

  const englishVariants = getDoctorCombinedInitialsVariants(doctor.name);
  if (englishVariants.some((variant) => variant.startsWith(compact))) {
    return true;
  }

  const arabicVariants = getDoctorCombinedInitialsVariants(doctor.nameAr);
  return arabicVariants.some((variant) => variant.startsWith(compact));
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
