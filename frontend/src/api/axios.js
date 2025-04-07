// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001/api/',  // adjust as needed
    withCredentials: true, // ✅ This allows sending cookies (needed for CSRF!)

  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
