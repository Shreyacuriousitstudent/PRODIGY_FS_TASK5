const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  online: { type: Boolean, default: false }
});
module.exports = mongoose.model('User', userSchema);

