require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
// const { sequelize, initializeModels } = require('./models');
const apiRoutes = require('./routes'); // Import the main API router
const sitemapRoutes = require('./routes/sitemap.routes'); // Import sitemap routes separately
const path = require('path');
const { ValidationError } = require('sequelize'); // Import Sequelize ValidationError
// const seedAll = require('../seeders/seed');
const schedulerService = require('./services/schedulerService');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - Add this before any middleware
app.set('trust proxy', 1); // Trust first proxy

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:5173',
      'http://10.0.2.2:3000', // Android Emulator
      'https://harpaljob.com',
      'https://www.harpaljob.com',
      'https://frontend.harpaljob.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-CSRF-TOKEN'
  ],
  credentials: true,
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Compression middleware for better performance
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression for all other responses
    return compression.filter(req, res);
  }
}));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount all API routes under /api
// Note: Specific limiters applied before this will override the general apiLimiter for those paths
app.use('/api', apiRoutes);

// Mount sitemap route at the root
app.use('/sitemap.xml', sitemapRoutes);

// Improved Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS Error: Origin not allowed',
      error: 'The request origin is not allowed by CORS policy'
    });
  }

  if (err instanceof ValidationError) {
    // Handle Sequelize validation errors
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors.map(e => ({
        message: e.message,
        type: e.type,
        path: e.path,
        value: e.value,
      })),
    });
  }

  // Handle JWT authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Handle rate limit errors
   if (err.status === 429) {
    return res.status(429).json({ message: err.message });
  }

  // Generic error handling for all other errors
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'An unexpected error occurred' : err.message;

  res.status(statusCode).json({
    message: message,
  });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database and models
    // const models = await initializeModels();
    
    // Seed database`
    // console.log('🌱 Starting automatic database seeding...');
    // await seedAll(true);
    // console.log('✅ Database seeding completed');

    // Then sync database with associations
    // await sequelize.sync({ alter: false });
    // console.log('Database synchronized with associations');

    // Initialize notification scheduler
    console.log('🕒 Initializing notification scheduler...');
    schedulerService.init();
    console.log('✅ Notification scheduler initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 