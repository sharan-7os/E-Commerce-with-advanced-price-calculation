import { useState, useEffect } from "react";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";

export default function ProductCard({ p, onAdded }) {
  const [mlRec, setMlRec] = useState(null);
  const [bestTime, setBestTime] = useState(null);

  // Fetch Best Time to Buy
  useEffect(() => {
    const fetchBestTime = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/recommendation?product_id=${p.product_id}`
        );
        const text = await res.text();
        setBestTime(text && text !== "No data available" ? text : "No data available");
      } catch (err) {
        console.error("Best Time fetch error:", err);
        setBestTime("Not available");
      }
    };
    fetchBestTime();
  }, [p.product_id]);

  // Add to Cart + get ML recommendation
  const addToCart = async () => {
    try {
      const { data } = await API.post("/cart/add", { productId: p._id, qty: 1 });

      // Store cart locally
      try {
        const toStore = { ...data };
        const existing = JSON.parse(localStorage.getItem("ml_recs") || "{}");
        if (existing && existing[p._id]) {
          toStore.ml_recs = existing;
        }
        localStorage.setItem("cart", JSON.stringify(toStore));
      } catch (e) {}

      // Toast notification
      toast.success(`${p.name} added to cart!`);

      onAdded && onAdded(data);

      // Call Flask ML recommendation
      try {
        const resp = await fetch(
          `http://localhost:5000/api/recommendation?product_id=${p.product_id}&current_price=${p.price}`
        );
        if (!resp.ok) throw new Error("Flask ML API failed");
        const resultText = await resp.text();
        setMlRec({ recommendation: resultText });

        const existing = JSON.parse(localStorage.getItem("ml_recs") || "{}");
        existing[p._id] = { recommendation: resultText };
        localStorage.setItem("ml_recs", JSON.stringify(existing));

        // update cart cache
        try {
          const cartObj = JSON.parse(localStorage.getItem("cart") || "{}");
          cartObj.ml_recs = existing;
          localStorage.setItem("cart", JSON.stringify(cartObj));
        } catch (e) {}
      } catch (err) {
        console.error("ML fetch error:", err.message);
        toast.error("Failed to fetch ML recommendation");
      }
    } catch (err) {
      console.error("❌ Add to cart error:", err.response?.data || err.message);
      toast.error(`Failed to add ${p.name} to cart!`);
    }
  };

  return (
    <div className="card">
      {/* Image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <img
          src={`http://localhost:5500${p.image}`}
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>

      {/* Product Info */}
      <div style={{ fontWeight: 600 }}>{p.name}</div>
      <div style={{ fontSize: 13, color: "#555" }}>
        {p.brand} • {p.category}
      </div>

      <div className="price" style={{ marginBottom: 4 }}>
        ₹{p.price.toLocaleString()}
      </div>

      {/* Best Time */}
      {bestTime && (
        <div style={{ fontSize: 13, color: "#007b55", marginBottom: 8 }}>
          🕒 <strong>Best Time to Buy:</strong> {bestTime}
        </div>
      )}

      <button className="btn" onClick={addToCart}>
        Add to Cart
      </button>

      {/* ML Recommendation */}
      {mlRec && mlRec.recommendation && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 6,
            background: "#f7f7f7",
          }}
        >
          <div style={{ fontWeight: 700 }}>
            Recommendation: {mlRec.recommendation}
          </div>
        </div>
      )}

      {/* React Hot Toast */}
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
    </div>
  );
}
