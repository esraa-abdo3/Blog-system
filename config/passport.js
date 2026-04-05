const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/Usermodel"); 
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/v1/auth/google/callback"
    },
    async ( profile, done) => {
      try {
        // 1- CHECK IF USER EXISTS
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          // IF NOT FOUND,CREATE NEW USER
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: null, 
            role: "user"
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);