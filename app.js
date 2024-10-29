import express from 'express';
import bodyParser from 'body-parser';
import userRoute from './app/routes/userRoutes.js';
import sequelize from './database.js';
import logger from './utils/logger.js';
import sdc from './utils/statsd.js';


const app = express();

// Use bodyParser to parse JSON requests
app.use(bodyParser.json());

// Health check route
app.use(userRoute);
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

sequelize.sync({ force: false })  // Set `force: true` to drop and recreate tables on every restart
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((err) => {
   
  });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
