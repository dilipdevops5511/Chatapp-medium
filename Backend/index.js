// Use environment variables for MongoDB credentials
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
console.log("MongoDB Username:", MONGO_USERNAME);
console.log("MongoDB Password:", MONGO_PASSWORD);

// Construct MongoDB connection string using the credentials
const MONGO_CONN_STR = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.n7msjwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("MongoDB Connection String:", MONGO_CONN_STR);

// Connect to MongoDB and start the server
mongoose.connect(MONGO_CONN_STR, {
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
