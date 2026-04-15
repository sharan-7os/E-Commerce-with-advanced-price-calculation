import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api", // update to your backend URL
  // no cookies; we use Bearer token in Authorization header
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
