import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "general-store-cart";

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    if (!product.stock || Number(qty) < 1) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.productId === product._id);
      const nextQty = Math.min(
        (existing?.qty || 0) + Number(qty),
        product.stock,
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product._id ? { ...item, qty: nextQty } : item,
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          qty: Math.min(Number(qty), product.stock),
          stock: product.stock,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: Math.max(1, Math.min(Number(qty), item.stock)) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (productId) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({
      items,
      subtotal,
      itemCount,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [items, subtotal, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
