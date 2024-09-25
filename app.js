const express = require('express');
const bodyParser = require('body-parser');
const healthRoute = require('./app/routes/userRoutes.js');

const app = express();

// Use bodyParser to parse JSON requests
app.use(bodyParser.json());

// Health check route
app.use(healthRoute);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
