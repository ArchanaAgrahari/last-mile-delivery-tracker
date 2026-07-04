import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const [ordersRes, agentsRes] = await Promise.all([
        axiosInstance.get(`/orders${query}`),
        axiosInstance.get("/agents"),
      ]);
      setOrders(ordersRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleAssign = async (orderId) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/assign`, {});
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <Link to="/admin/zones"><button style={{ padding: "8px 15px" }}>Manage Zones</button></Link>
        <Link to="/admin/rate-cards"><button style={{ padding: "8px 15px" }}>Manage Rate Cards</button></Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "10px" }}>
        <label>Filter by Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "6px" }}>
          <option value="">All</option>
          <option value="Created">Created</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Transit">In Transit</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed">Failed</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
      </div>

      <h3>Orders ({orders.length})</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>Customer</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Agent</th>
              <th style={{ padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{order._id.slice(-6)}</td>
                <td style={{ padding: "8px" }}>{order.customer?.name}</td>
                <td style={{ padding: "8px" }}>{order.status}</td>
                <td style={{ padding: "8px" }}>{order.assignedAgent ? "Assigned" : "Unassigned"}</td>
                <td style={{ padding: "8px" }}>
                  {!order.assignedAgent && (
                    <button onClick={() => handleAssign(order._id)}>Auto-Assign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Agents ({agents.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Zone</th>
            <th style={{ padding: "8px" }}>Available</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent._id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{agent.user?.name}</td>
              <td style={{ padding: "8px" }}>{agent.zone?.name}</td>
              <td style={{ padding: "8px" }}>{agent.isAvailable ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;