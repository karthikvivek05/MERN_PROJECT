const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { getRazorpayClient, verifyRazorpaySignature } = require("../utils/razorpay");
const { buildPricedOrderItems } = require("../utils/cartPricing");

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems: incomingItems, shippingAddress, paymentResult } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const { orderItems, totalPrice } = await buildPricedOrderItems(incomingItems);

  if (!verifyRazorpaySignature(paymentResult || {})) {
    res.status(400);
    throw new Error("Verified Razorpay payment is required before creating an order");
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.fetch(paymentResult.razorpay_order_id);
  const expectedAmount = Math.round(totalPrice * 100);

  if (Number(razorpayOrder.amount) !== expectedAmount) {
    res.status(400);
    throw new Error("Payment amount does not match order total");
  }

  if (razorpayOrder.status !== "paid" && Number(razorpayOrder.amount_paid || 0) < expectedAmount) {
    res.status(400);
    throw new Error("Payment has not been completed");
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: "Razorpay",
    paymentResult: {
      id: paymentResult.razorpay_payment_id,
      status: "paid",
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_signature: paymentResult.razorpay_signature
    },
    isPaid: true,
    paidAt: new Date(),
    totalPrice
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
    )
  );

  res.status(201).json({
    success: true,
    order
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    orders
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const canView = isOwner || req.user.role === "admin";

  if (!canView) {
    res.status(403);
    throw new Error("Not allowed to view this order");
  }

  res.json({
    success: true,
    order
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus;
  order.deliveredAt = orderStatus === "Delivered" ? new Date() : undefined;

  const updatedOrder = await order.save();

  res.json({
    success: true,
    order: updatedOrder
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus
};
