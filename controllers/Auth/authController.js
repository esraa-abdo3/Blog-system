const { validationResult } = require("express-validator");
const Asncwrapper = require("../../middleware/Asncwrapper");
const User = require("../../models/Usermodel");
const bcrypt = require('bcryptjs');
const { Success, Error, Fail } = require("../../utils/HttpsStatus");
const Generatejwt = require("../../utils/Generatejwt");
const AppError = require("../../utils/AppError");

// register
const register = Asncwrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       const Error = AppError.createError({ data: errors.array() }, 400, Fail);
        return next(Error);
    }
    const { username, email, password, role } = req.body;
    const existuser =  await User.find({ email });
    if (existuser.length > 0) {
        const Error = AppError.createError("email already exist", 400, Fail);
        return next(Error);   
    }
    // hashed password
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = await User.create({ username, email, password: hashedpassword, role });
    // generate token
    const token = Generatejwt({ id: newuser._id, role: newuser.role, email: newuser.email });
    await newuser.save();
    res.status(201).json({ status: Success, msg: "user created successfully", data: { newuser, token:token } });
}

)

// login
const login =Asncwrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       const Error = AppError.createError({ data: errors.array() }, 400, Fail);
        return next(Error);
    }
    const {password, email} = req.body;
    const existuser = await User.findOne({ email });
    if (! existuser) {
        const Error = AppError.createError("Invalid email or password", 400, Fail);
        return next(Error);   
    }
   const isPasswordValid = await bcrypt.compare(password, existuser.password);
    if (!isPasswordValid) {
        const Error = AppError.createError({ data: "Invalid email or password" }, 400, Fail);
        return next(Error);
    }
    const token = Generatejwt({ id: existuser._id, role: existuser.role, email: existuser.email });
    res.status(200).json({ status: "Success", data: { existuser , token }, msg: "Login successful" })
}

)

module.exports = {
    register,
    login
}