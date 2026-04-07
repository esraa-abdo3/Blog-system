const Post = require("../../models/Postmodel");
const Group = require("../../models/Groupmodel")
const Asncwarpper = require("../../middleware/Asncwrapper");
const imagekit = require("../../utils/imagekit"); 
const AppError = require("../../utils/AppError");


const createpost = Asncwarpper(async (req, res, next) => {
  const UserRole=req.user.role
  const { title, content, group } = req.body;
  console.log(group)
    let images = [];
    
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer,  
                fileName: Date.now() + "-" + file.originalname,
                folder: "/posts"   
            });
            images.push(uploadResponse.url); 
        }
    }

  if (group) {
    const targetGroup = await Group.findById(group);
       if (!targetGroup) {
      return next(AppError.createError({ data: "Group not found" }, 404, "Fail"));
    }
  
    // الصلاحيات
    if (UserRole === "manager") {
  
}
    else if (UserRole === "admin") {
    
      if (!targetGroup.admins.map(a => a.toString()).includes(req.user.id)) {
        return next(
          AppError.createError({ data: "You are not allowed to post in this group" }, 403, "Fail")
        );
      }
      // } else if (UserRole === "user") {
      //   // User عادي لازم يكون عضو في الميمبرز وعنده permission=true
      //   if (!targetGroup.members.map(m => m.toString()).includes(req.user.id)) {
      //     return next(
      //       AppError.createError({ data: "You are not a member of this group" }, 403, "Fail")
      //     );
      //   }

      //   if (!targetGroup.permissions.get(req.user.id)) {
      //     return next(
      //       AppError.createError({ data: "You do not have permission to post in this group" }, 403, "Fail")
      //     );
      //   }
    }
      else if (UserRole === "user") {

  const isAdmin = targetGroup.admins
    .map(a => a.toString())
    .includes(req.user.id);

  const isMember = targetGroup.members
    .map(m => m.toString())
    .includes(req.user.id);

  const hasPermission = targetGroup.permissions.get(req.user.id);

  if (isAdmin) {
  }
  else if (!isMember) {
    return next(
      AppError.createError(
        { data: "You are not a member of this group" },
        403,
        "Fail"
      )
    );
  }

  else if (!hasPermission) {
    return next(
      AppError.createError(
        { data: "You do not have permission to post in this group" },
        403,
        "Fail"
      )
    );
  }


}
     else {
      return next(
        AppError.createError({ data: "You are not allowed to post" }, 403, "Fail")
      );
    }
  }

    



  

    const post = await Post.create({
        title,
        content,
        images,
        group: group || null,
        author: req.user.id
    });

    res.status(201).json({
        status: "Success",
        data: post,
        msg: "Post created successfully"
    });
});
// get all l posts for all users to  [super admin]


const GetAllposts = Asncwarpper(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (limit * (page - 1)); 
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(limit).skip(skip);
    res.status(200).json({ status: "Success", data: posts, msg: "All posts retrieved successfully" });
    
})


// get posts for user [  - Global posts - Group posts (if user has access to group) - Sorted by createdAt]
const GetPostsForUser = Asncwarpper(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (limit * (page - 1));

  const posts = await Post.find({
    $or: [
      { group: null }, // Global posts
      // Posts linked to groups where user is admin or member
      {
        group: {
          $in: await Group.find({
            $or: [
              { admins: req.user.id },
              { members: req.user.id }
            ]
          }).distinct('_id')
        }
      }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);

  res.status(200).json({ status: "Success", data: posts, msg: "User posts retrieved successfully" });
});

// get posts for specific user [for user]
const getUserPosts = Asncwarpper(async (req, res, next) => {
  const { userId } = req.params;

  let posts;

  if (req.user.role === "manager") {
    // المانجر يشوف كل البوستات
    posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
  } else {
    // البوستات العامة + البوستات اللي في جروبات اليوزر فيها
    // أولًا نجيب IDs الجروبات اللي اليوزر عضو أو admin فيها
    const userGroupIds = await Group.find({
      $or: [
        { admins: req.user.id },
        { members: req.user.id }
      ]
    }).distinct('_id');

    posts = await Post.find({
      author: userId,
      $or: [
        { group: null },          // بوستات عامة
        { group: { $in: userGroupIds } } // بوستات جروبات هو فيها
      ]
    }).sort({ createdAt: -1 });
  }

  res.status(200).json({
    status: "Success",
    results: posts.length,
    data: posts
  });
});

// delete post by id
const deletePost = Asncwarpper(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(AppError.createError("Post not found", 404, "Fail"));

  if (post.author !== req.user.id && req.user.role !== "manager") {
    return next( AppError.createError("You cannot delete this post", 403, "Fail"));
  }

 await post.deleteOne();

  res.status(200).json({
    status: "Success",
    msg: "Post deleted successfully"
  });
});
const updatePost = Asncwarpper(async (req, res, next) => {
  const { title, content, group } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) return next(AppError.createError("Post not found", 404, "Fail"));

  // ✅ Ownership or super-admin check
  if (post.author.toString() !== req.user.id.toString() && req.user.role !== "manager") {
    return next(AppError.createError("You cannot update this post", 403, "Fail"));
  }

  // Update fields if موجودين
  if (title) post.title = title;
  if (content) post.content = content;
  if (group) post.group = group;

  // Handle new images if موجودة
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: Date.now() + "-" + file.originalname,
        folder: "/posts"
      });
      images.push(uploadResponse.url);
    }
    post.images = images; 
  }

  await post.save();

  res.status(200).json({
    status: "Success",
    data: post,
    msg: "Post updated successfully"
  });
});




module.exports = {
    createpost,
    GetAllposts,
    deletePost,
    updatePost,
    GetPostsForUser,
    getUserPosts
};









// get post by id

// update post by id

// delete post by id