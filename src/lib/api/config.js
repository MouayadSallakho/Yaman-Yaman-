export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",

  ENDPOINTS: {
    REGISTER: "/api/register",
    VERIFY: "/api/verifiy", // backend spelling
    LOGIN: "/api/login",
  },
};