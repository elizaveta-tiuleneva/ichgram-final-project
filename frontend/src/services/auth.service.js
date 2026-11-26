import api from "./api.js";

import {
  getActiveAccountId,
  removeAccount,
} from "../utils/accountStorage.js";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const logoutUser = () => {
  const activeAccountId = getActiveAccountId();

  if (activeAccountId) {
    removeAccount(activeAccountId);
  }

  localStorage.removeItem("token");
};