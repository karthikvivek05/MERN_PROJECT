const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const { uploadFilesToCloudinary } = require("../utils/uploadToCloudinary");

const parseImageInput = (images) => {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string") {
    const trimmed = images.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }

    return trimmed.split(",").map((image) => image.trim()).filter(Boolean);
  }

  return [];
};

const getProductImages = async (req) => {
  const uploadedImages = req.files?.length ? await uploadFilesToCloudinary(req.files) : [];
  const bodyImages = parseImageInput(req.body.images);
  return [...bodyImages, ...uploadedImages];
};

const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    rating,
    sort = "newest",
    page = 1,
    limit = 8
  } = req.query;

  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (rating) {
    query.averageRating = { $gte: Number(rating) };
  }

  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
    "top-rated": { averageRating: -1, numReviews: -1 }
  };

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (pageNumber - 1) * pageSize;

  const [products, total, categories] = await Promise.all([
    Product.find(query).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(pageSize),
    Product.countDocuments(query),
    Product.distinct("category")
  ]);

  res.json({
    success: true,
    products,
    categories,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      limit: pageSize
    }
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    product
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const images = await getProductImages(req);
  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    images
  });

  res.status(201).json({
    success: true,
    product
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const images = await getProductImages(req);
  const fields = ["name", "description", "price", "category", "stock"];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (images.length > 0 || req.body.images !== undefined) {
    product.images = images;
  }

  const updatedProduct = await product.save();

  res.json({
    success: true,
    product: updatedProduct
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted"
  });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Rating and comment are required");
  }

  const alreadyReviewed = product.reviews.some(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(409);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  });

  product.recalculateRating();
  await product.save();

  res.status(201).json({
    success: true,
    product
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let review;
  if (req.user.role === "admin" && req.query.reviewId) {
    review = product.reviews.find(
      (item) => item._id.toString() === req.query.reviewId.toString()
    );
  } else {
    review = product.reviews.find(
      (item) => item.user.toString() === req.user._id.toString()
    );
  }

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  product.reviews.pull(review._id);
  product.recalculateRating();
  await product.save();

  res.json({
    success: true,
    product
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview
};
