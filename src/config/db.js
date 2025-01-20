const mongoose = require('mongoose');
require('dotenv').config()
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI, {
    });
    console.log('Database connection');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;