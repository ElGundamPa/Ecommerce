const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();

// Logger
const logger = require('./config/logger');

// Importar middleware de seguridad
const { 
  securityMiddleware, 
  corsOptions, 
  requestLogger
} = require('./middleware/security');

// Error handling
const { notFound, errorHandler } = require('./middleware/error');

// Importar middleware de caché
const { cacheMiddleware } = require('./middleware/cache');

// Importar middleware de upload
const { serveImage } = require('./middleware/upload');

// Importar configuración de Passport
const passport = require('./config/passport');

// Swagger docs
const swaggerDocs = require('./config/swagger');

// Importar rutas
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Seguridad base
securityMiddleware(app);

// CORS
app.use(cors(corsOptions));

// Cookies + CSRF (solo en rutas mutables)
app.use(cookieParser());
const csrfProtection = csurf({ cookie: true });

// Logging
app.use(requestLogger);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport
app.use(passport.initialize());

// MongoDB: evitar reconectar en entorno de test (MongoMemoryServer gestiona la conexión)
if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info('✅ Conectado a MongoDB'))
    .catch((err) => logger.error('❌ Error conectando a MongoDB:', err));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:filename', serveImage);

// Swagger docs
swaggerDocs(app);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// CSRF token route (protect to generate token)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', cacheMiddleware(300), productRoutes);
app.use('/api/orders', csrfProtection, orderRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🛒 API de Ecommerce MVP funcionando correctamente',
    version: '2.0.0',
    features: [
      'Autenticación JWT',
      'Autenticación Social (Google, Facebook, Twitter)',
      'Paginación y Filtros',
      'Caché Inteligente',
      'Optimización de Imágenes',
      'Rate Limiting',
      'Seguridad Mejorada',
      'PWA Support',
      'Swagger Docs',
    ],
    endpoints: {
      docs: '/api/docs',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      health: '/api/health',
    },
  });
});

// 404 and error
app.use(notFound);
app.use(errorHandler);

// Unhandled
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  logger.info(`📱 Frontend: http://localhost:3000`);
  logger.info(`🔧 API: http://localhost:${PORT}`);
  logger.info(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️ Base de datos: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'}`);
});

module.exports = app;


