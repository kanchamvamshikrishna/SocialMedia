import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadSession = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Send the user to a clear "please log in" screen instead of leaving
      // whatever page they were on to render a misleading error (e.g. a
      // profile page treating "not authenticated" as "user not found").
      if (hadSession && !PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.details?.join(", ") ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default api;
