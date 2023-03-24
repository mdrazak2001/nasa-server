const express = require('express');
const router = express.Router();
const User = require("./models/user.model.js");
const passport = require("passport");

router.get('/', function(req, res) {
    res.send('Hello, world!');
});
router.post('/registerUser', function(req, res) {
    console.log(req.body);
    const { name, email, password } = req.body;
    const user = new User({
        name: name,
        email: email,
        password: password
    });
    console.log(name, email, password); 
    res.json(name, email, password);
    // user.save()
    //     .then(savedUser => {
    //         res.json(savedUser);
    //     })
    //     .catch(err => {
    //         console.error(err);
    //         res.status(500).send('Error saving user');
    //     });
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