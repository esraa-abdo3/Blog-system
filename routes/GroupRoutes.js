
const express= require("express");
const Router = express.Router();
const {createGroup , addMembers ,removeMembers , updatePermission, getAllGroups ,getGroupById , userJoinedGroups} = require("../controllers/Group/Groupcontroller.js");
const verfiyToken = require("../middleware/VerfiyToken.js");
const  AllowedTo  = require("../middleware/AllowedTo.js");
const { body } = require("express-validator");

Router.route("/")
  .post(
    verfiyToken,
    AllowedTo("manager"),
    body("name").notEmpty().withMessage("Group name is required"),
    body("admins")
      .isArray({ min: 1 })
      .withMessage("Admins must be an array with at least one admin"),
    createGroup
  )
  .get(
    verfiyToken,
    getAllGroups
);
///////////////////////////////////////////////////////////////////////////////
  
// GET /api/groups/:groupId
Router.route("/:groupId")
  .get(
      verfiyToken,
      getGroupById
    
);
  

// Get groups a user is joined in
// GET /api/groups/user/:userId
Router.route("/user/:userId")
  .get(
    verfiyToken,
    userJoinedGroups
  );

Router.route("/:id/members")
    .post(
        verfiyToken,
        AllowedTo("manager", "admin"),
        [
            body("members")
                .isArray({ min: 1 })
                .withMessage("Members must be an array with at least one member"),
        ],
        addMembers
    )
    .delete(
        verfiyToken,
        AllowedTo("manager", "admin"),
        [
            body("members")
                .isArray({ min: 1 })
                .withMessage("Members must be an array with at least one member"),
        ],
        removeMembers
    );
Router.route("/:groupId/permissions/:userId")
  .patch(
    verfiyToken,
    AllowedTo("manager", "admin"),
    [
      body("permission")
        .isBoolean()
        .withMessage("Permission must be true or false"),
    ],
    updatePermission
  );
    module.exports=Router;