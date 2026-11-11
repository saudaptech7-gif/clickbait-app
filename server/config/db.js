const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in server/.env");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully!");
    console.log("Database name:", mongoose.connection.name);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log(
      "Available collections:",
      collections.map((collection) => collection.name),
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
