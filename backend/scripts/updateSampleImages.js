require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const sampleProductImages = require("../data/sampleProductImages");

const updateSampleImages = async () => {
  await connectDB();

  let updated = 0;

  for (const [name, images] of Object.entries(sampleProductImages)) {
    const result = await Product.updateOne({ name }, { $set: { images } });
    updated += result.modifiedCount;
  }

  console.log(`Sample images updated for ${updated} product(s)`);
  await mongoose.disconnect();
};

updateSampleImages().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
