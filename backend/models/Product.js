const mongoose = require("mongoose");
const reviewSchema = require("./Review");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: {
      type: [reviewSchema],
      default: []
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

productSchema.methods.recalculateRating = function recalculateRating() {
  this.numReviews = this.reviews.length;
  this.averageRating =
    this.numReviews === 0
      ? 0
      : this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.numReviews;
};

module.exports = mongoose.model("Product", productSchema);
