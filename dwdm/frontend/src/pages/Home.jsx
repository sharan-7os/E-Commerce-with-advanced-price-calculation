import { useEffect, useState } from "react";
import API from "../api/api";   // ✅ default import (no curly braces)
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const useCsv = new URLSearchParams(window.location.search).get("useCsv") === "1";

  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await API.get(useCsv ? "/products/fromcsv" : "/products");
      setProducts(data);
    })();
  }, []);

  return (
    
    <div className="container">
      {msg && (
        <div
          style={{
            background: "#fff",
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}
      <div className="grid">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            p={p}
            onAdded={() => setMsg("Added to cart!")}
          />
        ))}
      </div>
    </div>
  );
}
