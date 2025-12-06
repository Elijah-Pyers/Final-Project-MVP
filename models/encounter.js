// models/Encounter.js
// This is the "central" table that links a patient and a provider.
// It stores basic visit info and a status (Draft, Review, Final, Billed).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../clinical-api-mvp/db');
const Patient = require('./patient');
const User = require('./user');

const Encounter = sequelize.define('Encounter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chiefComplaint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vitals: {
    // We store vitals as JSON (e.g. { "bp": "120/80", "hr": 70 })
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Review', 'Final', 'Billed'),
    allowNull: false,
    defaultValue: 'Draft',
  },
}, {
  tableName: 'encounters',
});

// ---------------------
// Define Relationships
// ---------------------

// One patient can have many encounters.
Patient.hasMany(Encounter, {
  foreignKey: 'patientId',
  onDelete: 'CASCADE',
});
Encounter.belongsTo(Patient, {
  foreignKey: 'patientId',
});

// One provider (User with role "provider") can have many encounters.
User.hasMany(Encounter, {
  foreignKey: 'providerId',
  as: 'ProviderEncounters',
  onDelete: 'SET NULL',
});
Encounter.belongsTo(User, {
  foreignKey: 'providerId',
  as: 'Provider',
});

module.exports = Encounter;
