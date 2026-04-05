const express = require("express");
const Router = express.Router();
const { register, login } = require("../controllers/Auth/authController");
const { body } = require("express-validator");
const { validationSchema } = require("../middleware/validationSchema");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("../config/passport"); 

// register route
Router.post("/register", validationSchema(), register);
Router.post("/login", [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], login);



Router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


Router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
   
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  
    res.json({ msg: "Google login success", token });
  }
);
module.exports = Router;
