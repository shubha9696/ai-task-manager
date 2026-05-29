const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allow all origins for the assignment to avoid deployment issues
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error handler caught:', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// Initialize database schema and start server
async function startServer() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Server successfully started on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`========================================`);
  });
}

startServer();
