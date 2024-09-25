const Sequelize = require('sequelize');
const sequelize = require('../../database.js');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
