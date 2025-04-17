const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  file: String
});
module.exports = mongoose.model('Message', messageSchema);
