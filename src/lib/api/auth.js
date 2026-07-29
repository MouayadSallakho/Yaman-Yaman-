import { API_CONFIG } from "./config";
import { apiRequest } from "./request";

export const AuthAPI = {
  register({ name, email, phone, password }) {
    return apiRequest({
      path: API_CONFIG.ENDPOINTS.REGISTER,
      method: "POST",
      body: { name, email, phone, password },
    });
  },

  verify({ email, code }) {
    return apiRequest({
      path: API_CONFIG.ENDPOINTS.VERIFY,
      method: "GET",
      query: { email, code },
    });
  },

  login({ email, password }) {
    return apiRequest({
      path: API_CONFIG.ENDPOINTS.LOGIN,
      method: "POST",
      body: { email, password },
    });
  },
};