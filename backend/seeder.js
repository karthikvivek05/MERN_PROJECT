require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Order = require("./models/Order");
const Product = require("./models/Product");
const User = require("./models/User");
const sampleProductImages = require("./data/sampleProductImages");

const sampleProducts = [
  {
    name: "Everyday Cotton T-Shirt",
    description: "Soft cotton T-shirt for daily use with a regular fit.",
    price: 499,
    category: "Fashion",
    stock: 50,
    images: sampleProductImages["Everyday Cotton T-Shirt"]
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "One litre insulated bottle that keeps drinks hot or cold.",
    price: 899,
    category: "Home & Kitchen",
    stock: 35,
    images: sampleProductImages["Stainless Steel Water Bottle"]
  },
  {
    name: "Wireless Bluetooth Earbuds",
    description: "Compact earbuds with charging case and clear call quality.",
    price: 1999,
    category: "Electronics",
    stock: 25,
    images: sampleProductImages["Wireless Bluetooth Earbuds"]
  },
  {
    name: "Notebook Pack of 5",
    description: "Ruled notebooks for school, office, and personal notes.",
    price: 299,
    category: "Stationery",
    stock: 80,
    images: sampleProductImages["Notebook Pack of 5"]
  },
  {
    name: "Yoga Mat",
    description: "Non-slip mat for yoga, stretching, and home workouts.",
    price: 799,
    category: "Fitness",
    stock: 40,
    images: sampleProductImages["Yoga Mat"]
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Durable ceramic mug with a clean matte finish.",
    price: 249,
    category: "Home & Kitchen",
    stock: 70,
    images: sampleProductImages["Ceramic Coffee Mug"]
  },
  {
    name: "Backpack",
    description: "Lightweight backpack with laptop sleeve and bottle pocket.",
    price: 1499,
    category: "Bags",
    stock: 30,
    images: sampleProductImages.Backpack
  },
  {
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp with three brightness levels.",
    price: 1199,
    category: "Electronics",
    stock: 20,
    images: sampleProductImages["Desk Lamp"]
  }
];

const defaultAdmin = {
  name: "Admin",
  email: "admin@nexcart.local"
};

const requireAdminSeed = () => {
  const { ADMIN_SEED_PASSWORD } = process.env;

  if (!ADMIN_SEED_PASSWORD) {
    throw new Error(
      "ADMIN_SEED_PASSWORD must be set in .env"
    );
  }

  return {
    name: defaultAdmin.name,
    email: defaultAdmin.email,
    password: ADMIN_SEED_PASSWORD,
    role: "admin"
  };
};

const importData = async () => {
  await connectDB();

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const adminUser = await User.create(requireAdminSeed());
  const products = sampleProducts.map((product) => ({
    ...product,
    createdBy: adminUser._id
  }));

  await Product.insertMany(products);

  console.log("Seed data imported");
  await mongoose.disconnect();
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  console.log("Data destroyed");
  await mongoose.disconnect();
  process.exit(0);
};

const run = async () => {
  try {
    if (process.argv.includes("--destroy")) {
      await destroyData();
      return;
    }

    await importData();
  } catch (error) {
    console.error(error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
