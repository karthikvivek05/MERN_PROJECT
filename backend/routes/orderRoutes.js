const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, isAdmin, getOrders);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;
