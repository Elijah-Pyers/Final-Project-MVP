// server.js
// Starts the HTTP server. This is not used in tests (they import app.js instead).

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
