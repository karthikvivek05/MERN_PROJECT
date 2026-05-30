import { Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingState from "../components/LoadingState.jsx";
import api, { getErrorMessage } from "../services/api";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  images: ""
};

const tabs = ["overview", "products", "orders", "users"];
const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, productsRes, ordersRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/products", { params: { limit: 50 } }),
        api.get("/orders"),
        api.get("/admin/users")
      ]);

      setStats(statsRes.data.stats);
      setProducts(productsRes.data.products);
      setOrders(ordersRes.data.orders);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const productPayload = useMemo(
    () => ({
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      images: productForm.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
    }),
    [productForm]
  );

  const resetProductForm = () => {
    setProductForm(emptyProduct);
    setEditingId("");
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images?.join(", ") || ""
    });
    setActiveTab("products");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, productPayload);
        setProducts((current) =>
          current.map((product) => (product._id === editingId ? data.product : product))
        );
        setNotice("Product updated.");
      } else {
        const { data } = await api.post("/products", productPayload);
        setProducts((current) => [data.product, ...current]);
        setNotice("Product created.");
      }

      resetProductForm();
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    setError("");
    setNotice("");

    try {
      await api.delete(`/products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
      setNotice("Product deleted.");
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete product"));
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    setError("");
    setNotice("");

    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { orderStatus });
      setOrders((current) => current.map((order) => (order._id === orderId ? data.order : order)));
      setNotice("Order status updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update order"));
    }
  };

  const updateUserRole = async (userId, role) => {
    setError("");
    setNotice("");

    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((current) => current.map((user) => (user._id === userId ? { ...user, ...data.user } : user)));
      setNotice("User role updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update user"));
    }
  };

  if (loading) {
    return <LoadingState label="Loading admin dashboard" />;
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>Admin dashboard</h1>
          <p className="muted">Manage store data and operations.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadAdminData}>
          <RefreshCw size={18} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="tab-list" role="tablist" aria-label="Admin sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />
      {notice && <div className="alert alert-success">{notice}</div>}

      {activeTab === "overview" && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>Total orders</span>
            <strong>{stats?.totalOrders || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Total revenue</span>
            <strong>₹{stats?.totalRevenue || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Total products</span>
            <strong>{stats?.totalProducts || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Total users</span>
            <strong>{stats?.totalUsers || 0}</strong>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="admin-grid">
          <form className="form panel" onSubmit={saveProduct}>
            <div className="form-title-row">
              <h2>{editingId ? "Edit product" : "Create product"}</h2>
              {editingId && (
                <button className="icon-button" type="button" onClick={resetProductForm}>
                  <X size={18} />
                  <span className="sr-only">Cancel edit</span>
                </button>
              )}
            </div>
            <label>
              Name
              <input
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                rows="4"
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Category
              <input
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                required
              />
            </label>
            <label>
              Image URLs
              <textarea
                rows="3"
                value={productForm.images}
                onChange={(event) => setProductForm({ ...productForm, images: event.target.value })}
                placeholder="Comma separated URLs"
              />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {editingId ? <Save size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              {saving ? "Saving..." : editingId ? "Save product" : "Create product"}
            </button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock}</td>
                    <td className="table-actions">
                      <button className="icon-button" type="button" onClick={() => editProduct(product)}>
                        <Edit3 size={18} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => deleteProduct(product._id)}>
                        <Trash2 size={18} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>
                  <td>{order.user?.email || "Unknown"}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{order.isPaid ? "Yes" : "No"}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select value={user.role} onChange={(event) => updateUserRole(user._id, event.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
