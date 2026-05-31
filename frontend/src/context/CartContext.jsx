import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const loadedUserIdRef = useRef(null);

  // Load user-specific cart when user changes
  useEffect(() => {
    if (user) {
      if (loadedUserIdRef.current !== user.id) {
        const storageKey = `general-store-cart-${user.id}`;
        try {
          const loaded = JSON.parse(localStorage.getItem(storageKey)) || [];
          setItems(loaded);
        } catch {
          setItems([]);
        }
        loadedUserIdRef.current = user.id;
      }
    } else {
      setItems([]);
      loadedUserIdRef.current = null;
    }
  }, [user]);

  // Save to user-specific localStorage key when items or user changes
  useEffect(() => {
    if (user && loadedUserIdRef.current === user.id) {
      const storageKey = `general-store-cart-${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = (product, qty = 1) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
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

  const activeItems = user ? items : [];
  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = activeItems.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({
      items: activeItems,
      subtotal,
      itemCount,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [activeItems, subtotal, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
