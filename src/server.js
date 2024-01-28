require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT;
const cors = require('cors');
const userRoute = require('./Route/userRoutes');
const chatRoute = require('./Route/chatRoutes');
const connectDB = require('./db/conn');
const socketHandler = require('./socketHandler'); 

connectDB();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/user', userRoute);
app.use('/api/chat', chatRoute);

socketHandler(io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
