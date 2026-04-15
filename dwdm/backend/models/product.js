import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: String,
    brand: String,
    price: { type: Number, required: true },
    image: String,
    description: String,
    stock: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
