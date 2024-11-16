import express from 'express';
import multer from 'multer';
import userController from '../controller/userController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/healthz')
  .get(userController.healthCheck)
  .head((req, res) => {
    // Explicitly handle HEAD requests and return 405
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  })
  .all((req, res) => {
    // Handle all other HTTP methods with 405 Method Not Allowed
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  });

// Create a new user
router.post('/v2/user', userController.createUser);

router.route('/v2/user/self')
.get(userController.authenticateUser, userController.getUserInfo)
.put(userController.authenticateUser, userController.updateUser)
  .head((req, res) => {
    // Explicitly handle HEAD requests and return 405
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  })
  .all((req, res) => {
    // Handle all HTTP methods with 405 Method Not Allowed
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  });
  router.route('/v2/user/self/pic')
  .post(userController.authenticateUser, upload.single('file'), userController.addProfilePicture)
  .get(userController.authenticateUser, userController.getProfilePicture)
  .delete(userController.authenticateUser, userController.deleteProfilePicture)
  .all((req, res) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(405).end(); // Method Not Allowed
  });
  // Add new route for email verification
  router.get('/v2/verify', userController.verifyEmail);


export default router;
