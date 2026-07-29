export const AuthStorage = {
  setToken(token) {
    localStorage.setItem("token", token);
  },
  getToken() {
    return localStorage.getItem("token");
  },
  logout() {
    localStorage.removeItem("token");
  },
};