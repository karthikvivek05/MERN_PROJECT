import { Minus, Plus, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import api, { getErrorMessage } from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");

  const loadProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load product"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const submitReview = async (review) => {
    setReviewing(true);
    setError("");
    try {
      const { data } = await api.post(`/products/${id}/review`, review);
      setProduct(data.product);
    } catch (err) {
      setError(getErrorMessage(err, "Could not submit review"));
    } finally {
      setReviewing(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setError("");
    try {
      const url = reviewId ? `/products/${id}/review?reviewId=${reviewId}` : `/products/${id}/review`;
      const { data } = await api.delete(url);
      setProduct(data.product);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete review"));
    }
  };

  if (loading) {
    return <LoadingState label="Loading product" />;
  }

  if (!product) {
    return <ErrorMessage message={error || "Product not found"} />;
  }

  const hasReviewed = product.reviews?.some(
    (review) => review.user === user?.id,
  );

  return (
    <section className="stack">
      <Link className="back-link" to="/products">
        Back to products
      </Link>
      <ErrorMessage message={error} />

      <div className="product-detail-layout">
        <div className="product-media">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="detail-placeholder">{product.name.slice(0, 1)}</div>
          )}
          {product.images?.length > 1 && (
            <div className="thumbnail-row">
              {product.images.slice(1).map((image) => (
                <img src={image} alt={product.name} key={image} />
              ))}
            </div>
          )}
        </div>

        <div className="product-info stack">
          <div>
            <p className="muted">{product.category}</p>
            <h1>{product.name}</h1>
            <div className="rating-row">
              <Star size={18} aria-hidden="true" />
              <span>{product.averageRating.toFixed(1)}</span>
              <span className="muted">({product.numReviews} reviews)</span>
            </div>
          </div>
          <p>{product.description}</p>
          <div className="price-line">₹{formatPrice(product.price)}</div>
          {isAdmin && (
            <p className={product.stock > 0 ? "success-text" : "danger-text"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          )}
          <div className="buy-row">
            {!isAdmin && (
              <div className="stepper">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus size={16} />
                  <span className="sr-only">Decrease</span>
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={qty}
                  onChange={(event) =>
                    setQty(
                      Math.max(
                        1,
                        Math.min(Number(event.target.value), product.stock),
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  <Plus size={16} />
                  <span className="sr-only">Increase</span>
                </button>
              </div>
            )}
            {!isAdmin && (
              <button
                className="primary-button"
                type="button"
                disabled={product.stock < 1}
                onClick={() => addItem(product, qty)}
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <div className="section-heading">
          <h2>Reviews</h2>
        </div>
        {user && !isAdmin && !hasReviewed && (
          <ReviewForm onSubmit={submitReview} submitting={reviewing} />
        )}
        {!user && (
          <p className="muted">
            <Link to="/login">Login</Link> to write a review.
          </p>
        )}
        {product.reviews?.length ? (
          <div className="review-list">
            {product.reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="review-header">
                  <div>
                    <strong>{review.name}</strong>
                    <p className="muted small">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span>{review.rating}/5</span>
                </div>
                <p>{review.comment}</p>
                {(review.user === user?.id || isAdmin) && (
                  <button
                    className="text-button danger-text"
                    type="button"
                    onClick={() => deleteReview(review._id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No reviews yet.</div>
        )}
      </section>
    </section>
  );
};

export default ProductDetail;
