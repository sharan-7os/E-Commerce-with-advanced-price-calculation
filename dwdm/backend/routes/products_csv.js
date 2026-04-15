
import express from "express";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";

const router = express.Router();

// Serve products from the provided CSV (cs_ecommerce_enhanced.csv)
// Assumes the csv file is located relative to project root at ../../../DWDM model/cs_ecommerce_enhanced.csv
router.get("/fromcsv", async (_req, res) => {
  try {
    const csvPath = path.resolve("./../../DWDM model/cs_ecommerce_enhanced.csv");
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: "CSV not found", path: csvPath });
    }
    const txt = fs.readFileSync(csvPath, "utf8");
    const records = parse(txt, { columns: true, skip_empty_lines: true });
    // filter unique product ids (assume product_id column)
    const byId = {};
    for (const r of records) {
      const id = r.product_id ?? r.productId ?? r.id ?? r.product;
      if (!id) continue;
      if (!byId[id]) {
        byId[id] = r;
      }
    }
    // take only first 32 unique products
    const products = Object.values(byId).slice(0, 32).map((r, idx) => ({
      _id: r.product_id ?? r.productId ?? String(idx+1),
      name: r.product_name ?? r.name ?? r.product_title ?? ("Product " + (idx+1)),
      price: Number(r.price ?? r.unit_price ?? r.list_price ?? 0) || 0,
      category: r.category ?? r.cat ?? "Unknown",
      brand: r.brand ?? "Brand",
      image: r.image ?? "/images/placeholder.png",
      raw: r
    }));
    res.json(products);
  } catch (err) {
    console.error("CSV read error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
