const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Cleans dangerous XSS vectors (<script>, javascript:, inline on* handlers, null bytes)
 * while preserving Persian UTF-8 text, ZWNJ (\u200c نیم‌فاصله), and Markdown formatting.
 */
function sanitizeString(value) {
  return value
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?(?:iframe|object|embed|meta|link)\b[^>]*>/gi, '')
    .replace(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function sanitizeValue(input) {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeValue);
  }
  if (input && typeof input === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(input)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      cleaned[key] = sanitizeValue(val);
    }
    return cleaned;
  }
  return input;
}

function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
}

module.exports = {
  sanitizeRequest,
  sanitizeString,
};
