# 💰 Expense Tracker | Advanced Web Technology (AWT) Lab

A complete full-stack web application designed for the **Department of Computer Engineering - Advanced Web Technology Lab (D.Y. Patil University / RAIT)**.

Built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**, featuring a **clean light-mode UI**, **user authentication**, **live database CRUD**, and **payment gateway integration**.

---

## 📚 Lab Manual Experiments Implemented

| Experiment | Title | Implementation in Code |
| :--- | :--- | :--- |
| **Exp 1 & 2** | Registration Page & Password Strength Indicator | [`src/pages/signup.js`](src/pages/signup.js) with real-time meter (Weak/Medium/Strong) |
| **Exp 3** | Design a Homepage using React.js | [`src/pages/HomePage.js`](src/pages/HomePage.js) with light mode, live KPI summary, and recent activity |
| **Exp 4** | Simple Login Form using React.js | [`src/pages/login.js`](src/pages/login.js) with `react-hook-form` and validation |
| **Exp 5** | Connecting React.js Project with MongoDB | [`backend/server.js`](backend/server.js), [`backend/models/Expense.js`](backend/models/Expense.js), and [`src/pages/ExpenseManager.js`](src/pages/ExpenseManager.js) |
| **Exp 6 & 7**| Web Page & Form Handling using Node.js & Express | REST API handling POST/GET/DELETE requests in [`backend/routes/`](backend/routes/) |
| **Exp 8** | Payment Gateway Integration in Web Application | [`src/pages/PaymentGateway.js`](src/pages/PaymentGateway.js) and [`backend/routes/payment.js`](backend/routes/payment.js) with **Razorpay Gateway** (UPI, Cards, Netbanking) |

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Node.js + Express + MongoDB)
Open a terminal and run:
```bash
cd backend
npm install
npm start
```
* The backend will run on **`http://localhost:5000`**.
* Connects to local MongoDB at `mongodb://127.0.0.1:27017/expense_tracker`.

### 2. Start the Frontend React Application
Open a second terminal and run:
```bash
npm install
npm start
```
* The React app will launch on **`http://localhost:3000`** in your browser.

---

## 🌟 Key Application Routes

* **Homepage (`/`)**: Light-mode overview with total balance, income, expenses summary, recent transactions, and navigation.
* **Expenses (`/expenses`)**: Full CRUD management connected to MongoDB. Add income/expense, filter by type/category, and delete items.
* **Payment Gateway (`/payment`)**: Experiment 8 payment checkout. Use the test card (`4242 4242 4242 4242`, `12/34`, `123`) to simulate a payment and receive an instant receipt with a transaction ID.
* **Login (`/login`)**: Secure login connected to MongoDB user store.
* **Sign Up (`/signup`)**: Registration form with live password strength indicator and form validation.

---

## 🛠️ Tech Stack
* **Frontend**: React.js 19, React Router Dom, React Hook Form, Axios, Vanilla CSS (Light Mode)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose ODM
* **Payment**: Stripe Gateway Simulation (Exp 8 compliant)
