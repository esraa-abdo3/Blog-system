const monogoose = require("mongoose");
const UserRoles = require("../utils/UserRoles");
const postSchema = new monogoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        minLength: [2, "title must be at least 2 characters"],
        
    },
    content: {
        type: String,
        required: [true, "content  required"],

    },
    author: {
        type: monogoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "author is required"],
    },
    group: {
        type: monogoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    images:   [String]
    
  
}, { timestamps: true });
const PostModel = monogoose.model("Post",postSchema );
module.exports = PostModel;