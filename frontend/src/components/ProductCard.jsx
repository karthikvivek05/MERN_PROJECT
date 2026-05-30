import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const image = product.images?.[0];

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-link">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <div className="image-placeholder">{product.name.slice(0, 1)}</div>
        )}
      </Link>
      <div className="product-card-body">
        <div>
          <p className="muted small">{product.category}</p>
          <Link to={`/products/${product._id}`} className="product-title">
            {product.name}
          </Link>
        </div>
        <div className="rating-row">
          <Star size={16} aria-hidden="true" />
          <span>{product.averageRating?.toFixed?.(1) || "0.0"}</span>
          <span className="muted">({product.numReviews || 0})</span>
        </div>
        <div className="product-card-footer">
          <strong>₹{product.price}</strong>
          <button
            className="icon-button"
            type="button"
            disabled={product.stock < 1}
            onClick={() => addItem(product, 1)}
            title={product.stock < 1 ? "Out of stock" : "Add to cart"}
          >
            <ShoppingCart size={18} />
            <span className="sr-only">Add to cart</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
