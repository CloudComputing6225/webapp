import bcrypt from 'bcrypt';
import User from '../model/index.js';
import basicAuth from 'basic-auth';
import checkDatabaseConnection from '../services/healthServices.js';
import logger from '../../utils/logger.js';
import sdc from '../../utils/statsd.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import mailgun from 'mailgun-js';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import { Op } from 'sequelize';

const sns = new AWS.SNS();


const s3Client = new S3Client({ region: process.env.AWS_REGION });
const healthCheck = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.healthCheck.calls');

  if (Object.keys(req.query).length !== 0 || Object.keys(req.body).length !== 0) {
    sdc.timing('api.healthCheck.time', Date.now() - start);
    return res.status(400).send();
  }

  const isDatabaseConnected = await checkDatabaseConnection();
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });

  sdc.timing('api.healthCheck.time', Date.now() - start);
  if (isDatabaseConnected) {
    logger.info('Health check successful');
    return res.status(200).end();
  } else {
    logger.warn('Health check failed: Database not connected');
    return res.status(503).end();
  }
};

const hashPassword = async (password) => {
  const start = Date.now();
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  sdc.timing('function.hashPassword.time', Date.now() - start);
  return hashedPassword;
};

const createUser = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.createUser.calls');
  logger.info('Creating user - start');

  const { email, password, first_name, last_name, account_created, account_updated, ...rest } = req.body;

  if (account_created || account_updated || Object.keys(rest).length !== 0) {
    logger.warn('Invalid user creation attempt: extra fields provided');
    sdc.timing('api.createUser.time', Date.now() - start);
    return res.status(400).send();
  }

  if (!email || !password || !first_name || !last_name) {
    logger.warn('Invalid user creation attempt: missing required fields');
    sdc.timing('api.createUser.time', Date.now() - start);
    return res.status(400).send();
  }

  const dbStart = Date.now();
  const existingUser = await User.findOne({ where: { email } });
  sdc.timing('db.findUser.time', Date.now() - dbStart);

  if (existingUser) {
    // Handle resend verification logic
    if (existingUser.is_verified) {
      logger.warn('Resend verification attempt for verified user', { email });
      return res.status(400).send({ message: "User is already verified." });
    }

    const now = new Date();
    const twoMinutesAgo = new Date(now - 2 * 60 * 1000);

    if (existingUser.last_verification_sent > twoMinutesAgo) {
      logger.warn('Resend verification attempt too soon', { email });
      return res.status(429).send({ message: "Please wait 2 minutes before requesting a new verification link." });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(now.getTime() + 2 * 60 * 1000);

    existingUser.verification_token = verificationToken;
    existingUser.verification_token_expires = tokenExpiration;
    existingUser.last_verification_sent = now;
    await existingUser.save();

    // Publish message to SNS topic
    const message = JSON.stringify({
      userId: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.first_name,
      verificationToken: verificationToken
    });

    await sns.publish({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: message
    }).promise();

    logger.info('Verification link resent', { userId: existingUser.id });
    return res.status(200).send({ message: "Verification link has been resent. Please check your email." });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(Date.now() + 2 * 60 * 1000);
    const dbCreateStart = Date.now();
    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      account_created: new Date(),
      account_updated: new Date(),
      is_verified: false,
      verification_token: verificationToken,
      verification_token_expires: tokenExpiration,
      last_verification_sent: new Date()
    });
    // Publish message to SNS topic
    const message = JSON.stringify({
      userId: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      verificationToken: verificationToken
    });

    await sns.publish({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: message
    }).promise();
    // sendWelcomeEmail(newUser.email, newUser.first_name);
    sdc.timing('db.createUser.time', Date.now() - dbCreateStart);

    const { password: _, verification_token: __, ...userWithoutPassword } = newUser.toJSON();
    logger.info('User created successfully', { userId: newUser.id });
    sdc.timing('api.createUser.time', Date.now() - start);
    return res.status(201).send({userWithoutPassword, message: "User created. Please check your email for verification link."});
  } catch (error) {
    logger.error('Error creating user', { error: error.message, stack: error.stack });
    sdc.timing('api.createUser.time', Date.now() - start);
    return res.status(400).send();
  }
};


const authenticateUser = async (req, res, next) => {
  const start = Date.now();
  sdc.increment('api.authenticateUser.calls');

  const userCredentials = basicAuth(req);

  if (!userCredentials || !userCredentials.name || !userCredentials.pass) {
    logger.warn('Authentication failed: missing credentials');
    sdc.timing('api.authenticateUser.time', Date.now() - start);
    return res.status(401).send();
  }

  const dbStart = Date.now();
  const user = await User.findOne({ where: { email: userCredentials.name } });
  sdc.timing('db.findUser.time', Date.now() - dbStart);

  if (!user) {
    logger.warn('Authentication failed: user not found', { email: userCredentials.name });
    sdc.timing('api.authenticateUser.time', Date.now() - start);
    return res.status(401).send();
  }
  if (!user.is_verified) {
    logger.warn('Authentication failed: user not verified', { email: userCredentials.name });
    sdc.timing('api.authenticateUser.time', Date.now() - start);
    return res.status(403).send({ message: "Please verify your email before logging in." });
  }

  const isPasswordValid = await bcrypt.compare(userCredentials.pass, user.password);
  if (!isPasswordValid) {
    logger.warn('Authentication failed: invalid password', { email: userCredentials.name });
    sdc.timing('api.authenticateUser.time', Date.now() - start);
    return res.status(401).send();
  }

  req.user = user;
  logger.info('User authenticated successfully', { userId: user.id });
  sdc.timing('api.authenticateUser.time', Date.now() - start);
  next();
};
const verifyEmail = async (req, res) => {
  logger.info('Verification endpoint hit', { token: req.query.token });
  const { token } = req.query;
  logger.info('Verification attempt', { token });

  if (!token) {
    return res.status(400).send({ message: "Verification token is required." });
  }

  try {
    logger.info('Searching for user with token', { token });
    const user = await User.findOne({ 
      where: { 
        verification_token: token,
        verification_token_expires: { [Op.gt]: new Date() }
      }
    });
    logger.info('User found for email verification', { user });

    if (!user) {
      return res.status(400).send({ message: "Invalid verification token." });
    }

    if (user.is_verified) {
      return res.status(400).send({ message: "User is already verified." });
    }

    const tokenExpiration = new Date(user.verification_token_expires);
    if (tokenExpiration < new Date()) {
      return res.status(400).send({ message: "Verification token has expired." });
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    return res.status(200).send({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    logger.error('Error verifying email', { 
      error: error.message, 
      stack: error.stack,
      token: token,
      fullError: error
    });
    return res.status(400).send({ message: "An error occurred while verifying email." });
  }
};
const getUserInfo = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.getUserInfo.calls');

  if (Object.keys(req.query).length !== 0) {
    logger.warn('Invalid get user info attempt: query parameters provided');
    sdc.timing('api.getUserInfo.time', Date.now() - start);
    return res.status(400).send();
  }

  const user = req.user;
  const { password, ...userWithoutPassword } = user.toJSON();
  logger.info('User info retrieved successfully', { userId: user.id });
  sdc.timing('api.getUserInfo.time', Date.now() - start);
  return res.status(200).send(userWithoutPassword);
};

const updateUser = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.updateUser.calls');

  if (Object.keys(req.query).length !== 0) {
    logger.warn('Invalid update user attempt: query parameters provided');
    sdc.timing('api.updateUser.time', Date.now() - start);
    return res.status(400).send();
  }

  const user = req.user;
  const { first_name, last_name, password, email } = req.body;

  if (email) {
    logger.warn('Invalid update user attempt: trying to update email');
    sdc.timing('api.updateUser.time', Date.now() - start);
    return res.status(400).send();
  }

  if (!first_name && !last_name && !password) {
    logger.warn('Invalid update user attempt: no fields to update');
    sdc.timing('api.updateUser.time', Date.now() - start);
    return res.status(400).send();
  }

  try {
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = await hashPassword(password);

    user.account_updated = new Date();
    const dbStart = Date.now();
    await user.save();
    sdc.timing('db.updateUser.time', Date.now() - dbStart);

    logger.info('User updated successfully', { userId: user.id });
    sdc.timing('api.updateUser.time', Date.now() - start);
    return res.status(204).send();
  } catch (error) {
    logger.error('Error updating user', { userId: user.id, error: error.message, stack: error.stack });
    sdc.timing('api.updateUser.time', Date.now() - start);
    return res.status(400).send();
  }
};
const addProfilePicture = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.addProfilePicture.calls');

  try {
    if (!req.file) {
      logger.warn('No file uploaded');
      sdc.timing('api.addProfilePicture.time', Date.now() - start);
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.file;
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const validExtensions = ['png', 'jpg', 'jpeg'];
    if (!validExtensions.includes(fileExtension)) {
        logger.warn('Invalid file type uploaded');
        sdc.timing('api.addProfilePicture.time', Date.now() - start);
        return res.status(400).json({ message: 'Unsupported file type' });
    }

    // const file = req.file;
    const userId = req.user.id;
     // Check if a profile picture already exists
     const existingUser = await User.findByPk(userId);
     if (existingUser && existingUser.profile_pic) {
       logger.warn('User already has a profile picture');
       sdc.timing('api.addProfilePicture.time', Date.now() - start);
       return res.status(400).json({ message: 'Profile picture already exists. Delete the existing one first.' });
     }
    const fileId = uuidv4();
    // const fileExtension = file.originalname.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const s3Key = `${userId}/${fileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const s3Start = Date.now();
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    sdc.timing('s3.putObject.time', Date.now() - s3Start);

    const imageMetadata = {
      file_name: file.originalname,
      id: fileId,
      url: `${process.env.S3_BUCKET_URL}/${s3Key}`,
      upload_date: new Date().toISOString(),
      user_id: userId,
    };

    const dbStart = Date.now();
    await User.update(
      { profile_pic: imageMetadata },
      { where: { id: userId } }
    );
    sdc.timing('db.updateUser.time', Date.now() - dbStart);

    logger.info('Profile picture uploaded successfully', { userId, fileId });
    sdc.timing('api.addProfilePicture.time', Date.now() - start);
    res.status(201).json(imageMetadata);
  } catch (error) {
    logger.error('Error uploading profile picture', { error: error.message, stack: error.stack });
    sdc.timing('api.addProfilePicture.time', Date.now() - start);
    res.status(400).json({ message: 'Error uploading file' });
  }
};

const deleteProfilePicture = async (req, res) => {
  const start = Date.now();
  sdc.increment('api.deleteProfilePicture.calls');

  try {
    const userId = req.user.id;
    const dbStart = Date.now();
    const user = await User.findByPk(userId);
    sdc.timing('db.findUser.time', Date.now() - dbStart);

    if (!user.profile_pic) {
      logger.warn('No profile picture found for deletion', { userId });
      sdc.timing('api.deleteProfilePicture.time', Date.now() - start);
      return res.status(404).json({ message: 'No profile picture found' });
    }

    const imageMetadata = user.profile_pic;
    const s3Key = `${userId}/${imageMetadata.id}.${imageMetadata.file_name.split('.').pop()}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    const s3Start = Date.now();
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    sdc.timing('s3.deleteObject.time', Date.now() - s3Start);

    const dbDeleteStart = Date.now();
    await User.update(
      { profile_pic: null },
      { where: { id: userId } }
    );
    sdc.timing('db.updateUser.time', Date.now() - dbDeleteStart);

    logger.info('Profile picture deleted successfully', { userId });
    sdc.timing('api.deleteProfilePicture.time', Date.now() - start);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting profile picture', { error: error.message, stack: error.stack });
    sdc.timing('api.deleteProfilePicture.time', Date.now() - start);
    res.status(400).json({ message: 'Error deleting file' });
  }
};

const getProfilePicture = async (req, res) => {
    const start = Date.now();
    sdc.increment('api.getProfilePicture.calls');
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user || !user.profile_pic) {
        logger.warn('No profile picture found', { userId });
        sdc.timing('api.getProfilePicture.time', Date.now() - start);
        return res.status(404).json({ message: 'No profile picture found.' });
    }

    const profilePic = user.profile_pic;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: profilePic.url,
    };

    try {
        const command = new GetObjectCommand(params);
        const urlStart = Date.now();
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });  // URL expires in 1 hour
        profilePic.url = url;
        sdc.timing('s3.getSignedUrl.time', Date.now() - urlStart); // Timing how long it takes to get signed URL

        sdc.timing('api.getProfilePicture.time', Date.now() - start);
        return res.status(200).json({ profilePic });
    } catch (error) {
        logger.error('Failed to generate image URL', { error: error.message, stack: error.stack });
        sdc.timing('api.getProfilePicture.time', Date.now() - start);
        return res.status(400).json({ message: 'Failed to retrieve image.' });
    }
};


export default {
  createUser,
  authenticateUser,
  getUserInfo,
  updateUser,
  healthCheck,
  addProfilePicture,
  deleteProfilePicture,
  getProfilePicture,
  verifyEmail
};