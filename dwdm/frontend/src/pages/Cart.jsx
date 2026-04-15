import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    try {
      return saved ? JSON.parse(saved) : { items: [] };
    } catch (e) {
      console.error("Invalid cart data in localStorage, resetting.");
      return { items: [] };
    }
  });
  const [loading, setLoading] = useState(false);
  const [mlRecs, setMlRecs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ml_recs") || "{}");
    } catch (e) {
      return {};
    }
  });
  const [buying, setBuying] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    try {
      const { data } = await API.get("/cart");
      const safe = data?.cart ?? data ?? { items: [] };
      setCart(safe);
      try {
        localStorage.setItem("cart", JSON.stringify(safe));
      } catch (e) {}
    } catch (err) {
      console.error("Cart load failed:", err);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () =>
      (cart.items || []).reduce((sum, it) => {
        const price = it.product?.price ?? it.price ?? 0;
        const qty = it.qty ?? 1;
        return sum + price * qty;
      }, 0),
    [cart]
  );

  const updateQty = async (id, qty) => {
    try {
      const { data } = await API.post("/cart/update", { productId: id, qty });
      const safe = data?.cart ?? data ?? { items: [] };
      setCart(safe);
      try {
        localStorage.setItem("cart", JSON.stringify(safe));
      } catch (e) {}
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    try {
      const res = await API.delete(`/cart/${productId}`);
      const safe = res.data?.cart ?? res.data ?? { items: [] };
      setCart(safe);
      try {
        localStorage.setItem("cart", JSON.stringify(safe));
      } catch (e) {}
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      console.error("Remove failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!cart?.items?.length) return;
    setBuying(true);
    try {
      const res = await API.post("/orders", { items: cart.items });
      setCart({ items: [] });
      try {
        localStorage.setItem("cart", JSON.stringify({ items: [] }));
      } catch (e) {}
      window.dispatchEvent(new Event("user-updated"));
      nav("/thank-you", { state: { order: res.data.order } });
    } catch (err) {
      console.error("Buy failed:", err.response?.data || err.message);
      alert("Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  if (!cart?.items?.length) return <h3>Your cart is empty</h3>;

  return (
    <div className="container">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {cart.items.map((it) => {
          const product = it.product || {};
          const name = product.name || it.name || "Product";
          const price = product.price ?? it.price ?? 0;
          const qty = it.qty ?? 1;
          const imgPath = product.image || it.image || "/images/placeholder.png";

          // Ensure proper full image URL
          const fullImgUrl =
            imgPath.startsWith("http") || imgPath.startsWith("/")
              ? `http://localhost:5500${imgPath}`
              : `http://localhost:5500/images/${imgPath}`;

          return (
            <div
              key={product._id || it.product || name}
              className="cart-item"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
                background: "#fff",
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {/* 🖼 Uniform Image */}
              <div
                style={{
                  width: 120,
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                  flexShrink: 0,
                }}
              >
                <img
                  src={fullImgUrl}
                  alt={name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/placeholder.png";
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{name}</div>
                <div>Price: ₹{price.toLocaleString()}</div>

                {/* 💡 ML Recommendation */}
                {mlRecs && mlRecs[product._id || it.product] ? (
                  <div
                    style={{
                      marginTop: 8,
                      background: "#f7f7f7",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      Recommendation:{" "}
                      {mlRecs[product._id || it.product].recommendation}
                    </div>
                  </div>
                ) : null}

                {/* 🧮 Quantity Controls */}
                <div style={{ marginTop: 8 }}>
                  <button
                    className="btn"
                    onClick={() =>
                      updateQty(product._id || it.product, Math.max(1, qty - 1))
                    }
                  >
                    -
                  </button>
                  <span style={{ margin: "0 8px" }}>{qty}</span>
                  <button
                    className="btn"
                    onClick={() =>
                      updateQty(product._id || it.product, qty + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 🗑 Remove Button */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => removeItem(product._id || it.product)}
                  disabled={loading}
                >
                  {loading ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🧾 Total Section */}
      <div style={{ marginTop: 20 }}>
        <h3>Total: ₹{total.toLocaleString()}</h3>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={handleBuy} disabled={buying}>
            {buying ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
