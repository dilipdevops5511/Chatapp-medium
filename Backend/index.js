const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const AWS = require('aws-sdk');
require("dotenv").config();

// Set the AWS region
AWS.config.update({ region: 'us-east-1' });

// Create a Secrets Manager client
const secretsManager = new AWS.SecretsManager();

// Specify the secret name
const secretName = 'Mongo';

// Retrieve the secret value
secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
  if (err) {
    console.error(`Error retrieving secret: ${err}`);
  } else {
    // Parse and use the secret data
    const secretData = JSON.parse(data.SecretString);
    console.log('Secret Data:', secretData);

    // Use the retrieved secret data to connect to MongoDB
    mongoose.connect(secretData.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    })
    .then(() => {
      console.log('MongoDB connection successful');

      // Start the Express.js server after MongoDB connection is established
      startServer(secretData.PORT);
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
    });
  }
});

function startServer(PORT) {
  const app = express();
  const socket = require("socket.io");

  app.use(cors());
  app.use(express.json());

  app.get("/ping", (_req, res) => {
    return res.json({ msg: "Ping Successful" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  const server = app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
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
}
