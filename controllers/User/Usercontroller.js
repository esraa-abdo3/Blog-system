const User = require("../../models/Usermodel");
const Asncwrapper = require("../../middleware/Asncwrapper");
const AppError = require("../../utils/AppError");


// user  CRUD
//1-allusers
const getAllUsers = Asncwrapper(async (req, res) => {
 // pagination
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;
  const skip = (limit * (page - 1)); 
    const users = await User.find({},{ _v: 0 }).limit(limit).skip(skip);
    res.status(200).json({ status: "Success", data: users, msg: "All users retrieved successfully" });
})
//2- get user by id
const getUserById = Asncwrapper(async (req, res,next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        const Error = AppError.createError("User not found", 404, Fail);
        next(Error);
    }
    res.status(200).json({ status: "Success", data: user, msg: "User retrieved successfully" });
})

//3- update user
const updateUser = Asncwrapper(async (req, res,next) => {
    const { id } = req.params;
    const {username} = req.body;
    const user = await User.findByIdAndUpdate(id, { username }, { new: true });
    if (!user) {
        const Error = AppError.createError("User not found", 404, Fail);
        next(Error);
    }
    res.status(200).json({ status: "Success", data: user, msg: "User updated successfully" });
})

//4- delete user
const deleteUser = Asncwrapper(async (req, res,next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        const Error = AppError.createError("User not found", 404, Fail);
        next(Error);
    }
    res.status(200).json({ status: "Success", data: null, msg: "User deleted successfully" });
})
module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}
