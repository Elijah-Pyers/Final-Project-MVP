// seed.js
// Populates the database with some realistic sample data.
// Run with: npm run seed

// Because seed.js is in the SAME folder as db.js and models/,
// we use "./" (same directory) and "./models/..." (subdirectory).
// seed.js
const { sequelize } = require('./db');
const User = require('../models/user');
const Patient = require('../models/patient');
const Encounter = require('../models/encounter');


async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Drop and recreate all tables for a clean slate
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (force: true)');

    // Create sample users (providers, scribe, biller, admin)
    const users = await User.bulkCreate([
      { name: 'Dr. Alice Provider', email: 'alice@clinic.test', password: 'password123', role: 'provider' },
      { name: 'Dr. Bob Provider', email: 'bob@clinic.test', password: 'password123', role: 'provider' },
      { name: 'Sam Scribe', email: 'sam@clinic.test', password: 'password123', role: 'scribe' },
      { name: 'Bill Biller', email: 'bill@clinic.test', password: 'password123', role: 'biller' },
      { name: 'Admin Annie', email: 'admin@clinic.test', password: 'password123', role: 'admin' },
    ]);

    console.log(`👤 Created ${users.length} users`);

    // Create sample patients
    const patients = await Patient.bulkCreate([
      {
        mrn: 'MRN-1001',
        name: 'John Doe',
        dob: '1985-01-15',
        phone: '555-111-2222',
        email: 'john.doe@test.com',
      },
      {
        mrn: 'MRN-1002',
        name: 'Jane Smith',
        dob: '1990-05-22',
        phone: '555-333-4444',
        email: 'jane.smith@test.com',
      },
    ]);

    console.log(`🧑‍⚕️ Created ${patients.length} patients`);

    // Create encounters for the first patient with the first provider
    const drAlice = users[0];
    const john = patients[0];

    const encounters = await Encounter.bulkCreate([
      {
        patientId: john.id,
        providerId: drAlice.id,
        chiefComplaint: 'Cough and fever',
        vitals: { bp: '120/80', hr: 78, temp: 100.4 },
        status: 'Draft',
      },
      {
        patientId: john.id,
        providerId: drAlice.id,
        chiefComplaint: 'Follow up visit',
        vitals: { bp: '118/76', hr: 72, temp: 98.6 },
        status: 'Final',
      },
    ]);

    console.log(`📄 Created ${encounters.length} encounters`);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
