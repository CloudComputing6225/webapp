const express = require('express');
const router = express.Router();
const healthController = require('../controller/userController.js');

// Define the /healthz route
router.route('/healthz')
  .get(healthController.healthCheck)
  .all((req, res) => {
    // Handle all other HTTP methods with 405 Method Not Allowed
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  });

module.exports = router;
