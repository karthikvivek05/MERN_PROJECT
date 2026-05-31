import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import api, { getErrorMessage } from "../services/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { isAdmin } = useAuth();
  useEffect(() => {
    if (isAdmin) navigate("/");
  }, [isAdmin]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const orderItems = items.map((item) => ({
    product: item.productId,
    qty: item.qty,
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Razorpay could not be loaded");
      }

      const { data } = await api.post("/payment/create-order", { orderItems });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "General Store",
        description: "Order payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verified = await api.post("/payment/verify", response);
            const created = await api.post("/orders", {
              orderItems,
              shippingAddress,
              paymentResult: verified.data.paymentResult,
            });
            clearCart();
            navigate(`/orders/${created.data.order._id}`);
          } catch (err) {
            setError(
              getErrorMessage(
                err,
                "Payment completed, but order creation failed",
              ),
            );
          } finally {
            setSubmitting(false);
          }
        },
        theme: {
          color: "#1f6feb",
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(getErrorMessage(err, err.message || "Checkout failed"));
      setSubmitting(false);
    }
  };

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>Checkout</h1>
          <p className="muted">Shipping details and Razorpay payment.</p>
        </div>
        <strong>₹{formatPrice(subtotal)}</strong>
      </div>
      <ErrorMessage message={error} />

      <div className="checkout-layout">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              value={shippingAddress.fullName}
              onChange={(event) =>
                setShippingAddress({
                  ...shippingAddress,
                  fullName: event.target.value,
                })
              }
              required
            />
          </label>
          <label>
            Address
            <textarea
              value={shippingAddress.address}
              onChange={(event) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: event.target.value,
                })
              }
              rows="3"
              required
            />
          </label>
          <div className="form-grid">
            <label>
              City
              <input
                value={shippingAddress.city}
                onChange={(event) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: event.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Pincode
              <input
                value={shippingAddress.pincode}
                onChange={(event) =>
                  setShippingAddress({
                    ...shippingAddress,
                    pincode: event.target.value,
                  })
                }
                required
              />
            </label>
          </div>
          <label>
            Phone
            <input
              value={shippingAddress.phone}
              onChange={(event) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: event.target.value,
                })
              }
              required
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={submitting || !items.length}
          >
            {submitting ? "Opening payment..." : "Pay with Razorpay"}
          </button>
        </form>

        <aside className="summary-panel">
          <h2>Order items</h2>
          {items.map((item) => (
            <div className="summary-row" key={item.productId}>
              <span>
                {item.name} × {item.qty}
              </span>
              <strong>₹{formatPrice(item.price * item.qty)}</strong>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <strong>₹{formatPrice(subtotal)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
