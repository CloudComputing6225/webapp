const healthService = require('../services/healthServices.js');

const healthCheck = async (req, res) => {
  // Reject requests with a payload
  if (Object.keys(req.body).length !== 0) {
    return res.status(400).end();
  }

  // Check database connection
  const isDatabaseConnected = await healthService.checkDatabaseConnection();
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });

  if (isDatabaseConnected) {
    // If connected, return 200 OK
    return res.status(200).end();
  } else {
    // If not connected, return 503 Service Unavailable
    return res.status(503).end();
  }
};

module.exports = {
  healthCheck,
};
