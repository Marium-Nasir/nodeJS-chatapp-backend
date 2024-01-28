const express = require("express");
const router = express.Router();
const { chatHandler,getAllContacts } = require("../controller/chatController");
const protect = require("../helpingfunctions/protect");
const User = require("../model/userModel");

//route for send message and saves to database
router.post("/send-message", protect,chatHandler);

//route for get all contacts
router.get("/get-contacts", protect,getAllContacts);

module.exports = router;
