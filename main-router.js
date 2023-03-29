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
    const user = new User({
        name: name,
        email: email,
        password: hashedPassword
    });
    console.log(name, email, hashedPassword);     

    try {
      const savedUser = await user.save();
      res.json(savedUser);
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
  res.json({ token: token });
  
  // res.json({ message: 'Logged in successfully', user: user });
});

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("http://localhost:3000");
  });

router.get("/logout", function(req, res){
    res.redirect("http://localhost:3000/");
});

module.exports = router;