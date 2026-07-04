import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "#222",
        color: "#fff",
      }}
    >
      <Link to="/" style={{ color: "#fff", fontWeight: "bold", textDecoration: "none" }}>
        Delivery Tracker
      </Link>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button onClick={handleLogout} style={{ padding: "6px 12px" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff" }}>Login</Link>
            <Link to="/register" style={{ color: "#fff" }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;