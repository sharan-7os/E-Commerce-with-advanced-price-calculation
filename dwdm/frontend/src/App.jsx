import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";  // ✅ Import Toaster
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import ThankYou from "./pages/ThankYou";

import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="header-spacer" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>

      {/* ✅ Global Toast Handler */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
          },
        }}
      />
    </BrowserRouter>
  );
}
