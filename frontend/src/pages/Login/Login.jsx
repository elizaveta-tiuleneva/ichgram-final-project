import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import logo from "../../assets/icons/logo.svg";
import phones from "../../assets/images/login-phones.png";
import styles from "./Login.module.scss";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({
        identifier: identifier.trim(),
        password,
      });

      navigate("/home", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to log in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.phones}>
          <img src={phones} alt="ICHgram mobile application" />
        </div>

        <div className={styles.auth}>
          <div className={styles.loginBox}>
            <img src={logo} alt="ICHgram" className={styles.logo} />

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="identifier"
                placeholder="Username, or email"
                aria-label="Username or email"
                autoComplete="username"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setError("");
                }}
                required
              />

              <PasswordInput
                name="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                required
              />

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <Link to="/reset-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <div className={styles.registerBox}>
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
