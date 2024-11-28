// const mongoose = require('mongoose');
// const repl = require('repl');

import mongoose from 'mongoose';
import repl from 'repl';

// Replace with your MongoDB connection URI
const uri = "mongodb+srv://oruntakelechi86:4pHwh0cojYMj49aD@kelechi0.0to4y.mongodb.net/MyMongoDB?retryWrites=true&w=majority&appName=Kelechi0";//process.env.MONGO_URI; // Update with your DB URI
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

(async () => {
  try {
    // Connect to the database using Mongoose
    await mongoose.connect(uri, options);
    console.log('Mongoose connected to the database.');

    // Create the REPL instance
    const localRepl = repl.start("> ");

    // Expose useful Mongoose objects to the REPL context
    localRepl.context.mongoose = mongoose;
    localRepl.context.db = mongoose.connection;

    console.log('Mongoose is accessible as `mongoose`.');
    console.log('Mongoose connection is accessible as `db`.');

    // Automatically close the connection on REPL exit
    localRepl.on('exit', async () => {
      await mongoose.disconnect();
      console.log('Mongoose disconnected from the database.');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
})();
