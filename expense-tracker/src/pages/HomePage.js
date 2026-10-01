import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function HomePage() {
  const [summary, setSummary] = useState({
    totalBalance: 38000,
    totalIncome: 53000,
    totalExpense: 15000,
    recentTransactions: [
      { _id: "1", title: "Monthly Salary", amount: 45000, type: "income", category: "Salary" },
      { _id: "2", title: "Grocery & Provisions", amount: 4200, type: "expense", category: "Food" },
      { _id: "3", title: "Electricity & WiFi", amount: 1850, type: "expense", category: "Utilities" },
      { _id: "4", title: "Metro & Transport", amount: 950, type: "expense", category: "Transport" },
      { _id: "5", title: "Freelance Design", amount: 8000, type: "income", category: "Freelance" }
    ]
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check logged in user
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch dynamic summary from Node.js & MongoDB backend
    axios.get("http://localhost:5000/api/expenses/summary")
      .then((res) => {
        if (res.data) {
          setSummary(res.data);
        }
      })
      .catch((err) => {
        console.log("Using default summary values:", err.message);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <div className="expense-app">
      {/* Clean Light-Mode Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <h2>💰 ExpenseTracker</h2>
        </div>

        <div className="nav-links">
          <Link to="/" className="active">Home</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/payment">Payment Gateway</Link>

          {currentUser ? (
            <div className="user-greeting">
              <span className="user-badge">Hi, {currentUser.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-btn-outline">Login</Link>
              <Link to="/signup" className="nav-btn-solid">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Welcome Banner */}
      <section className="welcome">
        <h1>Smart & Simple Expense Tracker</h1>
        <p>
          Easily manage your daily income and expenses. Built with <strong>React.js</strong>, <strong>Node.js</strong>, <strong>Express</strong>, and <strong>MongoDB</strong>.
        </p>

        <div className="hero-buttons">
          <Link to="/expenses" className="btn-primary-large">
            + Manage Expenses
          </Link>
          <Link to="/payment" className="btn-secondary-large">
            💳 Test Payment Gateway (Exp 8)
          </Link>
        </div>
      </section>

      {/* Summary KPI Cards (Light Mode) */}
      <section className="summary">
        <div className="card balance">
          <h3>Total Balance</h3>
          <h2>₹{(summary.totalBalance || 0).toLocaleString()}</h2>
          <p>Net Savings</p>
        </div>

        <div className="card income">
          <h3>Total Income</h3>
          <h2 className="income-text">+ ₹{(summary.totalIncome || 0).toLocaleString()}</h2>
          <p>Total Credited</p>
        </div>

        <div className="card expense">
          <h3>Total Expenses</h3>
          <h2 className="expense-text">- ₹{(summary.totalExpense || 0).toLocaleString()}</h2>
          <p>Total Debited</p>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="transactions">
        <div className="section-title-row">
          <h2>Recent Activity</h2>
          <Link to="/expenses" className="view-all-link">View All Transactions →</Link>
        </div>

        <div className="transactions-list">
          {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
            summary.recentTransactions.map((tx) => (
              <div key={tx._id} className="transaction-row">
                <div className="tx-left">
                  <span className="tx-icon">
                    {tx.category === "Food" ? "🍔" :
                     tx.category === "Transport" ? "🚌" :
                     tx.category === "Salary" ? "💼" :
                     tx.category === "Utilities" ? "💡" :
                     tx.category === "Shopping" ? "🛒" : "📦"}
                  </span>
                  <div>
                    <strong className="tx-title">{tx.title}</strong>
                    <span className="tx-category">{tx.category}</span>
                  </div>
                </div>
                <div className="tx-right">
                  <span className={tx.type === "income" ? "income-text font-bold" : "expense-text font-bold"}>
                    {tx.type === "income" ? "+ ₹" : "- ₹"}
                    {parseFloat(tx.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No transactions added yet. Click "+ Manage Expenses" to add one.</p>
          )}
        </div>
      </section>

      {/* Lab Features Grid */}
      <section className="features-grid">
        <div className="feature-box">
          <div className="feature-icon">📊</div>
          <h3>Expense & Income Tracking</h3>
          <p>Add, categorize, and calculate real-time financial balance seamlessly.</p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">🍃</div>
          <h3>MongoDB Cloud Database</h3>
          <p>Persistent storage for registered users, login sessions, and transactions.</p>
        </div>
        <div className="feature-box">
          <div className="feature-icon">💳</div>
          <h3>Payment Gateway Integration</h3>
          <p>Experiment 8 compliant Stripe simulation with live payment receipt generation.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Expense Tracker | Advanced Web Technology Lab (AWT) | Department of Computer Engineering</p>
      </footer>
    </div>
  );
}