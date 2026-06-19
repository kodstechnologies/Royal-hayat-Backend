export function extractCombinedInitials(text) {
  return text
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function getDoctorCombinedInitialsVariants(initials, name) {
  const variants = new Set();
  const trimmedName = String(name || '').trim();
  const trimmedInitials = String(initials || '').trim();

  const add = (text) => {
    const value = extractCombinedInitials(text);
    if (value) variants.add(value);
  };

  if (trimmedName) add(trimmedName);
  if (trimmedInitials) {
    add(trimmedInitials);
    if (trimmedName) add(`${trimmedInitials} ${trimmedName}`);
  }

  return [...variants];
}

export function matchesDoctorCombinedInitials(doctor, searchQuery) {
  const compact = String(searchQuery || '')
    .trim()
    .replace(/[\s.]/g, '')
    .toUpperCase();

  if (compact.length < 2) return false;

  const englishVariants = getDoctorCombinedInitialsVariants(
    doctor.initials,
    doctor.name,
  );
  if (englishVariants.some((variant) => variant.startsWith(compact))) {
    return true;
  }

  const arabicVariants = getDoctorCombinedInitialsVariants(
    doctor.initialsAr,
    doctor.nameAr,
  );
  return arabicVariants.some((variant) => variant.startsWith(compact));
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
