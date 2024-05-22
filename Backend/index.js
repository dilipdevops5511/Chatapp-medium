const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
require("dotenv").config();

const app = express();
const socket = require("socket.io");

// Set the AWS region
const client = new SecretsManagerClient({
  region: 'us-east-1'
});

// Specify the secret name
const secretName = 'Mongo';

// Retrieve the secret value
const getSecret = async () => {
  try {
    const data = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
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
  } catch (err) {
    console.error(`Error retrieving secret: ${err}`);
  }
};

const startServer = (port) => {
  app.use(cors());
  app.use(express.json());

  app.get("/ping", (_req, res) => {
    return res.json({ msg: "You are selected as Devops Engineer" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  const server = app.listen(port, () => {
    console.log(`Server started on ${port}`);
  });

  const io = socket(server, {
    cors: {
      origin: "http://10.100.247.167:5000",
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

// Retrieve the secret and start the server
getSecret();

