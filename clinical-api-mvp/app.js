// app.js
// Builds and exports the Express app (routes, middleware, etc.).
// server.js will import this and start listening on a port.

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sequelize } = require('./db');

// Import models (your models are in ../models based on your structure)
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

// Ensure "/" reliably serves your index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// *****************************
// 2. AUTH CONFIG
// *****************************

// Put JWT_SECRET in an environment variable for production.
// For local dev only, this fallback prevents crashes.
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

// Helper: create JWT
function signToken(user) {
  // Keep token payload small (don’t put PHI, passwords, etc.)
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// Middleware: require valid JWT
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header (use Bearer token)' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware: require one of these roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
}

// *****************************
// 3. HEALTH CHECK
// *****************************
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clinical API is running' });
});

// *****************************
// 4. AUTH ENDPOINTS (REGISTER / LOGIN / VALIDATE / LOGOUT)
// *****************************

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    // check existing email
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await User.create({
      name,
      email,
      role,
      passwordHash, // store hash
    });

    const token = signToken(created);

    // Return safe user info only
    res.status(201).json({
      user: { id: created.id, name: created.name, email: created.email, role: created.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // compare password -> passwordHash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  res.json({ message: 'Logged out (client should delete token)' });
});

// *****************************
// 5. USERS (SECURED + OWNERSHIP RULES)
// *****************************

app.get('/api/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.get('/api/users/:id', requireAuth, async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);

    if (req.user.role !== 'admin' && req.user.id !== requestedId) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own user record' });
    }

    const user = await User.findByPk(requestedId, {
      attributes: ['id', 'name', 'email', 'role'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, role, passwordHash });

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', requireAuth, async (req, res, next) => {
  try {
    const requestedId = Number(req.params.id);

    if (req.user.role !== 'admin' && req.user.id !== requestedId) {
      return res.status(403).json({ error: 'Forbidden: you can only update your own user record' });
    }

    const { name, email, role } = req.body;
    const user = await User.findByPk(requestedId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: only admin can change roles' });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (role) user.role = role;

    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const deletedCount = await User.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 6. PATIENTS (ROLE-BASED ACCESS)
// *****************************

app.get('/api/patients', requireAuth, requireRole('provider', 'scribe', 'biller', 'admin'), async (req, res, next) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

app.get('/api/patients/:id', requireAuth, requireRole('provider', 'scribe', 'biller', 'admin'), async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

app.post('/api/patients', requireAuth, requireRole('provider', 'admin'), async (req, res, next) => {
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

app.put('/api/patients/:id', requireAuth, requireRole('provider', 'admin'), async (req, res, next) => {
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

app.delete('/api/patients/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const deletedCount = await Patient.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'Patient not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 7. ENCOUNTERS (ROLE-BASED ACCESS)
// *****************************

app.get('/api/encounters', requireAuth, requireRole('provider', 'scribe', 'biller', 'admin'), async (req, res, next) => {
  try {
    const encounters = await Encounter.findAll();
    res.json(encounters);
  } catch (err) {
    next(err);
  }
});

app.get('/api/encounters/:id', requireAuth, requireRole('provider', 'scribe', 'biller', 'admin'), async (req, res, next) => {
  try {
    const encounter = await Encounter.findByPk(req.params.id);
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' });
    res.json(encounter);
  } catch (err) {
    next(err);
  }
});

app.post('/api/encounters', requireAuth, requireRole('provider', 'scribe', 'admin'), async (req, res, next) => {
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

app.put('/api/encounters/:id', requireAuth, requireRole('provider', 'biller', 'admin'), async (req, res, next) => {
  try {
    const encounter = await Encounter.findByPk(req.params.id);
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' });

    const { chiefComplaint, vitals, status } = req.body;

    if (req.user.role === 'biller') {
      if (status !== 'Billed') {
        return res.status(403).json({ error: 'Forbidden: biller can only set status to "Billed"' });
      }
      encounter.status = 'Billed';
      await encounter.save();
      return res.json(encounter);
    }

    encounter.chiefComplaint = chiefComplaint ?? encounter.chiefComplaint;
    encounter.vitals = vitals ?? encounter.vitals;
    encounter.status = status ?? encounter.status;

    await encounter.save();
    res.json(encounter);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/encounters/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const deletedCount = await Encounter.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) return res.status(404).json({ error: 'Encounter not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// *****************************
// 8. ERROR HANDLER
// *****************************
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message,
  });
});

module.exports = app;
