// models/Encounter.js
// Central table linking a patient + provider.
// Stores visit info and status (Draft, Review, Final, Billed).

const { DataTypes } = require('sequelize');
const { sequelize } = require('../clinical-api-mvp/db');

// IMPORTANT: match your actual filenames (case matters on many systems)
const Patient = require('./patient');
const User = require('./user');

const Encounter = sequelize.define(
  'Encounter',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Foreign key: Patient
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // Foreign key: Provider (User)
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false, // keep required for MVP consistency
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },

    chiefComplaint: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Vitals stored as JSON (SQLite supports JSON as TEXT internally but Sequelize handles it fine)
    vitals: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('Draft', 'Review', 'Final', 'Billed'),
      allowNull: false,
      defaultValue: 'Draft',
    },
  },
  {
    tableName: 'encounters',
    timestamps: true,
  }
);

// ---------------------
// Relationships
// ---------------------

// One patient can have many encounters
Patient.hasMany(Encounter, {
  foreignKey: 'patientId',
  onDelete: 'CASCADE',
});
Encounter.belongsTo(Patient, {
  foreignKey: 'patientId',
});

// One provider (User) can have many encounters
User.hasMany(Encounter, {
  foreignKey: 'providerId',
  as: 'ProviderEncounters',
});
Encounter.belongsTo(User, {
  foreignKey: 'providerId',
  as: 'Provider',
});

module.exports = Encounter;
