export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/digital/simulasisains')) {
    return '/digital/simulasisains/';
  }
  return '/';
};
