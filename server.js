const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const authRoutes = require('./routes/authRoutes');

const app = express();

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute time window
  max: 5,                  // Maximum 5 requests per IP address
  message: { message: 'Too many requests, try again later' }
});

// Apply this limiter ONLY to your login route
app.use('/api/auth/login', limiter);

const helmet = require('helmet');
app.use(helmet());

// 1. Body parsers MUST come first so request data is readable
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Robust XSS Sanitization (replaces xss-clean to prevent read-only req.query crashes)
const xss = require('xss');

function sanitizeData(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeData(obj[key]);
    }
  }
}

app.use((req, res, next) => {
  if (req.body) sanitizeData(req.body);
  if (req.query) {
    try { sanitizeData(req.query); } catch (e) { /* ignore read-only queries */ }
  }
  if (req.params) sanitizeData(req.params);
  next();
});

// 3. Static files and routes follow
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRoutes);

// Test route
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Mongo connect + start server
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

start(); 