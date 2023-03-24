const express = require('express');
const router = require("express").Router();
const mainRouter = require('./main-router.js');
const app = express();
const port = process.env.PORT || 5000;

app.use('/', mainRouter);
app.listen(port, function() {
    console.log('Server is listening on port 5000');
});
  
module.exports = router;