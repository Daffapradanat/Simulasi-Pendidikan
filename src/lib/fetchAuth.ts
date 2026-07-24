export const fetchAuth = async (url: string | URL | Request, options: any = {}) => {
  const token = localStorage.getItem('simpend_token');
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials
  };

  try {
    const res = await fetch(url, opts);
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth_unauthorized'));
    }
    return res;
  } catch (err) {
    // If fetch failed completely (network error)
    throw err;
  }
};
