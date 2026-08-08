import { apiFetch } from '../api';
export const apiFetch = (path, options) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return apiFetch(`${baseUrl}${path}`, options);
};

