// socketHandler.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle 'chat message' event
    socket.on("newMessage", (msg) => {
      io.emit("newMessage", msg.msg);
    });
    socket.on("newMessage", (chat) => {
      console.log("New message received:", chat);
      io.emit("newMessage", chat.msg);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
