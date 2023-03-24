const express = require('express');
const router = require("express").Router();
const mainRouter = require('./main-router.js');
const app = express();
const cors = require("cors");
const mongoose = require("mongoose"); 
const port = process.env.PORT || 5000;

require("dotenv").config();


const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
 
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});



app.use('/', mainRouter);
app.listen(port, function() {
    console.log('Server is listening on port 5000');
});
  
module.exports = router;