const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Demasiadas solicitudes, intenta más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiters específicos
const globalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Demasiadas solicitudes. Intenta en 15 minutos.'
);

const authLoginLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  20, // 20 intentos de login
  'Demasiados intentos de login. Intenta en 15 minutos.'
);

const orderLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  50, // 50 requests de orders
  'Demasiadas solicitudes de pedidos. Intenta en 15 minutos.'
);

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://tu-dominio.com',
      'https://www.tu-dominio.com'
    ];
    
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware de seguridad
const securityMiddleware = (app) => {
  // CSP dinámico basado en variables de entorno
  const cspConnectSrc = ["'self'"];
  if (process.env.FRONTEND_URL) {
    cspConnectSrc.push(process.env.FRONTEND_URL);
  }
  if (process.env.CSP_CONNECT_EXTRA) {
    cspConnectSrc.push(process.env.CSP_CONNECT_EXTRA);
  }

  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "script-src": ["'self'"],
        "connect-src": cspConnectSrc,
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // HSTS solo en producción
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet.hsts({ 
      maxAge: 15552000, // 180 días
      includeSubDomains: true,
      preload: true
    }));
  }

  // Compresión gzip
  app.use(compression());

  // Sanitización de MongoDB
  app.use(mongoSanitize());

  // Protección XSS
  app.use(xss());

  // Prevenir HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['category', 'price', 'search'] // Parámetros permitidos
  }));

  // Rate limiting global (aplicar primero)
  app.use(globalLimiter);
  
  // Rate limiting específico para login
  app.use('/api/auth/login', authLoginLimiter);
  
  // Rate limiting para pedidos
  app.use('/api/orders', orderLimiter);

  // Headers adicionales de seguridad
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
};

// Middleware de validación mejorado
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Middleware de logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

// Middleware de manejo de errores mejorado
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Errores de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Errores de duplicación
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} ya existe`
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
};

module.exports = {
  securityMiddleware,
  corsOptions,
  validateRequest,
  requestLogger,
  errorHandler,
  globalLimiter,
  authLoginLimiter,
  orderLimiter
};
