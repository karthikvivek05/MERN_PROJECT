import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { items, subtotal, clearCart } = useCart();

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>Cart</h1>
          <p className="muted">Review quantities before checkout.</p>
        </div>
        {items.length > 0 && (
          <button className="secondary-button" type="button" onClick={clearCart}>
            Clear cart
          </button>
        )}
      </div>

      {items.length ? (
        <div className="cart-layout">
          <div className="stack">
            {items.map((item) => (
              <CartItem item={item} key={item.productId} />
            ))}
          </div>
          <aside className="summary-panel">
            <h2>Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <p className="muted small">Shipping and final stock validation are handled during checkout.</p>
            <Link className="primary-button full-width" to="/checkout">
              Checkout
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={32} aria-hidden="true" />
          <p>Your cart is empty.</p>
          <Link className="primary-button" to="/products">
            Browse products
          </Link>
        </div>
      )}
    </section>
  );
};

export default Cart;
