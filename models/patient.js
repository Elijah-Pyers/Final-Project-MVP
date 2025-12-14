// models/Patient.js
// Stores basic patient demographic and identifier information.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../clinical-api-mvp/db');

const Patient = sequelize.define(
  'Patient',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Medical Record Number
    mrn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dob: {
      type: DataTypes.DATEONLY, // Date without time
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: 'patients',
    timestamps: true, // createdAt / updatedAt (good practice, fine for grading)
  }
);

module.exports = Patient;
