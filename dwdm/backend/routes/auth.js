import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Cart from "../models/cart.js";
import Session from "../models/session.js";

const router = express.Router();

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET || "change_me", { expiresIn: "7d" });

// ---------- REGISTER ----------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // create empty cart and session
    const cart = await Cart.create({ user: user._id, items: [] });
    const token = createToken(user._id);
    await Session.findOneAndUpdate(
      { user: user._id },
      { user: user._id, token, cart: cart, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.json({ user: safeUser, token, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    let cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: user._id, items: [] });

    const token = createToken(user._id);
    await Session.findOneAndUpdate(
      { user: user._id },
      { user: user._id, token, cart: cart, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.json({ user: safeUser, token, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- LOGOUT ----------
// client should clear token; server will remove session for that token if present
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      await Session.deleteOne({ token });
    }
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- CURRENT USER ----------
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const cart = await Cart.findOne({ user: user._id }).populate("items.product");
    const safeUser = { id: user._id, name: user.name, email: user.email };
    res.json({ user: safeUser, cart });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
