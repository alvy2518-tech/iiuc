const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS === '*' ? '*' : process.env.ALLOWED_ORIGINS.split(','),
  credentials: process.env.ALLOWED_ORIGINS !== '*'
}));
// Increase payload size limit for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const aiAnalysisRoutes = require('./routes/aiAnalysis.routes');
const savedJobRoutes = require('./routes/savedJob.routes');
const interviewRoutes = require('./routes/interview.routes');
const messagingRoutes = require('./routes/messaging.routes');
const externalJobsRoutes = require('./routes/externalJobs.routes');
const courseRoutes = require('./routes/course.routes');
const cvRoutes = require('./routes/cv.routes');
const videoCallRoutes = require('./routes/videoCall.routes');
const adminRoutes = require('./routes/admin.routes');

// Try to load headshot routes, but make it optional
// Headshot feature requires sharp which may not work on all systems
// Temporarily disabled due to sharp native module issues on Windows
let headshotRoutesAvailable = false;
let headshotRoutes = express.Router(); // Empty router by default

// Uncomment below to enable headshot feature once sharp is fixed
/*
try {
  headshotRoutes = require('./routes/headshot.routes');
  headshotRoutesAvailable = true;
  console.log('✅ Headshot routes loaded');
} catch (error) {
  console.warn('⚠️  Headshot routes not available - feature disabled:', error.message);
  headshotRoutesAvailable = false;
}
*/
console.log('⚠️  Headshot feature temporarily disabled - sharp module issue');

const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/profiles`, profileRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/ai`, aiAnalysisRoutes);
app.use(`${API_PREFIX}/saved-jobs`, savedJobRoutes);
app.use(`${API_PREFIX}/interviews`, interviewRoutes);
app.use(`${API_PREFIX}/messages`, messagingRoutes);
app.use(`${API_PREFIX}/external-jobs`, externalJobsRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/cv`, cvRoutes);
app.use(`${API_PREFIX}/video-calls`, videoCallRoutes);
// Register headshot routes (currently disabled - returns 404)
app.use(`${API_PREFIX}/headshots`, (req, res) => {
  res.status(503).json({ 
    error: 'Service Unavailable', 
    message: 'Headshot feature temporarily unavailable - sharp module issue' 
  });
});
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Health check
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Local API: http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🌐 Network API: http://<YOUR_IP>:${PORT}${API_PREFIX}`);
});

module.exports = app;

