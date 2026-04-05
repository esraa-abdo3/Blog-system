const express= require("express");
const Router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/User/Usercontroller");
const verfiyToken = require("../middleware/VerfiyToken");
const AllowedTo=require("../middleware/AllowedTo");

Router.route("/")
    .get(verfiyToken, AllowedTo("admin", "manager"), getAllUsers); 
Router.route("/:id")
    .get(verfiyToken, AllowedTo("user","admin", "manager"), getUserById) 
    .put(verfiyToken, AllowedTo("user","admin", "manager"), updateUser) 
    .delete(verfiyToken, AllowedTo("admin", "manager"), deleteUser) 
     

    module.exports=Router;