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

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/pay", paymentRoutes); // Direct /pay route as specified in Lab Exp 8

// Base Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    project: "Expense Tracker Full-Stack API",
    dbStatus: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Running (Fallback Mode)"
  });
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

app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker Backend Server running on port ${PORT}`);
  console.log(`📡 Endpoints available: /api/expenses, /api/users, /api/items, /api/pay`);
});