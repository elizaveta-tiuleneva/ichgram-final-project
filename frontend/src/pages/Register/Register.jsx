import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import logo from "../../assets/icons/logo.svg";
import styles from "./Register.module.scss";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Invalid email address.";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(formData.username.trim())) {
      newErrors.username = "Username must contain 3–30 valid characters.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      newErrors.password = "Password is too long.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        password: formData.password,
      });

      navigate("/home", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("email") &&
        normalizedMessage.includes("username")
      ) {
        setErrors({ general: message });
      } else if (normalizedMessage.includes("username")) {
        setErrors({ username: message });
      } else if (normalizedMessage.includes("email")) {
        setErrors({ email: message });
      } else if (normalizedMessage.includes("password")) {
        setErrors({ password: message });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.registerBox}>
          <img src={logo} alt="ICHgram" className={styles.logo} />

          <h2 className={styles.subtitle}>
            Sign up to see photos and videos from your friends.
          </h2>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {errors.email && (
                <p className={styles.error} role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                aria-label="Full Name"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              {errors.fullName && (
                <p className={styles.error} role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                aria-label="Username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
              />

              {errors.username && (
                <p className={styles.error} role="alert">
                  {errors.username}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <PasswordInput
                name="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {errors.password && (
                <p className={styles.error} role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div className={styles.terms}>
              <p>
                People who use our service may have uploaded your contact
                information to Instagram. <span>Learn More</span>
              </p>

              <p>
                By signing up, you agree to our <span>Terms</span>,{" "}
                <span>Privacy Policy</span> and <span>Cookies Policy</span>.
              </p>
            </div>

            {errors.general && (
              <p className={styles.error} role="alert">
                {errors.general}
              </p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>

        <div className={styles.loginBox}>
          <p>
            Have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
