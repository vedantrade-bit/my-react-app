import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("Checking...");

  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [paymentMethod, setPaymentMethod] = useState("UPI / Cash");

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE = (process.env.REACT_APP_API_URL || "") + "/api/expenses";

  // Fetch expenses from Node.js Express & MongoDB (Exp 5)
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setExpenses(res.data);
      setDbStatus("Connected to MongoDB");
    } catch (err) {
      console.warn("MongoDB connection fallback active:", err.message);
      // Fallback local items
      const local = JSON.parse(localStorage.getItem("local_expenses") || "[]");
      if (local.length === 0) {
        const initial = [
          { _id: "local-1", title: "Monthly Salary", amount: 45000, type: "income", category: "Salary", paymentMethod: "Bank Transfer", date: new Date().toLocaleDateString() },
          { _id: "local-2", title: "Grocery & Food", amount: 2800, type: "expense", category: "Food", paymentMethod: "UPI", date: new Date().toLocaleDateString() },
          { _id: "local-3", title: "Electricity & WiFi", amount: 1450, type: "expense", category: "Utilities", paymentMethod: "Card", date: new Date().toLocaleDateString() }
        ];
        localStorage.setItem("local_expenses", JSON.stringify(initial));
        setExpenses(initial);
      } else {
        setExpenses(local);
      }
      setDbStatus("Local Storage Mode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add Expense / Item (Exp 5 Procedure)
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert("Please enter title and valid amount!");
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      date: new Date().toLocaleDateString()
    };

    try {
      // POST to MongoDB Backend
      const res = await axios.post(API_BASE, payload);
      setExpenses([res.data, ...expenses]);
    } catch (err) {
      // Fallback local storage update
      const simulated = { ...payload, _id: "local-" + Date.now() };
      const updated = [simulated, ...expenses];
      setExpenses(updated);
      localStorage.setItem("local_expenses", JSON.stringify(updated));
    }

    // Reset Form
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
  };

  // Delete Expense (Exp 5 Procedure)
  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setExpenses(expenses.filter(item => item._id !== id));
    } catch (err) {
      const updated = expenses.filter(item => item._id !== id);
      setExpenses(updated);
      localStorage.setItem("local_expenses", JSON.stringify(updated));
    }
  };

  // Financial Computations
  const totalIncome = expenses
    .filter(i => i.type === "income")
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const totalExpense = expenses
    .filter(i => i.type === "expense")
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const totalBalance = totalIncome - totalExpense;

  // Filtered List
  const filteredExpenses = expenses.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="expense-app">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <h2>💰 ExpenseTracker</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/expenses" className="active">Expenses</Link>
          <Link to="/payment">Payment Gateway</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>

      <div className="main-content">
        {/* Header & Status Banner */}
        <div className="page-header-row">
          <div>
            <h1>Expense Manager</h1>
            <p className="page-subtitle">Add, filter, and track daily financial entries with Node.js & MongoDB</p>
          </div>
          <span className="db-badge">
            <span className="dot-green"></span>
            {dbStatus}
          </span>
        </div>

        {/* Live Financial KPI Metric Cards (Light Mode) */}
        <div className="summary-cards-grid">
          <div className="kpi-card balance-card">
            <h3>Total Balance</h3>
            <div className="kpi-amount">₹{totalBalance.toLocaleString()}</div>
            <p className="kpi-desc">Net savings in account</p>
          </div>

          <div className="kpi-card income-card">
            <h3>Total Income</h3>
            <div className="kpi-amount text-green">+ ₹{totalIncome.toLocaleString()}</div>
            <p className="kpi-desc">Total credited earnings</p>
          </div>

          <div className="kpi-card expense-card">
            <h3>Total Expenses</h3>
            <div className="kpi-amount text-red">- ₹{totalExpense.toLocaleString()}</div>
            <p className="kpi-desc">Total debited spending</p>
          </div>
        </div>

        <div className="expense-grid-layout">
          {/* Left: Add Transaction Form (Exp 5 & 7) */}
          <div className="form-panel-card">
            <h3>+ Add New Transaction</h3>
            <form onSubmit={handleAddExpense} className="entry-form">
              <div className="form-group">
                <label>Transaction Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grocery Shopping, Monthly Salary"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (in ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 500"
                  min="1"
                  step="any"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Food">🍔 Food & Dining</option>
                    <option value="Transport">🚌 Transport & Fuel</option>
                    <option value="Salary">💼 Salary / Pay</option>
                    <option value="Utilities">💡 Bills & Utilities</option>
                    <option value="Shopping">🛒 Shopping</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="UPI / Cash">UPI / Google Pay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Net Banking Transfer</option>
                </select>
              </div>

              <button type="submit" className="btn-add-entry">
                Add Transaction
              </button>
            </form>
          </div>

          {/* Right: Transactions List & Filter */}
          <div className="list-panel-card">
            <div className="list-header-row">
              <h3>All Transactions ({filteredExpenses.length})</h3>
              <div className="filter-controls">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="type-select">
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
            </div>

            <div className="search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions by title or category..."
              />
            </div>

            {loading ? (
              <div className="empty-state">Loading transactions from MongoDB...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <p>No transactions found.</p>
                <small>Use the form on the left to add your first expense or income.</small>
              </div>
            ) : (
              <div className="transactions-table-wrap">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((item) => (
                      <tr key={item._id} className={item.type === "income" ? "row-income" : "row-expense"}>
                        <td className="item-title-cell">
                          <strong>{item.title}</strong>
                        </td>
                        <td>
                          <span className="category-pill">{item.category}</span>
                        </td>
                        <td className="payment-cell">{item.paymentMethod || "UPI"}</td>
                        <td className="amount-cell">
                          <span className={item.type === "income" ? "income-text" : "expense-text"}>
                            {item.type === "income" ? "+ ₹" : "- ₹"}
                            {parseFloat(item.amount).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(item._id)}
                            className="btn-delete"
                            title="Delete Transaction"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 Expense Tracker | Advanced Web Technology Lab (Exp 5 MongoDB Integration)</p>
      </footer>
    </div>
  );
}
