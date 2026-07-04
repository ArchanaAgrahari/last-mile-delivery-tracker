import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const OrderTracking = () => {
  const { id } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${id}/timeline`);
        setTimeline(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tracking info");
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [id]);

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
      <h2>Order Tracking</h2>
      <p style={{ color: "#666" }}>Order ID: {id}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {timeline.map((event, index) => (
            <div
              key={event._id}
              style={{
                borderLeft: "3px solid #4CAF50",
                paddingLeft: "15px",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#4CAF50",
                  borderRadius: "50%",
                  position: "absolute",
                  left: "-8px",
                  top: "2px",
                }}
              />
              <strong>{event.status}</strong>
              <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                {new Date(event.timestamp).toLocaleString()}
              </p>
              {event.note && <p style={{ margin: 0, fontSize: "14px" }}>Note: {event.note}</p>}
              <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>By: {event.actorRole}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;