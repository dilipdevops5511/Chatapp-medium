const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const socket = require("socket.io");

// Use environment variables for MongoDB URL
const MONGO_URL = process.env.MONGO_CONN_STR;
console.log("MongoDB URL:", MONGO_URL);


const startServer = () => {
  app.use(cors());
  app.use(express.json());

  app.get("/ping", (_req, res) => {
    return res.json({ msg: "pkay ?????huraaaay........You are selected as Devops Engineer" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  const server = app.listen(5000, () => {
    console.log(`Server started on port 5000`);
  });

  const io = socket(server, {
    cors: {
      origin: process.env.FRONTENDURL,
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
