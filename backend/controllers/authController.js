const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const { setAuthCookies, clearAuthCookies } = require("../utils/generateToken");

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  setAuthCookies(res, user);

  res.status(201).json({
    success: true,
    user: userResponse(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  setAuthCookies(res, user);

  res.json({
    success: true,
    user: userResponse(user)
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error("Refresh token missing");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.tokenType !== "refresh") {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  setAuthCookies(res, user);

  res.json({
    success: true,
    user: userResponse(user)
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);

  res.json({
    success: true,
    message: "Logged out"
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: userResponse(req.user)
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe
};
