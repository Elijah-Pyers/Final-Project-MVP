// models/User.js
// Represents people who use the system: providers, scribes, billers, admins.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../clinical-api-mvp/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    // Store ONLY hashed passwords (bcrypt)
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM('provider', 'scribe', 'biller', 'admin'),
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;
