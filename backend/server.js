import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import rateCardRoutes from "./routes/rateCardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Last-Mile Delivery Tracker API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/rate-cards", rateCardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/agents", agentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Prevent crash from malformed/TLS requests hitting the HTTP server
server.on("clientError", (err, socket) => {
  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

server.on("connection", (socket) => {
  socket.on("error", () => {
    // silently ignore malformed connection errors instead of crashing
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception (server kept alive):", err.message);
});