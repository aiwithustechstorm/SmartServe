import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let accessToken = localStorage.getItem("smartserve_token");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      accessToken = null;
      localStorage.removeItem("smartserve_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const setToken = (token) => {
  accessToken = token;
  localStorage.setItem("smartserve_token", token);
};

export const getToken = () => accessToken;

export const clearToken = () => {
  accessToken = null;
  localStorage.removeItem("smartserve_token");
};

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
};

// ---- Foods ----
export const foodAPI = {
  getAll: (showAll = false) => api.get(`/foods${showAll ? '?all=true' : ''}`),
  create: (data) => api.post("/foods", data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
};

// ---- Orders ----
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getUserOrders: () => api.get("/orders/user"),
  getAdminOrders: () => api.get("/orders/admin"),
  updateStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
};

export default api;
