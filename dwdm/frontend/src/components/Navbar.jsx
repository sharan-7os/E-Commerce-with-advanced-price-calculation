import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function Navbar() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const nav = useNavigate();

  useEffect(() => {
    if (!token) nav("/auth");
  }, [token, nav]);

  useEffect(() => {
    const updateUser = () => {
      const updatedUser = localStorage.getItem("user");
      const updatedToken = localStorage.getItem("token");
      setUser((prev) => {
        const newUser = updatedUser ? JSON.parse(updatedUser) : null;
        if (JSON.stringify(prev) === JSON.stringify(newUser)) return prev;
        return newUser;
      });
      setToken((prev) => {
        if (prev === updatedToken) return prev;
        return updatedToken;
      });
    };
    updateUser();
    window.addEventListener("storage", updateUser);
    window.addEventListener("user-updated", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("user-updated", updateUser);
    };
  }, []);

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err?.response?.data || err.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");

    window.dispatchEvent(new Event("user-updated"));
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <div className="nav">
        <div className="left">
          <Link to="/">Home</Link>
          <Link to="/cart" className="nav-link">Cart</Link>
        </div>
        <div className="right">
          {user ? (
            <>
              <div className="user-logout">
                <span className="username">Hi,{user.name}</span>
                <button className="btn" onClick={logout}>Logout</button>
              </div>
            </>
          ) : (
            <Link to="/auth" className="nav-link">Login / Register</Link>
          )}
        </div>
      </div>

      <style>{`
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
        }
        .nav a {
          text-decoration: none;
          margin-right: 16px;
        }
        .right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-logout {
          display: flex;
          align-items: center;
          gap: 8px; /* space between username and logout button */
        }
        .username {
          font-weight: 600;
        }
        .btn {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
