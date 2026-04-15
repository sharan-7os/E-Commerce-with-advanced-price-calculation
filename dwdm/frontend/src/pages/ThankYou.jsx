import { useLocation, Link } from "react-router-dom";
export default function ThankYou() {
  const loc = useLocation();
  const order = loc.state?.order;
  return (
    <div style={{ padding: 20 }}>
      <h2>Thank you for your purchase!</h2>
      {order ? (
        <div>
          <p>Order ID: {order._id || order.id || "N/A"}</p>
          <p>Total items: {order.items?.length || 0}</p>
        </div>
      ) : (
        <p>Your order has been placed.</p>
      )}
      <p><Link to="/">Back to Home</Link></p>
    </div>
  );
}