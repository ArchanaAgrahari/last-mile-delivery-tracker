import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminZones = () => {
  const [zones, setZones] = useState([]);
  const [name, setName] = useState("");
  const [areas, setAreas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    try {
      const res = await axiosInstance.get("/zones");
      setZones(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const areasArray = areas.split(",").map((a) => a.trim()).filter(Boolean);
      await axiosInstance.post("/zones", { name, areas: areasArray });
      setName("");
      setAreas("");
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create zone");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/zones/${id}`);
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete zone");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "20px" }}>
      <h2>Manage Zones</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5" }}>
        <h3>Add New Zone</h3>
        <div style={{ marginBottom: "10px" }}>
          <label>Zone Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. North Zone"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Areas (comma separated)</label>
          <input
            type="text"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            required
            placeholder="e.g. Kanpur, Lucknow, Kanpur Nagar"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 15px" }}>Add Zone</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Zone Name</th>
              <th style={{ padding: "8px" }}>Areas</th>
              <th style={{ padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{zone.name}</td>
                <td style={{ padding: "8px" }}>{zone.areas.join(", ")}</td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => handleDelete(zone._id)} style={{ color: "red" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminZones;