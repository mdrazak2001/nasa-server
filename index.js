// const express = require('express');
// const router = require("express").Router();
// const mainRouter = require('./main-router.js');
// const app = express();
// const cors = require("cors");
// const mongoose = require("mongoose"); 
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const cookieParser = require('cookie-parser');
// const cookieSession = require("cookie-session");
// const passport = require("passport");
// const User = require("./models/user.model.js");

// const port = process.env.PORT || 5000;

// require("dotenv").config();



// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({
//     extended: false
// }));

// app.use(cookieParser({"secret": "Our little secret."}))

// app.use(
//     // session middleware
//     cookieSession({
//       name: "session",
//       maxAge: 24 * 60 * 60 * 1000,
//       keys: ["cyberwolve"],
//     })
// );

// app.use(
//     cors({
//       origin: "http://localhost:3000", // <-- location of the react app were connecting to
//       methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//       credentials: true,
//     })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(User.createStrategy());
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/google/callback",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
//   },
//   async function (accessToken, refreshToken, profile, done) {
//     try {
//       console.log(profile);
//       // Find or create user in your database
//       let user = await User.findOne({ googleId: profile.id });
//       if (!user) {
//         // Create new user in database
//         const username = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value.split('@')[0] : '';
//         const newUser = new User({
//           username: profile.displayName,
//           googleId: profile.id
//         });
//         user = await newUser.save();
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

// const uri = process.env.ATLAS_URI;
// mongoose.connect(uri);
// const connection = mongoose.connection;
 
// connection.once("open", () => {
//   console.log("MongoDB database connection established successfully");
// });



// app.use('/', mainRouter);
// app.listen(port, function() {
//     console.log('Server is listening on port 5000');
// });
  
// module.exports = router;

const express = require('express');
const session = require("express-session");
const passport = require("passport");
const mainRouter = require('./main-router.js');
const cors = require("cors");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = require("express").Router();
const userSchema = require("./models/user.model");
const User = require("./models/user.model.js");
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");

require("dotenv").config();

const app = express();
app.use(session({
    secret: 'your_secret_key_here',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
const port = process.env.PORT || 5000;
app.use('/', mainRouter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
  }));
// app.use(cookieParser({"secret": "Our little secret."}))

// app.use(
//   // session middleware
//   cookieSession({
//     name: "session",
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: ["cyberwolve"],
//   })
// );
app.use(
    cors({
      origin: "http://localhost:3000", // <-- location of the react app were connecting to
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      console.log(profile);
      // Find or create user in your database
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Create new user in database
        const username = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value.split('@')[0] : '';
        const newUser = new User({
          username: profile.displayName,
          googleId: profile.id
        });
        user = await newUser.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


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