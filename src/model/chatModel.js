const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages:[
    {
        msg:{type: String, required:true},
        time:{type: Date}
    }
  ]
},{timestamps:true});

const Chat = mongoose.model('Chat',chatSchema);
module.exports = Chat;
