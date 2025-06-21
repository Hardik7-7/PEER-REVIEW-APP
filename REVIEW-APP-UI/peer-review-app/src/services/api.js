import axios from "axios";
import Cookies from "js-cookie";

let setIsAuthenticated = null;

// Allow App.js to pass down setIsAuthenticated
export const setAuthHandler = (fn) => {
  setIsAuthenticated = fn;
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        if (setIsAuthenticated) setIsAuthenticated(false);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        Cookies.set("accessToken", newAccessToken, { expires: 0.02 });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (setIsAuthenticated) setIsAuthenticated(false);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
