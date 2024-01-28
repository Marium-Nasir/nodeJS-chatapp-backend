const Chat = require("../model/chatModel");
const User = require("../model/userModel");

const sendMessage = async (socket, { senderID, receiverID, msg }) => {
  try {
    // Check if the chat exists
    let chat = await Chat.findOne({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, receiverID: senderID },
      ],
    });

    if (!chat) {
      // If the chat doesn't exist, create a new one
      chat = await Chat.create({
        senderID,
        receiverID,
        messages: [
          {
            msg,
            time: new Date(),
          },
        ],
      });
    } else {
      // If the chat exists, add a new message to it
      chat.messages.push({
        msg,
        time: new Date(),
      });
      await chat.save();
    }

    // Emit the 'newMessage' event to all connected clients
    socket.emit("newMessage", chat);
  } catch (error) {
    console.error(error);
  }
};

const chatHandler = async (req, res) => {
  const { receiverEmail, msg } = req.body;
  try {
    if (!receiverEmail) {
      return res.status(404).json({
        status: 404,
        message: "Receiver's email is required",
        data: null,
      });
    } else if (!msg || msg.length < 1) {
      return res.status(404).json({
        status: 404,
        message: "Message content is required",
        data: null,
      });
    }
    const senderID = req.user._id;
    const receiverData = await User.findOne({ email: receiverEmail });
    if (!receiverData || (receiverData === undefined) | null) {
      return res.status(404).json({
        status: 404,
        message: "User Not found",
        data: null,
      });
    }
    const receiverID = receiverData._id;

    // Call the sendMessage function with the necessary arguments
    console.log(req.io + " req.io");
    await sendMessage(req.io, { senderID, receiverID, msg });

    res.status(200).json({ status: 200, message: "message sent", data: null });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 500, message: "message not sent", data: null });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      $or: [{ senderID: userId }, { receiverID: userId }],
    })
      .populate("receiverID")

    const contacts = chats.map((chat) => {
      return {
        _id: chat.receiverID._id,
        name: chat.receiverID.name,
        email: chat.receiverID.email,
        messages: chat.messages
      };
    });

    return res
      .status(200)
      .json({ status: 200, message: "Fetched All Contacts", data: contacts });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 500, message: "Unable to load contacts", data: null });
  }
};

module.exports = { chatHandler, getAllContacts };
