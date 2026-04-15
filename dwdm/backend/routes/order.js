import express from "express";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const items = req.body.items || [];
    const normalized = [];
    let total = 0;
    for (const it of items) {
      const prodId = it.product?._id || it.product || it.productId;
      const qty = it.qty || 1;
      const product = await Product.findById(prodId);
      const price = product ? product.price : (it.price || 0);
      normalized.push({ product: prodId, qty, price });
      total += price * qty;
    }
    const order = await Order.create({ user: userId, items: normalized, total });
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

export default router;
