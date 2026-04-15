import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  qty: { type: Number, default: 1, min: 1 }
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    token: { type: String },
    cart: {
      items: [cartItemSchema]
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
