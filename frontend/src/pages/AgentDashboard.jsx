import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["Picked Up", "In Transit", "Out for Delivery", "Delivered", "Failed"];

const AgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusChoice, setStatusChoice] = useState({});
  const [failureReason, setFailureReason] = useState({});

  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get(`/orders?agent=${user._id}`);
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (orderId, value) => {
    setStatusChoice({ ...statusChoice, [orderId]: value });
  };

  const handleReasonChange = (orderId, value) => {
    setFailureReason({ ...failureReason, [orderId]: value });
  };

  const handleUpdate = async (orderId) => {
    const status = statusChoice[orderId];
    if (!status) return;

    setError("");
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, {
        status,
        failureReason: status === "Failed" ? failureReason[orderId] || "" : "",
      });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "20px" }}>
      <h2>Agent Dashboard</h2>
      <p style={{ color: "#666" }}>Assigned Orders</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders assigned to you right now.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <p><strong>Order ID:</strong> {order._id.slice(-6)}</p>
            <p><strong>Pickup:</strong> {order.pickupAddress}</p>
            <p><strong>Drop:</strong> {order.dropAddress}</p>
            <p><strong>Current Status:</strong> {order.status}</p>

            {order.status !== "Delivered" && (
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  value={statusChoice[order._id] || ""}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  style={{ padding: "6px" }}
                >
                  <option value="">-- Update Status --</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {statusChoice[order._id] === "Failed" && (
                  <input
                    type="text"
                    placeholder="Failure reason"
                    value={failureReason[order._id] || ""}
                    onChange={(e) => handleReasonChange(order._id, e.target.value)}
                    style={{ padding: "6px" }}
                  />
                )}

                <button onClick={() => handleUpdate(order._id)} style={{ padding: "6px 12px" }}>
                  Update
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AgentDashboard;