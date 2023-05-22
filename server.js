const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { exec } = require('child_process');

// Create an instance of Express
const app = express();
const port = 3000; // Replace with your desired port number

// Configure body-parser middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/location', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB:', error);
  });

// Define a schema and model for the location data
const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
});
const Location = mongoose.model('Location', locationSchema);

// Define an endpoint to receive location data
app.post('/locations', (req, res) => {
  const { latitude, longitude } = req.body;

  // Create a new location document
  const location = new Location({
    latitude,
    longitude,
  });

  // Save the location document to the database
  location.save()
    .then(() => {
      console.log('Location data saved');
      res.sendStatus(201); // Send a success status code
    })
    .catch((error) => {
      console.log('Failed to save location data:', error);
      res.sendStatus(500); // Send an error status code
    });
});

// Run del.js file every 3 seconds to delete data
setInterval(() => {
  exec('node del.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing del.js: ${error}`);
    } else {
      console.log(`del.js output: ${stdout}`);
    }
  });
}, 6000); // 3 seconds

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});