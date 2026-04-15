import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) nav("/");
  }, [token, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const url = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await API.post(url, payload);
      const { user, token, cart } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("cart", JSON.stringify(cart || { items: [] }));

      window.dispatchEvent(new Event("user-updated"));
      setToken(token);
    } catch (err) {
      setErr(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          placeholder="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        <button
          className="link-like"
          onClick={() => setIsLogin(!isLogin)}
          type="button"
        >
          {isLogin ? "Register here" : "Login here"}
        </button>
      </p>

      {/* Inline CSS for the login/register page */}
      <style>{`
        .auth-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f7fa, #e0e7ff);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 400px;
          background: #fff;
          padding: 30px 25px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .auth-form:hover {
          transform: translateY(-3px);
        }
        .auth-form input {
          margin-bottom: 15px;
          padding: 12px 15px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .auth-form input:focus {
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        }
        .btn {
          padding: 12px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }
        .btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .btn:hover:not(:disabled) {
          background-color: #0056b3;
          transform: translateY(-1px);
        }
        .link-like {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
          padding: 0;
        }
        .link-like:hover {
          color: #0056b3;
        }
        .auth-page h2 {
          margin-bottom: 20px;
          font-size: 28px;
          color: #333;
        }
        .error {
          margin-bottom: 15px;
          font-weight: 500;
          color: red;
        }
        @media (max-width: 500px) {
          .auth-form {
            padding: 25px 20px;
          }
          .auth-page h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
