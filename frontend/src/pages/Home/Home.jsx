import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

function Home() {
  const {
    user,
    accounts,
    switchAccount,
    logout,
    logoutAll,
  } = useAuth();

  const [error, setError] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  const activeAccountId = String(user?.id || user?._id);

  const handleSwitchAccount = async (accountId) => {
    setError("");
    setIsSwitching(true);

    try {
      await switchAccount(accountId);
    } catch (error) {
      const status = error.response?.status;

      setError(
        status === 401 || status === 404
          ? "Your session has expired. Please log in again."
          : "Unable to switch accounts. Please try again."
      );
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <main>
      <h1>ICHgram</h1>

      <h2>Welcome, {user?.fullName}!</h2>

      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>

      <hr />

      <h3>Switch accounts</h3>

      {accounts.map((account) => {
        const isActive = account.id === activeAccountId;

        return (
          <div key={account.id}>
            <button
              type="button"
              disabled={isActive || isSwitching}
              onClick={() => handleSwitchAccount(account.id)}
            >
              @{account.username}
              {isActive ? " (Active)" : ""}
            </button>
          </div>
        );
      })}

      {error && <p role="alert">{error}</p>}

      <hr />

      <div>
        <Link to="/login">
          Log into existing account
        </Link>
      </div>

      <div>
        <Link to="/register">
          Create new account
        </Link>
      </div>

      <hr />

      <button type="button" onClick={logout}>
        Log out
      </button>

      <button type="button" onClick={logoutAll}>
        Log out of all accounts
      </button>
    </main>
  );
}

export default Home;