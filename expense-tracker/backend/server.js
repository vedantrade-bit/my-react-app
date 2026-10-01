const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const itemRoutes = require("./routes/items");
const expenseRoutes = require("./routes/expenses");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service Binding Notification Helper (calls internal web-dashboard service)
async function notifyDashboard(action, details = {}) {
  const dashboardUrl = process.env.WEB_DASHBOARD_URL;
  if (!dashboardUrl) return;

  try {
    const targetUrl = new URL("/api/tasks", dashboardUrl);
    await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `[Expense Tracker] ${action}`,
        priority: details.priority || "Low",
        assignedTo: "Expense Tracker Service",
        dueDate: new Date().toLocaleTimeString()
      })
    });
  } catch (err) {
    console.warn("[Internal Binding] Failed to notify web-dashboard:", err.message);
  }
}
app.locals.notifyDashboard = notifyDashboard;

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/pay", paymentRoutes); // Direct /pay route as specified in Lab Exp 8

// Base Health Check Route (handles / and /api)
app.get(["/", "/api"], (req, res) => {
  res.json({
    status: "online",
    project: "Expense Tracker Full-Stack API",
    dbStatus: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Running (Fallback Mode)"
  });
});

// Internal Service Binding Sync Endpoint
app.post("/api/sync-dashboard", async (req, res) => {
  const dashboardUrl = process.env.WEB_DASHBOARD_URL;
  if (!dashboardUrl) {
    return res.status(503).json({ error: "WEB_DASHBOARD_URL internal binding not configured" });
  }
  try {
    const targetUrl = new URL("/api/tasks", dashboardUrl);
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: req.body.title || "Manual Sync from Expense Tracker Backend",
        priority: req.body.priority || "Medium",
        assignedTo: "Backend Service",
        dueDate: new Date().toLocaleTimeString()
      })
    });
    const result = await response.json();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("====================================================");
    console.log("✅ MongoDB connected successfully to expense_tracker");
    console.log("====================================================");
  })
  .catch((error) => {
    console.warn("⚠️  MongoDB connection notice: " + error.message);
    console.warn("💡 Running in robust in-memory mode for testing & lab submission.");
  });

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Expense Tracker Backend Server running on port ${PORT}`);
    console.log(`📡 Endpoints available: /api/expenses, /api/users, /api/items, /api/pay`);
  });
}

module.exports = app;