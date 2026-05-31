import {
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  ChevronDown,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(
      `/products${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ""}`,
    );
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setOpen(false);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((current) => !current);
  };

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <Package size={22} aria-hidden="true" />
          <span>NexCart</span>
        </Link>

        <form className="nav-search" onSubmit={submitSearch}>
          <Search size={18} aria-hidden="true" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
        </form>

        <button
          className="icon-button mobile-menu"
          type="button"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">Menu</span>
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink
            to="/cart"
            className="cart-link"
            onClick={() => setOpen(false)}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span>Cart</span>
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/orders" onClick={() => setOpen(false)}>
                Orders
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
              )}
              <div className="user-menu">
                <button
                  className="text-button user-menu-trigger"
                  type="button"
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <UserRound size={18} aria-hidden="true" />
                  <span>{user.name}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                {userMenuOpen && (
                  <div className="user-menu-dropdown" role="menu">
                    <button
                      className="user-menu-item"
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)}>
              <UserRound size={18} aria-hidden="true" />
              <span>Login</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
