import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const signupClient = (data) => axios.post(`${API_URL}/auth/signup`, data);
export const loginClient = (data) => axios.post(`${API_URL}/auth/login`, data);
export const verifyEmail = (token) => axios.get(`${API_URL}/auth/verify?token=${token}`);
export const forgotPassword = (email) => axios.post(`${API_URL}/auth/forgot-password`, { email });
export const resetPassword = (token, password) => axios.post(`${API_URL}/auth/reset-password`, { token, password });

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}
