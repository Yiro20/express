// === CONFIG ===
//export const API_BASE_URL = "http://localhost:3000";
export const API_BASE_URL = "https://express-s5nl.onrender.com";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
