// db.js
// Configures SQLite using a ROOT-LEVEL database file.
// This ensures seed.js and the API both use the SAME DB in the ROOT folder.

const { Sequelize } = require('sequelize');
const path = require('path');

// Are we running tests?
const isTestEnv = process.env.NODE_ENV === 'test';

// Always resolve the DB relative to the ROOT directory (one folder above clinical-api-mvp)
const dbFile = isTestEnv
  ? path.join(__dirname, '..', 'clinic_test.db')   // ROOT/clinic_test.db
  : path.join(__dirname, '..', 'clinic.db');       // ROOT/clinic.db

console.log('📁 Using SQLite file:', dbFile);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbFile,
  logging: false,
});

// Optional: test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
};
