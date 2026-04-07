const Group = require("../../models/Groupmodel");
const Asncwarpper = require("../../middleware/Asncwrapper");
const { validationResult } = require("express-validator");
const AppError = require("../../utils/AppError");
const { Fail, Success } = require("../../utils/HttpsStatus");
const User=require("../../models/Usermodel")



//1create group by manager

const createGroup = Asncwarpper(async (req, res, next) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Error = AppError.createError({ data: errors.array() }, 400, Fail);
        return next(Error);
    }
    
    const { name, description, admins = [], members = [] ,permissions={}} = req.body;

    const creatorId = req.user.id; 
    if (!admins.includes(creatorId.toString())) {
        admins.push(creatorId);
    }
        const filteredMembers = members.filter(
        member => member !== creatorId.toString()
    );

    const alluserinreq = [...admins, ...filteredMembers];
    const existingUsers = await User.find({ _id: { $in: alluserinreq } });
        if (existingUsers.length !== alluserinreq.length) {
        const Error = AppError.createError("Some users not found in the system please enter right users", 404, Fail);
        return next(Error);
    }

    const newgroup = await Group.create({ name, description, admins,  members: filteredMembers, permissions });
    filteredMembers.forEach(userId => {
    const value = permissions[userId] ?? false;
        newgroup.permissions.set(userId.toString(), true);
       
    });

    await newgroup.save();
    res.status(201).json({ status: Success, msg: "Group created successfully", data: newgroup });
})



//2add members to the group by [manager or admin]

const addMembers = Asncwarpper(async (req, res, next) => {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const Error = AppError.createError({ data: errors.array() }, 400, Fail);
        return next(Error);
    }
    const Groupid = req.params.id;
    if(!Groupid){
        const Error = AppError.createError({ data: "Group id is required" }, 400, Fail);
        return next(Error);
    }
    const { members } = req.body;
    if (!members || !Array.isArray(members) || members.length === 0) {
        const Error = AppError.createError({ data: "Members must be a non-empty array" }, 400, Fail);
        return next(Error);
    }
    const group = await Group.findById(Groupid);
    if (!group) {
        const Error = AppError.createError({ data: "Group not found" }, 404, Fail);
        return next(Error);
    }
        const alreadyExists = members.find(member =>
        group.members.some(m => m.toString() === member)
    );
        const isAdmin = members.find(member =>
        group.admins.some(a => a.toString() === member)
    );

    if (isAdmin) {
        return next(AppError.createError(`User ${isAdmin} is already an admin`, 400, Fail));
    }


    if (alreadyExists) {
        return next(AppError.createError({ data: `User ${alreadyExists} is already a member` }, 400, "Fail"));
    }
        const existingUsers = await User.find({ _id: { $in: members } });

    if (existingUsers.length !== members.length) {
        return next(AppError.createError("Some users not found", 404, Fail));
    }


    
    group.members.push(...members);
    await group.save();
    res.status(200).json({ status: Success, msg: "Members added successfully", data: group });


    
})



 //3remove members from the group by manager or admin

const removeMembers = Asncwarpper(async (req, res, next) => {
    const Groupid = req.params.id;

    if (!Groupid) {
        return next(AppError.createError({ data: "Group id is required" }, 400, "Fail"));
    }

    const members = req.body.members;

    if (!members || !Array.isArray(members) || members.length === 0) {
        return next(AppError.createError({ data: "Members must be a non-empty array" }, 400, "Fail"));
    }

    const group = await Group.findById(Groupid);

    if (!group) {
        return next(AppError.createError({ data: "Group not found" }, 404, "Fail"));
    }
    const Id = req.user.id; 
    const userRole = req.user.role; 
    if (userRole === "admin" && !group.admins.map(a => a.toString()).includes(Id)) {
    return next(AppError.createError({ data: "You are not allowed to delete permissions in this group" }, 403, "Fail"));
}

    const notFound = members.find(member =>
        !group.members.some(m => m.toString() === member)
    );

    if (notFound) {
        return next(AppError.createError({ data: `User ${notFound} is not a member` }, 400, "Fail"));
    }


    group.members = group.members.filter(member =>
        !members.includes(member.toString())
    );

    await group.save();

    res.status(200).json({
        status: "Success",
        msg: "Members removed successfully",
        data: group
    });
});




//Update permissions for a member by admin or manager
const updatePermission = Asncwarpper(async (req, res, next) => {
  
  const { Groupid, userId } = req.params;
        if (!Groupid) {
        const Error = AppError.createError({ data: "Group id is required" }, 400, Fail);
        return next(Error);
    }
      if (!userId) {
        const Error = AppError.createError({ data: "user  id is required" }, 400, Fail);
        return next(Error);
    }
    const { permission } = req.body; //{canpost:false }
    const group = await Group.findById(Groupid);
   
    if (!group) {
          const Error = AppError.createError({ data: "Group not found" }, 400, Fail);
        return next(Error);

    }

const Id = req.user.id; 
    const userRole = req.user.role; 
    if (userRole === "admin" && !group.admins.map(a => a.toString()).includes(Id)) {
    return next(AppError.createError({ data: "You are not allowed to update permissions in this group" }, 403, "Fail"));
}







    // لازم يكون الميمبر ده عندي اصلا ف الجروب 
    if (!group.members.includes(userId)) {
           const Error = AppError.createError({ data: "User is not a member of the group" }, 400, Fail);
      return next(Error);
  }
     group.permissions.set(userId, permission);
    await group.save();
      res.status(200).json({
    status: "Success",
    data: group,
    msg: "Permissions updated successfully"
  });

    
})

// get all groups [admin , super admin, user]
const getAllGroups = Asncwarpper(async (req, res) => {
  const groups = await Group.find()
    .populate("admins", "username email")
    .populate("members", "username email");

  res.status(200).json({   status: "Success", results: groups.length,  data: groups});
});
// get spascfic group  [admin , super admin, user]
const getGroupById = Asncwarpper(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId)
    .populate("admins", "username email")
    .populate("members", "username email");

  if (!group) return next(new AppError("Group not found", 404));

  res.status(200).json({
    status: "Success",
    data: group
  });
});



// get groups user is joined in  [admin , super admin, user]
const userJoinedGroups = Asncwarpper(async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return next(AppError.createError({ data: "user id is required" }, 400, "Fail"));
    }

    const groups = await Group.find({
        members: userId
    }).populate("admins", "username email")
      .populate("members", "username email");

    res.status(200).json({
        status: "Success",
        data: groups
    });
});



module.exports = {
    createGroup,
    addMembers,
    removeMembers,
    updatePermission,
    getAllGroups,
    getGroupById,
     userJoinedGroups
}