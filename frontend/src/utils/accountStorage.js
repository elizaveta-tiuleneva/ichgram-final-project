const ACCOUNTS_KEY = "ichgram_accounts";
const ACTIVE_ACCOUNT_KEY = "ichgram_active_account";

export const getAccounts = () => {
  try {
    const accounts = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]"
    );

    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
};

export const getActiveAccountId = () => {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
};

export const getActiveAccount = () => {
  const activeAccountId = getActiveAccountId();

  return (
    getAccounts().find(
      (account) => account.id === activeAccountId
    ) || null
  );
};

export const getActiveToken = () => {
  return getActiveAccount()?.token || null;
};

export const setActiveAccount = (accountId) => {
  const id = String(accountId);

  const account = getAccounts().find(
    (item) => item.id === id
  );

  if (!account) {
    return false;
  }

  localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);

  return true;
};

export const saveAccount = (user, token) => {
  const id = String(user.id || user._id);

  const accounts = getAccounts();

  const account = {
    id,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar || "",
    token,
  };

  const updatedAccounts = accounts.filter(
    (item) => item.id !== id
  );

  updatedAccounts.push(account);

  localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  setActiveAccount(id);

  return account;
};

export const removeAccount = (accountId) => {
  const id = String(accountId);

  const accounts = getAccounts().filter(
    (account) => account.id !== id
  );

  localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(accounts)
  );

  if (getActiveAccountId() === id) {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
};

export const clearAccounts = () => {
  localStorage.removeItem(ACCOUNTS_KEY);
  localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  localStorage.removeItem("token");
};