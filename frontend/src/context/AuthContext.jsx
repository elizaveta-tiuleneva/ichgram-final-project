import { useEffect, useState } from "react";

import { AuthContext } from "./authContext.js";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/auth.service.js";

import {
  getAccounts,
  getActiveAccountId,
  getActiveToken,
  saveAccount,
  setActiveAccount,
  removeAccount,
  clearAccounts,
} from "../utils/accountStorage.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncAccounts = () => {
    setAccounts(
      getAccounts().map((account) => ({
        id: account.id,
        username: account.username,
        fullName: account.fullName,
        avatar: account.avatar,
      })),
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = getActiveToken() || localStorage.getItem("token");

      if (!token) {
        syncAccounts();
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        saveAccount(currentUser, token);
        localStorage.removeItem("token");

        setUser(currentUser);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          const activeAccountId = getActiveAccountId();

          if (activeAccountId) {
            removeAccount(activeAccountId);
          }

          localStorage.removeItem("token");
        }

        setUser(null);
      } finally {
        syncAccounts();
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    const data = await registerUser(userData);

    saveAccount(data.user, data.token);
    localStorage.removeItem("token");

    setUser(data.user);
    syncAccounts();

    return data;
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    saveAccount(data.user, data.token);
    localStorage.removeItem("token");

    setUser(data.user);
    syncAccounts();

    return data;
  };

  const switchAccount = async (accountId) => {
    const previousAccountId = getActiveAccountId();

    if (!setActiveAccount(accountId)) {
      throw new Error("Account not found.");
    }

    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      const token = getActiveToken();

      saveAccount(currentUser, token);

      setUser(currentUser);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        removeAccount(accountId);
      }

      if (previousAccountId && setActiveAccount(previousAccountId)) {
        try {
          const previousUser = await getCurrentUser();
          setUser(previousUser);
        } catch (restoreError) {
          if (
            restoreError.response?.status === 401 ||
            restoreError.response?.status === 404
          ) {
            removeAccount(previousAccountId);
          }

          setUser(null);
        }
      } else {
        setUser(null);
      }

      throw error;
    } finally {
      syncAccounts();
      setLoading(false);
    }
  };

  const logout = async () => {
    logoutUser();
    setUser(null);
    syncAccounts();

    const remainingAccounts = getAccounts();

    if (remainingAccounts.length > 0) {
      try {
        await switchAccount(remainingAccounts[0].id);
      } catch {
        setUser(null);
      }
    }
  };

  const logoutAll = () => {
    clearAccounts();

    setUser(null);
    setAccounts([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        switchAccount,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
