const express = require('express');
const session = require("express-session");
const passport = require("passport");
const mainRouter = require('./main-router.js');
const cors = require("cors");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = require("express").Router();
const User = require("./models/user.model.js");
const MongoStore = require('connect-mongo');

require("dotenv").config();

const app = express();
app.use(session({
    secret: 'your_secret_key_here',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    store: MongoStore.create({ mongoUrl: process.env.ATLAS_URI })
}));
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors());
app.use('/', mainRouter);


app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});
passport.use("google", new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://nasa-server.onrender.com/auth/google/callback",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  scope: ['profile', 'email']
},
async function (accessToken, refreshToken, profile, done) {
  // Find a user
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      return done(null, user);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}
));


passport.use(
  "google-register",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://nasa-server.onrender.com/auth/google/register/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Find or create a user
      try {
        const user = await User.findOne({ googleId: profile.id  });
        if (user) {
          return done(null, false, {
            message: "Email already registered",
          });
        } else {
          const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
          });
          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);


const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});



app.listen(port, function() {
  console.log('Server is listening on port 5000');
});

module.exports = router;