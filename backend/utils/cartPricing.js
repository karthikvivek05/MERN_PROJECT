const Product = require("../models/Product");

const buildPricedOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required");
  }

  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const productId = item.product || item.productId;
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("One or more products were not found");
    }

    const qty = Number(item.qty);
    if (!qty || qty < 1) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (product.stock < qty) {
      throw new Error(`${product.name} has only ${product.stock} item(s) in stock`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      qty,
      price: product.price,
      image: product.images[0] || ""
    });
    totalPrice += product.price * qty;
  }

  return { orderItems, totalPrice };
};

module.exports = {
  buildPricedOrderItems
};
