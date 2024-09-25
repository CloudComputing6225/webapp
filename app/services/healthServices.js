const sequelize = require('../../database.js');

const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return true; // Connection successful
  } catch (error) {
    return false; // Connection unsuccessful
  }
};

module.exports = {
  checkDatabaseConnection,
};
