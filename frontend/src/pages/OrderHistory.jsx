import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { formatPrice } from "../utils/format";
import api, { getErrorMessage } from "../services/api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data.orders);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load orders"));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <LoadingState label="Loading orders" />;
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>Order history</h1>
          <p className="muted">View your placed orders and payment status.</p>
        </div>
      </div>
      <ErrorMessage message={error} />

      {orders.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{formatPrice(order.totalPrice)}</td>
                  <td>{order.isPaid ? "Paid" : "Pending"}</td>
                  <td>{order.orderStatus}</td>
                  <td>
                    <Link className="icon-button" to={`/orders/${order._id}`}>
                      <Eye size={18} />
                      <span className="sr-only">View order</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">You have not placed any orders.</div>
      )}
    </section>
  );
};

export default OrderHistory;
