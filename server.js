const http = require('http');
  const url = require('url');
  const querystring = require('querystring');
  const mongoose = require('mongoose');
  const { exec } = require('child_process');
  
  const port = 3000;
  
  // Create a basic HTTP server
  const server = http.createServer((req, res) => {
    // Enable CORS headers if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Parse the request URL
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
  
    // Extract the query parameters
    const queryParams = querystring.parse(parsedUrl.query);
  
    // Route the request based on the path and HTTP method
    const routeHandler = router.findRoute(req.method, path);
    if (routeHandler) {
      // Create a request context object
      const context = {
        req,
        res,
        path,
        queryParams,
        body: '',
      };
  
      // Handle request body data
      req.on('data', (chunk) => {
        context.body += chunk;
      });
  
      // Handle the request once the body is fully received
      req.on('end', () => {
        context.body = JSON.parse(context.body || '{}');
  
        // Apply any registered middleware
        middlewareHandler.execute(context, () => {
          // Invoke the route handler
          routeHandler(context);
        });
      });
    } else {
      // Route not found
      handleNotFound(res);
    }
  });
  
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
  
  // Define a router object to handle routing
  const router = {
    routes: {},
  
    get(path, handler) {
      this.routes[path] = { GET: handler };
    },
  
    post(path, handler) {
      this.routes[path] = { POST: handler };
    },
  
    findRoute(method, path) {
      const route = this.routes[path];
      if (route) {
        return route[method];
      }
      return null;
    },
  };
  
  // Define a middleware handler
  const middlewareHandler = {
    middleware: [],
  
    use(handler) {
      this.middleware.push(handler);
    },
  
    execute(context, next) {
      let index = 0;
  
      const runMiddleware = () => {
        if (index >= this.middleware.length) {
          next();
          return;
        }
  
        const middleware = this.middleware[index];
        index++;
  
        middleware(context, runMiddleware);
      };
  
      runMiddleware();
    },
  };
  
  // Define an endpoint to receive location data
  router.post('/locations', (context) => {
    const { latitude, longitude } = context.body;
  
    const location = new Location({
      latitude,
      longitude,
    });
  
    location.save()
      .then(() => {
        console.log('Location data saved');
        context.res.statusCode = 201;
        context.res.end('Location data saved');
      })
      .catch((error) => {
        console.log('Failed to save location data:', error);
        context.res.statusCode = 500;
        context.res.end('Failed to save location data');
      });
  });
  
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
  