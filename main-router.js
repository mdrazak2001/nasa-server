const express = require('express');
const router = express.Router();
const User = require("./models/user.model.js");
const passport = require("passport");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', function(req, res) {
    res.send('Hello, world!');
});

router.get('/users', function(req, res, next) {
  User.find({})
    .exec()
    .then(function(users) {
      res.json(users);
    })
    .catch(function(err) {
      return next(err);
    });
});

router.post('/registerUser', async function(req, res) {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userCheck = await User.findOne({ email: email });     
    if(userCheck) {
      console.log('User already exists');
      return res.status(400).send('User already exists');
    }
    const user = new User({
        name: name,
        email: email,
        password: hashedPassword
    });
    // console.log(name, email, hashedPassword);
    
    try {
      const savedUser = await user.save();
      console.log('User registered successfully ', savedUser);
      const token = jwt.sign({ _id: user._id, name: user.name }, process.env.TOKEN_SECRET);
      res.json({ token: token });

    } catch (err) {
      console.error(err);
      res.status(500).send('Error saving user');
    }
});


router.post('/loginUser', async function(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    // Return error message if user not found
    return res.status(400).send('Invalid email or password');
  }

  // Use bcrypt.compare() to compare plain-text password with hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    // Return error message if passwords don't match
    return res.status(400).send('Invalid email or password');
  }
  console.log('Logged in successfully ', user);
  // Passwords match, so create and return a JWT token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  return res.json({user: user, token: token});

});

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/register",
  passport.authenticate("google-register", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "https://nasa-ui.vercel.app?failure=UserNotRegistered" }),
  async function(req, res) {
    // console.log("User idar:" + req.user)
    const existingUser = await User.findOne({ googleId: req.user.googleId });
    console.log("Existing user: " + existingUser);
    if (existingUser) {
      const token = jwt.sign({ _id: existingUser._id }, process.env.TOKEN_SECRET);
      res.redirect("https://nasa-ui.vercel.app?user=" + existingUser.username+"&token="+token);
    } else {
      res.redirect("https://nasa-ui.vercel.app?failure=true");
    }
  });
router.get(
  "/auth/google/register/callback",
  passport.authenticate("google-register", {
    failureRedirect: "https://nasa-ui.vercel.app?failure=ExistingUser",
  }),
  async function(req, res) {
    // console.log("User idar:" + req.user);
    const existingUser = await User.findOne({ googleId: req.user.googleId });
    const token = jwt.sign({ _id: existingUser._id }, process.env.TOKEN_SECRET);
    res.redirect("https://nasa-ui.vercel.app?user=" + existingUser.username+"&token="+token);
  }
);

router.get('/api/image', async (req, res) => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API}&date=${year}-${month}-${day}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  res.json(data);
});
module.exports = router;