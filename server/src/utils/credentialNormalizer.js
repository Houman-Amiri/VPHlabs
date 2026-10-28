/**
 * Removes invisible Unicode BiDi marks, isolates, zero-width characters, and BOM
 * that browsers/messengers commonly attach when copying LTR credentials from RTL Persian text.
 */
function stripInvisibleMarks(value) {
  return String(value ?? '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g, '')
    .trim();
}

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) numerals to standard ASCII digits (0-9).
 */
function toAsciiDigits(value) {
  return String(value ?? '')
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Sanitizes credential values read from PaaS environment variable UIs (e.g., Runflare),
 * stripping invisible BiDi marks, accidental `KEY=` prefixes, and surrounding quotes.
 */
function cleanEnvCredential(value, keyName = '') {
  let cleaned = stripInvisibleMarks(value);
  if (keyName) {
    const keyPrefix = new RegExp(`^${keyName}\\s*=\\s*`, 'i');
    cleaned = cleaned.replace(keyPrefix, '').trim();
  }
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = stripInvisibleMarks(cleaned.slice(1, -1));
  }
  return toAsciiDigits(cleaned);
}

function normalizeLoginUsername(value) {
  return toAsciiDigits(stripInvisibleMarks(value));
}

function buildPasswordCandidates(rawPassword) {
  const exact = String(rawPassword ?? '');
  const stripped = stripInvisibleMarks(exact);
  const ascii = toAsciiDigits(stripped);
  const unquoted =
    (ascii.startsWith('"') && ascii.endsWith('"')) ||
    (ascii.startsWith("'") && ascii.endsWith("'"))
      ? stripInvisibleMarks(ascii.slice(1, -1))
      : ascii;

  return Array.from(new Set([exact, stripped, ascii, unquoted])).filter(
    (item) => item.length > 0
  );
}

module.exports = {
  stripInvisibleMarks,
  toAsciiDigits,
  cleanEnvCredential,
  normalizeLoginUsername,
  buildPasswordCandidates,
};
