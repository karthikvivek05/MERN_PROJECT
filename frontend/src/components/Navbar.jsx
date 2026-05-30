import {
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
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
          <NavLink to="/products" onClick={() => setOpen(false)}>
            Products
          </NavLink>
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
                  Admin
                </NavLink>
              )}
              <button
                className="text-button"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
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
