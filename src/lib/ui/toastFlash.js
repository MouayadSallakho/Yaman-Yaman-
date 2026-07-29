export const ToastFlash = {
  set(message) {
    localStorage.setItem("flash_toast", message);
  },
  get() {
    const msg = localStorage.getItem("flash_toast");
    if (!msg) return "";
    localStorage.removeItem("flash_toast");
    return msg;
  }
};