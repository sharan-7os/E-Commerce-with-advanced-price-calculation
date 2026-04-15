import express from "express";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Session from "../models/session.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

async function saveSession(userId, token, cartDoc) {
  try {
    await Session.findOneAndUpdate(
      { user: userId },
      { user: userId, token, cart: cartDoc, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Failed to save session:", err.message);
  }
}

// get my cart
router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  res.json(cart || { user: req.userId, items: [] });
});

// add item
router.post("/add", auth, async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    cart = await Cart.create({ user: req.userId, items: [{ product: product._id, qty }] });
  } else {
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) cart.items.push({ product: product._id, qty });
    else cart.items[idx].qty += qty;
  }

  await cart.save();
  const populated = await cart.populate("items.product");
  // save into session as well
  await saveSession(req.userId, req.token, populated);
  res.json(populated);
});

// update item qty / remove
router.post("/update", auth, async (req, res) => {
  const { productId, qty } = req.body;
  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx === -1) return res.status(404).json({ message: "Item not in cart" });
  if (qty <= 0) cart.items.splice(idx, 1); else cart.items[idx].qty = qty;

  await cart.save();
  const populated = await cart.populate("items.product");
  await saveSession(req.userId, req.token, populated);
  res.json(populated);
});

// clear cart
router.post("/clear", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.json({ items: [] });
  cart.items = [];
  await cart.save();
  const populated = await cart.populate("items.product");
  await saveSession(req.userId, req.token, populated);
  res.json(populated);
});


// remove item by productId
router.delete("/:productId", auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const originalCount = cart.items.length;
    cart.items = cart.items.filter(i => i.product.toString() !== productId);

    if (cart.items.length === originalCount) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    await saveSession(userId, req.token, populated);
    res.json({ cart: populated });
  } catch (err) {
    console.error("Cart delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
