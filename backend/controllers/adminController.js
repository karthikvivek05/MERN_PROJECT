const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getStats = asyncHandler(async (req, res) => {
  const [totalOrders, paidOrders, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.find({ isPaid: true }),
    Product.countDocuments(),
    User.countDocuments()
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    users
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Role must be user or admin");
  }

  if (req.params.id === req.user._id.toString() && role !== "admin") {
    res.status(400);
    throw new Error("You cannot remove your own admin access");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = {
  getStats,
  getUsers,
  updateUserRole
};
