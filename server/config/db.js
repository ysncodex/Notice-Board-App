const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to server/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
}

module.exports = connectDB;
