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
  console.log(`Example app listening at http://localhost:${3000}`);
});