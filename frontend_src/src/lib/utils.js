export async function parseResponse(response) {
  const text = await response.text();
  let data = text;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep text as-is
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null
      ? data.error || data.detail || JSON.stringify(data)
      : text || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function pretty(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function normalizeColor(value) {
  if (!value) return '#ffffff';
  const trimmed = String(value).trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed;
  return trimmed;
}