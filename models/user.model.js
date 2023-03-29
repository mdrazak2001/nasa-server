const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
  username: String,
  email: String,
  name: String,
  googleId: String,
  password: String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
// Export the model
module.exports = User; 