const express = require('express');
const router = express.Router();
const User = require("./models/user.model.js");

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

module.exports = router;