import axios from 'axios';

export const baseUrl = 'https://management-backend-kgyd.onrender.com';

const api = axios.create({
  apiURL: baseUrl,
});
export default api;
