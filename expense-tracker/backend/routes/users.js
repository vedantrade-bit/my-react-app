const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

// Local fallback user list
let fallbackUsers = [
  { _id: "usr-1", name: "Demo Student", email: "student@example.com", password: "Password123!" }
];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// GET all users
router.get("/", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const users = await User.find({}, { password: 0 });
      return res.json(users);
    }
    return res.json(fallbackUsers.map(u => ({ _id: u._id, name: u.name, email: u.email })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// POST register user (Exp 1 & Exp 4)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (isMongoConnected()) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email is already registered" });
      }

      const newUser = new User({ name, email, password });
      await newUser.save();
      return res.status(201).json({
        success: true,
        message: "User registered successfully in MongoDB!",
        user: { name: newUser.name, email: newUser.email }
      });
    } else {
      const existing = fallbackUsers.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: "Email is already registered" });
      }

      const simulated = { _id: "usr-" + Date.now(), name, email, password };
      fallbackUsers.push(simulated);
      return res.status(201).json({
        success: true,
        message: "User registered successfully!",
        user: { name, email }
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Error registering user: " + error.message });
  }
});

// POST login user (Exp 4)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      return res.json({
        success: true,
        message: "Login successful from MongoDB!",
        user: { name: user.name, email: user.email }
      });
    } else {
      const user = fallbackUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      return res.json({
        success: true,
        message: "Login successful!",
        user: { name: user.name, email: user.email }
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error during login: " + error.message });
  }
});

module.exports = router;