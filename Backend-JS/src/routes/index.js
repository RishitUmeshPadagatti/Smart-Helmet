// src/routes/index.js

const express = require('express');
const usersRouter = require('./users');
const sensorsRouter = require('./sensors');
const videoRouter = require('./video');
const helmetRouter = require('./helmet');

const router = express.Router();

// Mount routers
router.use('/users', usersRouter);
router.use('/sensors', sensorsRouter);
router.use('/video', videoRouter);
router.use('/helmet-detect', helmetRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Smart Helmet Backend API',
    version: '1.0.0'
  });
});

module.exports = router;
