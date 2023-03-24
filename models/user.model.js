const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
  username: String,
  name: String,
  googleId: String,
  secret: String,
});

const User = new mongoose.model("User", userSchema);
// Export the model
module.exports = User;