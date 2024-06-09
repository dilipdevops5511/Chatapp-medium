const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// Use environment variables for MongoDB credentials and port
const PORT = process.env.PORT || 5000;
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Construct MongoDB connection string using the credentials
const MONGO_CONN_STR = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@ac-zrihgr5-shard-00-00.n7msjwt.mongodb.net:27017,ac-zrihgr5-shard-00-01.n7msjwt.mongodb.net:27017,ac-zrihgr5-shard-00-02.n7msjwt.mongodb.net:27017/?ssl=true&replicaSet=atlas-u6zm18-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
// Enable debug logging for Mongoose
mongoose.set('debug', true);

// Log environment variables
console.log("Environment Variables:");
console.log("PORT:", PORT);


app.use(cors());
app.use(express.json());

// Log incoming HTTP requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Success" });
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

  // Socket.IO setup
  const io = socket(server, {
    cors: {
      origin: "*",
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
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
