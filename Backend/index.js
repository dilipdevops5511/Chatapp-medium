const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const socket = require("socket.io");

// Retrieve MongoDB connection string and port from environment variables
const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT;

if (!mongoUrl || !port) {
  console.error("Error: MONGO_URL and PORT must be defined in the environment variables");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
})
.then(() => {
  console.log('MongoDB connection successful');
  // Start the Express.js server after MongoDB connection is established
  startServer(port);
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const startServer = (port) => {
  app.use(cors());
  app.use(express.json());

  app.get("/ping", (_req, res) => {
    return res.json({ msg: "Ping Successful" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  const server = app.listen(port, () => {
    console.log(`Server started on ${port}`);
  });

  const io = socket(server, {
    cors: {
      origin: "http://localhost:3000",
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

// Start the server
startServer(port);
