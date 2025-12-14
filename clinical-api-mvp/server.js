// server.js
// Starts the HTTP server. This is not used in tests (they import app.js instead).
/*

const app = require('./app');
const { sequelize, testConnection } = require('./db');

const PORT = 3000;

async function start() {
  await testConnection();
  await sequelize.sync({ alter: true }); // keep schema updated
  console.log('✅ Database synced');

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
*/


// clinical-api-mvp/server.js
const app = require('./app');
const { sequelize } = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // IMPORTANT: Do NOT use alter:true or force:true here.
    // SQLite + schema changes will create *_backup tables and FK issues.
    await sequelize.sync();

    console.log(' Database synced (no alter/force)');

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
