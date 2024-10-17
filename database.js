import dotenv from 'dotenv';

dotenv.config({ path: '/opt/app/.env' });


import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

export default sequelize;

// sequelize.authenticate().then(() => {
//     console.log("CS");
// }).catch((err) => {
//     console.log("Error");
// })

