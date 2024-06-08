const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();

// Use environment variables for MongoDB credentials
const PORT = process.env.PORT || 5000;
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Construct MongoDB connection string using the credentials
const MONGO_CONN_STR = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.n7msjwt.mongodb.net`;

// Enable debug logging for Mongoose
mongoose.set('debug', true);

app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => {
  return res.json({ msg: "pkay ?????huraaaay........You are selected as Devops Engineer" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

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
