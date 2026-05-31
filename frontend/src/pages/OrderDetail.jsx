import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { formatPrice } from "../utils/format";
import api, { getErrorMessage } from "../services/api";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load order"));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading order" />;
  }

  if (!order) {
    return <ErrorMessage message={error || "Order not found"} />;
  }

  return (
    <section className="stack">
      <Link className="back-link" to="/orders">
        Back to orders
      </Link>
      <div className="section-heading">
        <div>
          <h1>Order {order._id.slice(-8)}</h1>
          <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className="status-pill">{order.orderStatus}</span>
      </div>
      <ErrorMessage message={error} />

      <div className="checkout-layout">
        <div className="stack">
          <section className="panel">
            <h2>Items</h2>
            {order.orderItems.map((item) => (
              <div className="order-item" key={item.product}>
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="cart-image-placeholder" />}
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">
                    {item.qty} × ₹{formatPrice(item.price)}
                  </p>
                </div>
                <strong>₹{formatPrice(item.qty * item.price)}</strong>
              </div>
            ))}
          </section>

          <section className="panel">
            <h2>Shipping</h2>
            <p>{order.shippingAddress.fullName}</p>
            <p className="muted">
              {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
            </p>
            <p className="muted">{order.shippingAddress.phone}</p>
          </section>
        </div>

        <aside className="summary-panel">
          <h2>Payment</h2>
          <div className="summary-row">
            <span>Status</span>
            <strong>{order.isPaid ? "Paid" : "Pending"}</strong>
          </div>
          <div className="summary-row">
            <span>Method</span>
            <strong>{order.paymentMethod}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>₹{formatPrice(order.totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetail;
