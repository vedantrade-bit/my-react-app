import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ExpenseManager from "./pages/ExpenseManager";
import PaymentGateway from "./pages/PaymentGateway";
import Login from "./pages/login";
import Signup from "./pages/signup";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lab Exp 3: Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Lab Exp 5: MongoDB Expense & Item Manager */}
        <Route path="/expenses" element={<ExpenseManager />} />

        {/* Lab Exp 8: Payment Gateway Integration */}
        <Route path="/payment" element={<PaymentGateway />} />

        {/* Lab Exp 4: Simple Login Form */}
        <Route path="/login" element={<Login />} />

        {/* Lab Exp 1 & 2: Registration & Password Strength Form */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;