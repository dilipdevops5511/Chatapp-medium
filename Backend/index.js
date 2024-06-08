const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();

// Use environment variables for MongoDB credentials
const PORT = "5000";
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Log environment variables
console.log("Environment Variables:");
console.log("PORT:", PORT);
console.log("MONGO_USERNAME:", MONGO_USERNAME);
console.log("MONGO_PASSWORD:", MONGO_PASSWORD);

// Construct MongoDB connection string using the credentials
const MONGO_CONN_STR = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.n7msjwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Enable debug logging for Mongoose
mongoose.set('debug', true);

// Debug log for MongoDB connection string
console.log("MongoDB Connection String:", MONGO_CONN_STR);

app.use(cors());
app.use(express.json());

// Log incoming HTTP requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (_req, res) => {
  return res.json({ msg: "pkay ?????huraaaay........You are selected as Devops Engineer" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Additional connection event listeners for Mongoose
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
});

// Connect to MongoDB and start the server
mongoose.connect(MONGO_CONN_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
})
.then(() => {
  console.log('MongoDB connection successful');
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Socket.IO setup with debug logging
const socket = require("socket.io");

const server = app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://a414bbb94e84e419eaae85945853962a-373392892.us-east-1.elb.amazonaws.com:5000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    console.log(`User added: ${userId}`);
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log(`Message sent from ${data.from} to ${data.to}`);
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
