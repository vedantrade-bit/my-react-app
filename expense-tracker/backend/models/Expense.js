const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["expense", "income"],
    default: "expense",
    required: true
  },
  category: {
    type: String,
    required: true,
    default: "Other"
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    default: "UPI / Cash"
  },
  userId: {
    type: String,
    default: "guest"
  }
}, { timestamps: true });

module.exports = mongoose.model("Expense", ExpenseSchema);
