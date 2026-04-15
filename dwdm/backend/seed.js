import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import Product from "./models/product.js";

const products = [
  { sku: "P001", name: "Lenovo ThinkPad", category: "Laptop", brand: "Lenovo", price: 75000, image: "/images/thinkpad.jpg", description: "Business-class laptop." },
  { sku: "P002", name: "Dell Inspiron 15", category: "Laptop", brand: "Dell", price: 68000, image: "/images/inspiron.jpg", description: "Everyday performance laptop." },
  { sku: "P003", name: "Asus ZenBook", category: "Laptop", brand: "Asus", price: 72000, image: "/images/zenbook.jpg", description: "Slim ultrabook for creators." },
  { sku: "P004", name: "HP Pavilion", category: "Laptop", brand: "HP", price: 65000, image: "/images/pavilion.jpg", description: "Balanced laptop for students." },
  { sku: "P005", name: "Seagate 1TB HDD", category: "Storage", brand: "Seagate", price: 3500, image: "/images/seagate.jpg", description: "1TB external hard drive." },
  { sku: "P006", name: "WD 2TB HDD", category: "Storage", brand: "Western Digital", price: 4200, image: "/images/wd.jpg", description: "2TB WD HDD." },
  { sku: "P007", name: "Corsair 8GB RAM", category: "Memory", brand: "Corsair", price: 2800, image: "/images/corsair.jpg", description: "DDR4 8GB module." },
  { sku: "P008", name: "Kingston 16GB RAM", category: "Memory", brand: "Kingston", price: 5200, image: "/images/kingston.jpg", description: "DDR4 16GB module." },
  { sku: "P009", name: "Dell 24-inch Monitor", category: "Monitor", brand: "Dell", price: 12000, image: "/images/dell-monitor.jpg", description: "1080p IPS monitor." },
  { sku: "P010", name: "Samsung 27-inch Monitor", category: "Monitor", brand: "Samsung", price: 18000, image: "/images/samsung-monitor.jpg", description: "27” 144Hz monitor." },
  { sku: "P011", name: "AmazonBasics HDMI Cable", category: "Accessory", brand: "AmazonBasics", price: 600, image: "/images/hdmi.jpg", description: "High-speed HDMI cable." },
  { sku: "P012", name: "Logitech Wireless Mouse", category: "Accessory", brand: "Logitech", price: 900, image: "/images/mouse.jpg", description: "Ergonomic wireless mouse." }
];

const run = async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log("✅ Seeded products");
  process.exit(0);
};
run();
