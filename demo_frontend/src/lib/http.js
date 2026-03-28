function buildHeaders(json = true) {
  return json
    ? {
        'Content-Type': 'application/json',
      }
    : {};
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options.headers ?? {}),
    },
  });

  let data = null;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    const errorMessage = data?.error ?? data?.detail ?? data?.message ?? `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
