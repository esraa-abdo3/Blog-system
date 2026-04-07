const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      unique: true,
      trim: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    permissions: {
      type: Map,
      of: Boolean,
      default: {} 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);