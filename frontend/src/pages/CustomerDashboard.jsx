import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/orders");
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Orders</h2>
        <Link to="/create-order">
          <button style={{ padding: "10px 15px" }}>+ New Order</button>
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet. Create your first order!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Order ID</th>
              <th style={{ padding: "8px" }}>Pickup</th>
              <th style={{ padding: "8px" }}>Drop</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Charge</th>
              <th style={{ padding: "8px" }}>Track</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{order._id.slice(-6)}</td>
                <td style={{ padding: "8px" }}>{order.pickupAddress}</td>
                <td style={{ padding: "8px" }}>{order.dropAddress}</td>
                <td style={{ padding: "8px" }}>{order.status}</td>
                <td style={{ padding: "8px" }}>₹{order.charge}</td>
                <td style={{ padding: "8px" }}>
                  <Link to={`/track/${order._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerDashboard;