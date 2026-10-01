const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// In-memory fallback if MongoDB is not locally running
let fallbackExpenses = [
  { _id: "exp-1", title: "Salary Credited", amount: 45000, type: "income", category: "Salary", date: new Date().toISOString(), paymentMethod: "Bank Transfer" },
  { _id: "exp-2", title: "Monthly Grocery & Provisions", amount: 4200, type: "expense", category: "Food", date: new Date().toISOString(), paymentMethod: "UPI" },
  { _id: "exp-3", title: "Electricity & WiFi Bill", amount: 1850, type: "expense", category: "Utilities", date: new Date().toISOString(), paymentMethod: "Net Banking" },
  { _id: "exp-4", title: "Metro & Fuel Commute", amount: 950, type: "expense", category: "Transport", date: new Date().toISOString(), paymentMethod: "Cash" },
  { _id: "exp-5", title: "Freelance UI Consultation", amount: 8000, type: "income", category: "Freelance", date: new Date().toISOString(), paymentMethod: "UPI" }
];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// GET all expenses
router.get("/", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const expenses = await Expense.find().sort({ createdAt: -1 });
      return res.json(expenses);
    }
    return res.json(fallbackExpenses);
  } catch (err) {
    console.error("GET /api/expenses error:", err);
    return res.json(fallbackExpenses);
  }
});

// GET summary stats (Total balance, income, expense, recent)
router.get("/summary", async (req, res) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      list = await Expense.find().sort({ createdAt: -1 });
    } else {
      list = fallbackExpenses;
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    list.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
      }
    });

    const totalBalance = totalIncome - totalExpense;
    const recentTransactions = list.slice(0, 5);

    res.json({
      totalBalance,
      totalIncome,
      totalExpense,
      recentTransactions,
      categoryTotals,
      totalCount: list.length,
      isDbConnected: isMongoConnected()
    });
  } catch (err) {
    res.status(500).json({ message: "Error calculating summary" });
  }
});

// POST add new expense
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and Amount are required" });
    }

    const newDoc = {
      title: title.trim(),
      amount: Number(amount),
      type: type || "expense",
      category: category || "Other",
      paymentMethod: paymentMethod || "UPI / Cash",
      date: date ? new Date(date) : new Date()
    };

    let result;
    if (isMongoConnected()) {
      result = await new Expense(newDoc).save();
    } else {
      result = { ...newDoc, _id: "exp-" + Date.now() };
      fallbackExpenses.unshift(result);
    }

    if (req.app?.locals?.notifyDashboard) {
      req.app.locals.notifyDashboard(
        `Transaction Logged: "${result.title}" (₹${result.amount}) [${result.type}]`,
        { priority: result.type === "expense" ? "Medium" : "Low" }
      );
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error("POST /api/expenses error:", err);
    res.status(500).json({ message: "Error saving transaction" });
  }
});

// DELETE an expense
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected() && mongoose.isValidObjectId(id)) {
      const deleted = await Expense.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found in MongoDB" });
      }
      return res.json({ message: "Expense deleted successfully", item: deleted });
    } else {
      const index = fallbackExpenses.findIndex(e => e._id === id);
      if (index !== -1) {
        const removed = fallbackExpenses.splice(index, 1)[0];
        return res.json({ message: "Expense deleted successfully", item: removed });
      }
      return res.status(404).json({ message: "Expense not found" });
    }
  } catch (err) {
    console.error("DELETE /api/expenses error:", err);
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

module.exports = router;
