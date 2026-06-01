import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const user = await login(form);
      const requestedPath = location.state?.from?.pathname;
      const nextPath =
        user.role === "admin"
          ? "/admin"
          : requestedPath && requestedPath !== "/admin"
            ? requestedPath
            : "/";

      navigate(nextPath, { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <form className="form auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <ErrorMessage message={message} />
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
