import axios from 'axios';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const usuario = localStorage.getItem('bci_usuario');
  if (usuario) {
    const parsed = JSON.parse(usuario);
    config.headers['X-User-ID'] = parsed.id;
    config.headers['X-Usuario'] = parsed.nome || parsed.email;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bci_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { USE_MOCK };
