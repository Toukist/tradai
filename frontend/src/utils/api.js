const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erreur API');
  }

  return data;
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/api/auth/me', { token }),
  debate: (payload, token) => request('/api/debate', { method: 'POST', body: payload, token }),
  portfolio: (payload, token) => request('/api/portfolio', { method: 'POST', body: payload, token }),
  compareEtfs: (payload, token) => request('/api/etf/compare', { method: 'POST', body: payload, token }),
  analyzeFunds: (payload, token) => request('/api/funds/analyze', { method: 'POST', body: payload, token }),
  switchFunds: (payload, token) => request('/api/funds/switch', { method: 'POST', body: payload, token }),
  checkout: (plan, token) => request('/api/stripe/checkout', { method: 'POST', body: { plan }, token }),
  portal: (token) => request('/api/stripe/portal', { method: 'POST', token }),
};
