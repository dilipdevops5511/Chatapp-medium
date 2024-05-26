const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const socket = require("socket.io");

// Use environment variables for MongoDB URL and port
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.use(cors());
  app.use(express.json());

  app.get("/ping", (_req, res) => {
    return res.json({ msg: "pkay ?????huraaaay........You are selected as Devops Engineer" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  const server = app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });

  const io = socket(server, {
    cors: {
      origin: "http://afa28a0f651494b25ad1144d6585ccd2-625886049.us-east-1.elb.amazonaws.com:8080",
      credentials: true,
    },
  });

  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    });
  });

  // Additional connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
  });
};

// Connect to MongoDB and start the server
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
})
.then(() => {
  console.log('MongoDB connection successful');
  startServer();
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
