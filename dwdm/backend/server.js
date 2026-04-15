import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";


dotenv.config();
const app = express();
app.use("/images", express.static("images"));

app.use(cors({ origin:[ "http://localhost:5173","http://10.180.151.11:5173"], credentials: true, allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
import path from "path";
import fs from "fs";
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));


app.get("/", (_req, res) => res.send("API OK"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", (await import("./routes/products_csv.js")).default);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", (await import("./routes/order.js")).default);

const PORT = process.env.PORT || 5500;


const start = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  });
};

start();
