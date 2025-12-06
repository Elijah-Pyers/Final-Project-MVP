// models/User.js
// Represents people who use the system: doctors, scribes, billers, admins.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../clinical-api-mvp/db');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Sequelize will auto-generate IDs
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // cannot be null
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // two users cannot share the same email
    validate: {
      isEmail: true, // basic email format validation
    },
  },
  // For MVP we can store plain text or a fake hash just to keep it simple.
  // In the final project you’ll replace this with a real hashed password.
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('provider', 'scribe', 'biller', 'admin'),
    allowNull: false,
  },
}, {
  tableName: 'users',
});

module.exports = User;
