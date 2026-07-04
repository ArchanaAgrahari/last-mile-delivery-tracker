import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminRateCards = () => {
  const [rateCards, setRateCards] = useState([]);
  const [formData, setFormData] = useState({
    orderType: "B2C",
    intraZoneRatePerKg: "",
    interZoneRatePerKg: "",
    baseCharge: "",
    codSurcharge: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRateCards = async () => {
    try {
      const res = await axiosInstance.get("/rate-cards");
      setRateCards(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rate cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateCards();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axiosInstance.post("/rate-cards", {
        orderType: formData.orderType,
        intraZoneRatePerKg: Number(formData.intraZoneRatePerKg),
        interZoneRatePerKg: Number(formData.interZoneRatePerKg),
        baseCharge: Number(formData.baseCharge) || 0,
        codSurcharge: Number(formData.codSurcharge) || 0,
      });
      setFormData({
        orderType: "B2C",
        intraZoneRatePerKg: "",
        interZoneRatePerKg: "",
        baseCharge: "",
        codSurcharge: "",
      });
      fetchRateCards();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create rate card");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "20px" }}>
      <h2>Manage Rate Cards</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5" }}>
        <h3>Add New Rate Card</h3>
        <div style={{ marginBottom: "10px" }}>
          <label>Order Type</label>
          <select name="orderType" value={formData.orderType} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
            <option value="B2C">B2C</option>
            <option value="B2B">B2B</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Intra-Zone Rate (per kg)</label>
          <input type="number" name="intraZoneRatePerKg" value={formData.intraZoneRatePerKg} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Inter-Zone Rate (per kg)</label>
          <input type="number" name="interZoneRatePerKg" value={formData.interZoneRatePerKg} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Base Charge</label>
          <input type="number" name="baseCharge" value={formData.baseCharge} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>COD Surcharge</label>
          <input type="number" name="codSurcharge" value={formData.codSurcharge} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
        </div>
        <button type="submit" style={{ padding: "8px 15px" }}>Add Rate Card</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Type</th>
              <th style={{ padding: "8px" }}>Intra-Zone</th>
              <th style={{ padding: "8px" }}>Inter-Zone</th>
              <th style={{ padding: "8px" }}>Base</th>
              <th style={{ padding: "8px" }}>COD Surcharge</th>
            </tr>
          </thead>
          <tbody>
            {rateCards.map((rc) => (
              <tr key={rc._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{rc.orderType}</td>
                <td style={{ padding: "8px" }}>₹{rc.intraZoneRatePerKg}/kg</td>
                <td style={{ padding: "8px" }}>₹{rc.interZoneRatePerKg}/kg</td>
                <td style={{ padding: "8px" }}>₹{rc.baseCharge}</td>
                <td style={{ padding: "8px" }}>₹{rc.codSurcharge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRateCards;