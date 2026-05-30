const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, isAdmin, upload.array("images", 6), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, isAdmin, upload.array("images", 6), updateProduct)
  .delete(protect, isAdmin, deleteProduct);

router
  .route("/:id/review")
  .post(protect, addReview)
  .delete(protect, deleteReview);

module.exports = router;
