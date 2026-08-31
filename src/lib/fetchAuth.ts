import { getBaseUrl } from './basePath';
export const fetchAuth = async (url: string | URL | Request, options: any = {}) => {
  let resolvedUrl = url;
  if (typeof resolvedUrl === 'string' && resolvedUrl.startsWith('/api/')) {
    const baseUrl = getBaseUrl();
    resolvedUrl = `${baseUrl}${resolvedUrl.substring(1)}`;
  }

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
    const res = await fetch(resolvedUrl, opts);
    const urlStr = typeof resolvedUrl === 'string' ? resolvedUrl : resolvedUrl instanceof Request ? resolvedUrl.url : resolvedUrl.toString();
    if (res.status === 401 && !urlStr.includes('/api/auth/login')) {
      window.dispatchEvent(new CustomEvent('auth_unauthorized'));
    }
    return res;
  } catch (err) {
    // If fetch failed completely (network error)
    throw err;
  }
};
