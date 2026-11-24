import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import lock from "../../assets/icons/lock.svg";
import styles from "./ResetPassword.module.scss";

function ResetPassword() {
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/login">
          <img src={logo} alt="ICHgram" className={styles.headerLogo} />
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.resetBox}>
          <div className={styles.content}>
            <img src={lock} alt="" className={styles.lock} />

            <h1 className={styles.title}>Trouble logging in?</h1>

            <p className={styles.description}>
              Enter your email, phone, or username and we'll send you a link to
              get back into your account.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="identifier"
                placeholder="Email or Username"
                aria-label="Email or Username"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />

              <button type="submit">Reset your password</button>
            </form>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <Link to="/register" className={styles.createAccount}>
              Create new account
            </Link>
          </div>

          <Link to="/login" className={styles.backToLogin}>
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;
