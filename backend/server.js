const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar middleware de seguridad
const { 
  securityMiddleware, 
  corsOptions, 
  requestLogger, 
  errorHandler 
} = require('./middleware/security');

// Importar middleware de caché
const { cacheMiddleware } = require('./middleware/cache');

// Importar middleware de upload
const { serveImage } = require('./middleware/upload');

// Importar configuración de Passport
const passport = require('./config/passport');

// Importar rutas
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Aplicar middleware de seguridad
securityMiddleware(app);

// Configurar CORS
app.use(cors(corsOptions));

// Middleware de logging
app.use(requestLogger);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar Passport
app.use(passport.initialize());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para servir imágenes optimizadas
app.get('/uploads/:filename', serveImage);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', cacheMiddleware(300), productRoutes); // Cache por 5 minutos
app.use('/api/orders', orderRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Ruta de prueba
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
      'PWA Support'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      health: '/api/health'
    }
  });
});

// Middleware de manejo de errores mejorado
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: '🔍 Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Base de datos: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'}`);
});

module.exports = app;

