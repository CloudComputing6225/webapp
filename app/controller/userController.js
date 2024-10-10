import bcrypt from 'bcrypt';
import User from '../model/index.js';
import basicAuth from 'basic-auth';
import checkDatabaseConnection from '../services/healthServices.js';



const healthCheck = async (req, res) => {
   // Reject requests with query parameters
   if (Object.keys(req.query).length !== 0) {
    return res.status(400).send();
  }
  // Reject requests with a payload
  if (Object.keys(req.body).length !== 0) {
    return res.status(400).end();
  }

  // Check database connection
  const isDatabaseConnected = await checkDatabaseConnection();
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

// Hashing password with bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};



// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const userCredentials = basicAuth(req);
  

  if (!userCredentials || !userCredentials.name || !userCredentials.pass) {
    return res.status(401).send();
  }

  const user = await User.findOne({ where: { email: userCredentials.name } });

  if (!user) {
    return res.status(401).send();
  }

  const isPasswordValid = await bcrypt.compare(userCredentials.pass, user.password);
  if (!isPasswordValid) {
    return res.status(401).send();
  }

  req.user = user;
  next();
};

// Get user information
const getUserInfo = async (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).send();
  }
  const user = req.user;
  const { password, ...userWithoutPassword } = user.toJSON();
  return res.status(200).send(userWithoutPassword);
};

// Update user information
const updateUser = async (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).send();
  }
  const user = req.user;
  const { first_name, last_name, password,email } = req.body;

  if (email) {
    return res.status(400).send();
  }

  if (!first_name && !last_name && !password) {
    return res.status(400).send();
  }

  try {
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = await hashPassword(password);

    user.account_updated = new Date();
    await user.save();

    return res.status(204).send({
      account_updated: user.account_updated
    });
  } catch (error) {
    return res.status(400).send();
  }
};


export default {
  createUser,
  authenticateUser,
  getUserInfo,
  updateUser,
  healthCheck,
};
