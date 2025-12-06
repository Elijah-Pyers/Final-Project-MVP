// app.js
// Builds and exports the Express app (routes, middleware, etc.).
// server.js will import this and start listening on a port.

const express = require('express');
const path = require('path');
const { sequelize } = require('./db');

// Import models so associations are set up
const User = require('../models/user');
const Patient = require('../models/patient');
const Encounter = require('../models/encounter');

const app = express();

// *****************************
// 1. BASIC MIDDLEWARE
// *****************************

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// *****************************
// 2. HEALTH CHECK
// *****************************
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clinical API is running' });
});

// *****************************
// 3. CRUD ROUTES: USERS
// *****************************

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const newUser = await User.create({ name, email, password, role });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const deletedCount = await User.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 4. CRUD ROUTES: PATIENTS
// *****************************

app.get('/api/patients', async (req, res, next) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

app.get('/api/patients/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

app.post('/api/patients', async (req, res, next) => {
  try {
    const { mrn, name, dob, phone, email } = req.body;

    if (!mrn || !name || !dob) {
      return res.status(400).json({ error: 'mrn, name, and dob are required' });
    }

    const newPatient = await Patient.create({ mrn, name, dob, phone, email });
    res.status(201).json(newPatient);
  } catch (err) {
    next(err);
  }
});

app.put('/api/patients/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const { mrn, name, dob, phone, email } = req.body;

    patient.mrn = mrn ?? patient.mrn;
    patient.name = name ?? patient.name;
    patient.dob = dob ?? patient.dob;
    patient.phone = phone ?? patient.phone;
    patient.email = email ?? patient.email;

    await patient.save();
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/patients/:id', async (req, res, next) => {
  try {
    const deletedCount = await Patient.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'Patient not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 5. CRUD ROUTES: ENCOUNTERS
// *****************************

app.get('/api/encounters', async (req, res, next) => {
  try {
    const encounters = await Encounter.findAll({
    // we keep it simple here and skip includes in MVP tests
  });
    res.json(encounters);
  } catch (err) {
    next(err);
  }
});

app.get('/api/encounters/:id', async (req, res, next) => {
  try {
    const encounter = await Encounter.findByPk(req.params.id);
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' });
    res.json(encounter);
  } catch (err) {
    next(err);
  }
});

app.post('/api/encounters', async (req, res, next) => {
  try {
    const { patientId, providerId, chiefComplaint, vitals, status } = req.body;

    if (!patientId || !providerId || !chiefComplaint) {
      return res.status(400).json({ error: 'patientId, providerId, and chiefComplaint are required' });
    }

    const newEncounter = await Encounter.create({
      patientId,
      providerId,
      chiefComplaint,
      vitals: vitals || null,
      status: status || 'Draft',
    });

    res.status(201).json(newEncounter);
  } catch (err) {
    next(err);
  }
});

app.put('/api/encounters/:id', async (req, res, next) => {
  try {
    const encounter = await Encounter.findByPk(req.params.id);
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' });

    const { chiefComplaint, vitals, status } = req.body;

    encounter.chiefComplaint = chiefComplaint ?? encounter.chiefComplaint;
    encounter.vitals = vitals ?? encounter.vitals;
    encounter.status = status ?? encounter.status;

    await encounter.save();
    res.json(encounter);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/encounters/:id', async (req, res, next) => {
  try {
    const deletedCount = await Encounter.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'Encounter not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 6. ERROR HANDLER
// *****************************
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message,
  });
});

module.exports = app;
