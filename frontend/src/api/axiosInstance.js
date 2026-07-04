import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://last-mile-delivery-tracker-k43o.onrender.com/api",
});

// Automatically attach token to every request if logged in
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;