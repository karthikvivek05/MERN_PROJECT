import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="cart-item">
      {item.image ? (
        <img src={item.image} alt={item.name} />
      ) : (
        <div className="cart-image-placeholder">{item.name.slice(0, 1)}</div>
      )}
      <div className="cart-item-main">
        <Link to={`/products/${item.productId}`} className="product-title">
          {item.name}
        </Link>
        <p className="muted">₹{item.price} each</p>
      </div>
      <div className="stepper" aria-label={`Quantity for ${item.name}`}>
        <button type="button" onClick={() => updateQty(item.productId, item.qty - 1)}>
          <Minus size={16} />
          <span className="sr-only">Decrease</span>
        </button>
        <input
          type="number"
          min="1"
          max={item.stock}
          value={item.qty}
          onChange={(event) => updateQty(item.productId, event.target.value)}
          aria-label="Quantity"
        />
        <button type="button" onClick={() => updateQty(item.productId, item.qty + 1)}>
          <Plus size={16} />
          <span className="sr-only">Increase</span>
        </button>
      </div>
      <strong>₹{item.price * item.qty}</strong>
      <button className="icon-button danger" type="button" onClick={() => removeItem(item.productId)}>
        <Trash2 size={18} />
        <span className="sr-only">Remove</span>
      </button>
    </div>
  );
};

export default CartItem;
