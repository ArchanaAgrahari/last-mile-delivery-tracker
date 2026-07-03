import Order from "../models/Order.js";
import OrderStatusHistory from "../models/OrderStatusHistory.js";
import Agent from "../models/Agent.js";
import { detectZone } from "../services/zoneDetectionService.js";
import { calculateCharge } from "../services/rateCalculationService.js";
import { autoAssignAgent, reassignAgent } from "../services/assignmentService.js";
import { sendStatusEmail } from "../services/notificationService.js";
import User from "../models/User.js";

// Preview charge before confirming order
export const previewCharge = async (req, res) => {
  try {
    const { pickupAddress, dropAddress, dimensions, actualWeight, orderType, paymentType } = req.body;

    const pickupZone = await detectZone(pickupAddress);
    const dropZone = await detectZone(dropAddress);

    const result = await calculateCharge({
      dimensions,
      actualWeight,
      orderType,
      paymentType,
      pickupZoneId: pickupZone._id,
      dropZoneId: dropZone._id,
    });

    res.json({ ...result, pickupZone: pickupZone.name, dropZone: dropZone.name });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create order (customer or admin on behalf of customer)
export const createOrder = async (req, res) => {
  try {
    const {
      customerId, pickupAddress, dropAddress, dimensions,
      actualWeight, orderType, paymentType,
    } = req.body;

    const pickupZone = await detectZone(pickupAddress);
    const dropZone = await detectZone(dropAddress);

    const { volumetricWeight, billedWeight, charge } = await calculateCharge({
      dimensions, actualWeight, orderType, paymentType,
      pickupZoneId: pickupZone._id, dropZoneId: dropZone._id,
    });

    const customer = req.user.role === "admin" ? customerId : req.user._id;

    const order = await Order.create({
      customer,
      createdByAdmin: req.user.role === "admin",
      pickupAddress, dropAddress,
      pickupZone: pickupZone._id, dropZone: dropZone._id,
      dimensions, actualWeight, volumetricWeight, billedWeight,
      orderType, paymentType, charge,
      status: "Created",
    });

    await OrderStatusHistory.create({
      order: order._id, status: "Created",
      changedBy: req.user._id, actorRole: req.user.role,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin manual or auto assignment
export const assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body; // optional - if not given, auto-assign
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let agent;
    if (agentId) {
      agent = await Agent.findByIdAndUpdate(agentId, { isAvailable: false }, { new: true });
    } else {
      agent = await autoAssignAgent(order.pickupZone);
      if (!agent) return res.status(400).json({ message: "No available agent found" });
    }

    order.assignedAgent = agent._id;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status (by agent or admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, failureReason } = req.body;
    const order = await Order.findById(req.params.id).populate("customer", "-password");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "Failed") order.failureReason = failureReason;
    await order.save();

    await OrderStatusHistory.create({
      order: order._id, status,
      changedBy: req.user._id, actorRole: req.user.role,
      note: failureReason || "",
    });

    await sendStatusEmail(order.customer.email, order._id, status);

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Customer reschedules a failed delivery
export const rescheduleOrder = async (req, res) => {
  try {
    const { rescheduledDate } = req.body;
    const order = await Order.findById(req.params.id).populate("customer", "-password");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Failed") {
      return res.status(400).json({ message: "Only failed orders can be rescheduled" });
    }

    order.status = "Rescheduled";
    order.rescheduledDate = rescheduledDate;

    const newAgent = await reassignAgent(order.pickupZone, order.assignedAgent);
    order.assignedAgent = newAgent ? newAgent._id : null;

    await order.save();

    await OrderStatusHistory.create({
      order: order._id, status: "Rescheduled",
      changedBy: req.user._id, actorRole: req.user.role,
      note: `Rescheduled to ${rescheduledDate}`,
    });

    await sendStatusEmail(order.customer.email, order._id, "Rescheduled");

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get orders - customer sees own, admin sees all with filters
export const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "customer") filter.customer = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.zone) filter.pickupZone = req.query.zone;
    if (req.query.agent) filter.assignedAgent = req.query.agent;

    const orders = await Order.find(filter)
      .populate("customer", "-password")
      .populate("pickupZone dropZone assignedAgent");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Full tracking timeline for one order
export const getOrderTimeline = async (req, res) => {
  const history = await OrderStatusHistory.find({ order: req.params.id }).sort("timestamp");
  res.json(history);
};

// Admin override
export const overrideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    await OrderStatusHistory.create({
      order: order._id, status,
      changedBy: req.user._id, actorRole: "admin",
      note: "Admin override",
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};