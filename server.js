const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { exec } = require('child_process');

const port = 3000;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle different routes/endpoints
  if (req.method === 'POST' && req.url === '/locations') {
    handlePostLocations(req, res);
  } else {
    handleNotFound(res);
  }
});

// Configure body-parser middleware
server.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sasi:SASANKsasi%4098@bus.pn21yte.mongodb.net/location?retryWrites=true&w=majority/', {
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

// Handle the /locations POST endpoint
function handlePostLocations(req, res) {
  const { latitude, longitude } = req.body;

  const location = new Location({
    latitude,
    longitude,
  });

  location.save()
    .then(() => {
      console.log('Location data saved');
      res.statusCode = 201;
      res.end('Location data saved');
    })
    .catch((error) => {
      console.log('Failed to save location data:', error);
      res.statusCode = 500;
      res.end('Failed to save location data');
    });
}

// Handle a not found request
function handleNotFound(res) {
  res.statusCode = 404;
  res.end('Not Found');
}

// Run del.js file every 6 seconds to delete data
setInterval(() => {
  exec('node del.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing del.js: ${error}`);
    } else {
      console.log(`del.js output: ${stdout}`);
    }
  });
}, 6000);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
