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

// Construct MongoDB connection string using the credentials
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_CONN_STR = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.n7msjwt.mongodb.net`;

// Enable debug logging for Mongoose
mongoose.set('debug', true);

// Use CORS middleware
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Define routes
app.get("/ping", (_req, res) => {
  return res.json({ msg: "pkay ?????huraaaay........You are selected as Devops Engineer" });
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Connect to MongoDB
mongoose.connect(MONGO_CONN_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
})
.then(() => {
  console.log('MongoDB connection successful');

  // Start the Express server
  const server = app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });

  // Setup socket.io
  const io = socket(server, {
    cors: {
      origin: "http://a414bbb94e84e419eaae85945853962a-373392892.us-east-1.elb.amazonaws.com:5000",
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
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
