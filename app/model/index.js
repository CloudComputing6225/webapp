import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../database.js';


const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    account_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    profile_pic: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verification_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: false,
    hooks: {
        beforeUpdate: (user) => {
          user.account_updated = new Date(); // Update the `account_updated` field before saving
        },
        beforeCreate: (user) => {
          user.account_created = new Date(); // Set `account_created` during creation
          user.account_updated = new Date(); // Initialize `account_updated`
        }
      }
  });
  
  export default User;
