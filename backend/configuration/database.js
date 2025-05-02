//database connection configuration for mongodb

const mongoose = require("mongoose");
require('dotenv').config();

// Define the database URL to connect to.
const dev_db_url = "mongodb://127.0.0.1:27017/flitterDB2";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

//connect to mongodb
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connection established successfully");
  } catch (err) {
    console.log("MongoDB connection error: ", err);
    process.exit(1);
  }
}

module.exports = { connectToDatabase, mongoDB };