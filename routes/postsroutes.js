const express= require("express");
const Router = express.Router();
const { createpost ,GetAllposts , GetPostsForUser , getUserPosts,updatePost,deletePost} = require("../controllers/Post/postController");
const upload = require("../middleware/uploadMiddleware");
const verfiyToken = require("../middleware/VerfiyToken");
const AllowedTo=require("../middleware/AllowedTo");

Router.route("/")
    .post(verfiyToken, upload.array("images", 5), createpost) //[if  admins in the group, mamangr , member has prempermission ]
    .get(verfiyToken, AllowedTo("manager"), GetAllposts)
  

Router.route("/me") 
    .get(verfiyToken,AllowedTo("manager","user", "admin"), GetPostsForUser); // البوستات للعضو العادي


Router.route("/:id")
    .get(verfiyToken, AllowedTo("manager","user", "admin"),getUserPosts)
    .put(verfiyToken,AllowedTo("manager","user", "admin"), upload.array("images", 5), updatePost)
    .delete(verfiyToken,AllowedTo("manager","user", "admin"), deletePost);

     

    module.exports=Router;