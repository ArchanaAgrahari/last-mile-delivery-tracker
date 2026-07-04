import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    pickupAddress: "",
    dropAddress: "",
    length: "",
    breadth: "",
    height: "",
    actualWeight: "",
    orderType: "B2C",
    paymentType: "Prepaid",
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setPreview(null);
  };

  const buildPayload = () => ({
    pickupAddress: formData.pickupAddress,
    dropAddress: formData.dropAddress,
    dimensions: {
      length: Number(formData.length),
      breadth: Number(formData.breadth),
      height: Number(formData.height),
    },
    actualWeight: Number(formData.actualWeight),
    orderType: formData.orderType,
    paymentType: formData.paymentType,
  });

  const handlePreview = async () => {
    setError("");
    try {
      const res = await axiosInstance.post("/orders/preview-charge", buildPayload());
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not calculate charge");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("/orders", buildPayload());
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto", padding: "20px" }}>
      <h2>Create Order</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Pickup Address</label>
          <input
            type="text"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Drop Address</label>
          <input
            type="text"
            name="dropAddress"
            value={formData.dropAddress}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div>
            <label>Length (cm)</label>
            <input type="number" name="length" value={formData.length} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
          <div>
            <label>Breadth (cm)</label>
            <input type="number" name="breadth" value={formData.breadth} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
          <div>
            <label>Height (cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Actual Weight (kg)</label>
          <input
            type="number"
            name="actualWeight"
            value={formData.actualWeight}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Order Type</label>
          <select name="orderType" value={formData.orderType} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
            <option value="B2C">B2C</option>
            <option value="B2B">B2B</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Payment Type</label>
          <select name="paymentType" value={formData.paymentType} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
            <option value="Prepaid">Prepaid</option>
            <option value="COD">COD</option>
          </select>
        </div>

        <button type="button" onClick={handlePreview} style={{ padding: "10px", marginRight: "10px" }}>
          Preview Charge
        </button>
        <button type="submit" disabled={loading} style={{ padding: "10px" }}>
          {loading ? "Creating..." : "Confirm Order"}
        </button>
      </form>

      {preview && (
        <div
          style={{
            marginTop: "15px",
            padding: "16px",
            background: "rgba(255, 122, 69, 0.08)",
            border: "1px solid rgba(255, 122, 69, 0.3)",
            borderRadius: "8px",
            color: "#f2f5f9",
          }}
        >
          <p style={{ margin: "4px 0" }}>Pickup Zone: {preview.pickupZone}</p>
          <p style={{ margin: "4px 0" }}>Drop Zone: {preview.dropZone}</p>
          <p style={{ margin: "4px 0" }}>Billed Weight: {preview.billedWeight} kg</p>
          <p style={{ margin: "8px 0 0", fontSize: "18px" }}>
            <strong style={{ color: "#ff7a45" }}>Estimated Charge: ₹{preview.charge}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;