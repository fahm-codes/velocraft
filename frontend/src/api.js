const baseUrl = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path, options = {}) => {
  return fetch(`${baseUrl}${path}`, options);
};
