// tests/api.test.js
// Basic Jest + Supertest tests for your MVP API.
// We test at least one CRUD operation per resource type (Users, Patients, Encounters).

const request = require('supertest');
const app = require('../app');            // your Express app
const { sequelize } = require('../db');   // test DB connection
const User = require('../models/User');
const Patient = require('../models/Patient');
const Encounter = require('../models/Encounter');

// Before all tests, sync the test DB and set up some base data.
beforeAll(async () => {
  // This wipes and recreates all tables in clinic_test.db
  await sequelize.sync({ force: true });

  // Create one provider user and one patient to use in encounter tests
  await User.create({
    name: 'Test Provider',
    email: 'provider@test.com',
    password: 'secret',
    role: 'provider',
  });

  await Patient.create({
    mrn: 'TEST-MRN-1',
    name: 'Test Patient',
    dob: '2000-01-01',
    phone: '555-0000',
    email: 'patient@test.com',
  });
});

// After all tests, close the DB connection
afterAll(async () => {
  await sequelize.close();
});

describe('Health Check', () => {
  test('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Users CRUD', () => {
  test('POST /api/users creates a new user (success)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'New Scribe',
        email: 'scribe@test.com',
        password: 'password123',
        role: 'scribe',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe('scribe@test.com');
  });

  test('POST /api/users returns 400 when required fields are missing (error)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        // missing email, password, role
        name: 'Bad User',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/users returns an array of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // We created at least 2 users: Test Provider + New Scribe
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Patients CRUD', () => {
  test('POST /api/patients creates a new patient (success)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({
        mrn: 'TEST-MRN-2',
        name: 'Another Patient',
        dob: '1999-05-05',
        phone: '555-9999',
        email: 'another@test.com',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.mrn).toBe('TEST-MRN-2');
  });

  test('POST /api/patients returns 400 if required fields missing (error)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({
        // missing mrn and dob
        name: 'Incomplete Patient',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/patients returns an array of patients', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/patients/:id returns 404 for a non-existent patient (error)', async () => {
    const res = await request(app).get('/api/patients/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Patient not found');
  });
});

describe('Encounters CRUD', () => {
  test('POST /api/encounters creates a new encounter (success)', async () => {
    const provider = await User.findOne({ where: { email: 'provider@test.com' } });
    const patient = await Patient.findOne({ where: { mrn: 'TEST-MRN-1' } });

    const res = await request(app)
      .post('/api/encounters')
      .send({
        patientId: patient.id,
        providerId: provider.id,
        chiefComplaint: 'Headache',
        vitals: { bp: '120/80', hr: 75, temp: 99.1 },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.chiefComplaint).toBe('Headache');
    expect(res.body.status).toBe('Draft'); // default
  });

  test('POST /api/encounters returns 400 when required fields are missing (error)', async () => {
    const res = await request(app)
      .post('/api/encounters')
      .send({
        chiefComplaint: 'Missing IDs',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/encounters returns an array of encounters', async () => {
    const res = await request(app).get('/api/encounters');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
