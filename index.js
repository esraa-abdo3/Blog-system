// api/server.js   ← مهم يكون داخل مجلد api على Vercel
const express = require("express");
const serverless = require("serverless-http"); 
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const passport = require("passport");
const mongoconnect = require("./config/dbconnect.js");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Connect to MongoDB

mongoconnect()

// Routes
const authRoutes = require("./routes/Authroutes.js");
app.use("/api/v1/auth", authRoutes);

const userRoutes = require("./routes/Userroutes.js");
app.use("/api/v1/users", userRoutes);

const postRoutes = require("./routes/postsroutes.js");
app.use("/api/v1/posts", postRoutes);

const groupRoutes = require("./routes/GroupRoutes.js");

app.use("/api/v1/groups", groupRoutes);

// Global 404
app.all(/.*/, (req, res) => {
  res.status(404).json({ status: "Error", msg: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ status: err.statusText || "Error", msg: err.msg || err.message, code: err.statusCode, data: null });
});

// بدل app.listen نعمل export للـ handler
module.exports = app;