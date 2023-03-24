const express = require('express');
const router = express.Router();
const User = require("./models/user.model.js");
const passport = require("passport");

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