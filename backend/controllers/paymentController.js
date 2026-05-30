const asyncHandler = require("../utils/asyncHandler");
const { getRazorpayClient, verifyRazorpaySignature } = require("../utils/razorpay");
const { buildPricedOrderItems } = require("../utils/cartPricing");

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderItems, currency = "INR" } = req.body;
  const { totalPrice } = await buildPricedOrderItems(orderItems);

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(totalPrice * 100),
    currency,
    receipt: `receipt_${Date.now()}`
  });

  res.status(201).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    order
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const verified = verifyRazorpaySignature(req.body);

  if (!verified) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  res.json({
    success: true,
    paymentResult: {
      id: req.body.razorpay_payment_id,
      status: "paid",
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature
    }
  });
});

module.exports = {
  createPaymentOrder,
  verifyPayment
};
