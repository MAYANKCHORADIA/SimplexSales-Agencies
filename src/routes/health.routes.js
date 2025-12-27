import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Liveness probe - simple 200 OK to indicate process is running
router.get('/live', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// Readiness probe - checks MongoDB connection state
router.get('/ready', (req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const healthy = state === 1;

  if (healthy) {
    return res.status(200).json({ status: 'ready', mongoState: state });
  }

  return res.status(503).json({ status: 'not_ready', mongoState: state });
});

// Convenience route: overall health
router.get('/', (req, res) => {
  const state = mongoose.connection.readyState;
  const healthy = state === 1;
  res.status(healthy ? 200 : 503).json({
    service: 'simplex-sales',
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb: { state },
    status: healthy ? 'ok' : 'degraded',
  });
});

export default router;
