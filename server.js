const express = require("express");
const app = express();
const  cors = require('cors')
const monogoose = require("mongoose");
require('dotenv').config();
const passport = require("passport");
const url = process.env.DB_URI; 
monogoose.connect(url).then(() => {
  console.log("mongoose server connect")
})
app.use(cors())
app.use(express.json());
app.use(passport.initialize());

const authRoutes = require("./routes/Authroutes");
app.use("/api/v1/auth", authRoutes);

const userRoutes = require("./routes/userroutes");
app.use("/api/v1/users", userRoutes);

const postRoutes = require("./routes/postsroutes");
app.use("/api/v1/posts", postRoutes);
const groupRoutes = require("./routes/GroupRoutes.js");
app.use("/api/v1/groups", groupRoutes);




// gloabel middleware for all not vaild routes
app.all(/.*/, (req, res) => {
  res.status(404).json({
    status: "Error",
    msg: "route not found"
  });
});


// gloabel middleware for all errors
app.use((err, req, res, next) => {
  res.status(err.statuscode||500).json({status:err.statustext ||"Error", msg: err.msg ||err.message, code:err.statuscode, data:null})
})

app.listen( process.env.PORT || 5000, () => {
  console.log(`Example app listening at http://localhost:${5000}`);
});