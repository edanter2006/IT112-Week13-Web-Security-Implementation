    const express = require("express");
    const mongoose = require("mongoose");
    const path = require("path");
    require("dotenv").config();

    const usersRouter = require("./routes/users");
    const productsRouter = require("./routes/products"); // Add this
    const ordersRouter = require("./routes/orders");     // Add this
    const authRoutes = require('./routes/authRoutes'); // <-- 1. Require it here

    const app = express();

    // Homepage route
    app.get("/", (req, res) => {
        res.send("Welcome to My Deployed App");
    });

    // Status endpoint
    app.get("/status", (req, res) => {
        res.status(200).json({ status: "OK", timestamp: new Date() });
    });

    app.get("/", (req, res) => {
    res.send('<h1>Welcome to My Deployed App</h1><p><a href="/index.html">Go to User App</a></p>');
    });

    // Body parsers (required so req.body will not be undefined)
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve frontend
    app.use(express.static(path.join(__dirname, "public")));

    // API routes
    app.use("/api/users", usersRouter);
    app.use("/api/products", productsRouter); // Add this
    app.use("/api/orders", ordersRouter);     // Add this
    app.use("/api/auth", authRoutes); // <-- 2. Mount it here   

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
