# 🛒 Ecommerce MVP - Versión 2.0

Un ecommerce completo y moderno desarrollado con React, Node.js y MongoDB, con funcionalidades avanzadas de seguridad, rendimiento y UX.

## 🚀 Características Principales

### 🔒 **Seguridad Avanzada**
- **Autenticación JWT** con tokens seguros
- **Autenticación Social** (Google, Facebook, Twitter)
- **Rate Limiting** para prevenir ataques
- **Validación robusta** en frontend y backend
- **CORS configurado** con restricciones específicas
- **Helmet** para headers de seguridad
- **Sanitización** de datos y protección XSS

### 📈 **Rendimiento Optimizado**
- **Paginación inteligente** en productos
- **Caché en memoria** para respuestas rápidas
- **Optimización de imágenes** automática
- **Compresión gzip** para transferencias
- **Lazy loading** y code splitting
- **CDN ready** para producción

### 🧪 **Testing Completo**
- **Tests unitarios** con Jest
- **Tests de integración** para API
- **Cobertura de código** automática
- **Base de datos en memoria** para tests
- **CI/CD ready** con GitHub Actions

### 📱 **PWA (Progressive Web App)**
- **Funcionalidad offline** completa
- **Service Worker** para cache inteligente
- **Notificaciones push** nativas
- **Instalación en dispositivo** como app
- **Sincronización en segundo plano**
- **Página offline** elegante

### 🎨 **UX/UI Mejorada**
- **Diseño responsive** y accesible
- **Animaciones suaves** y feedback visual
- **Modo oscuro** (preparado)
- **Accesibilidad** con ARIA labels
- **Loading states** y error handling
- **Progressive enhancement**

## 📁 Estructura del Proyecto

```
Ecommerce/
├── frontend/                 # Aplicación React PWA
│   ├── public/
│   │   ├── service-worker.js # Service Worker
│   │   ├── offline.html      # Página offline
│   │   └── manifest.json     # PWA manifest
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/           # Páginas principales
│       ├── contexts/        # Context API
│       ├── services/        # Servicios API
│       └── hooks/           # Custom hooks
├── backend/                  # API Node.js
│   ├── config/              # Configuración Passport
│   ├── middleware/          # Middleware personalizado
│   ├── models/              # Modelos MongoDB
│   ├── routes/              # Rutas API
│   ├── tests/               # Tests unitarios
│   └── uploads/             # Imágenes optimizadas
├── setup.js                 # Instalación automática
└── README.md
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Node.js** (v16 o superior)
- **MongoDB** (local o MongoDB Atlas)
- **npm** o **yarn**
- **Cuentas de desarrollador** para OAuth (opcional)

### 🚀 Instalación Rápida

```bash
# Clonar o descargar el proyecto
git clone <repository-url>
cd Ecommerce

# Ejecutar configuración automática
node setup.js
```

### 📋 Instalación Manual

#### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Configuración de Base de Datos
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Configuración del Servidor
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (para redirecciones OAuth)
FRONTEND_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (opcional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Twitter OAuth (opcional)
TWITTER_CONSUMER_KEY=your-twitter-consumer-key
TWITTER_CONSUMER_SECRET=your-twitter-consumer-secret
```

#### 2. Instalar Dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

#### 3. Configurar Base de Datos

```bash
# Ejecutar script de seed para crear productos de ejemplo
cd backend
npm run seed
```

#### 4. Ejecutar el Proyecto

```bash
# Terminal 1: Ejecutar backend
cd backend
npm run dev

# Terminal 2: Ejecutar frontend
cd frontend
npm start
```

El frontend estará disponible en: **http://localhost:3000**
El backend estará disponible en: **http://localhost:5000**

## 📋 Funcionalidades Completas

### 🔐 **Autenticación y Autorización**
- ✅ Registro con email y contraseña
- ✅ Login con JWT
- ✅ Autenticación social (Google, Facebook, Twitter)
- ✅ Verificación de email
- ✅ Reset de contraseña
- ✅ Gestión de perfiles
- ✅ Roles y permisos

### 🛍️ **Ecommerce Core**
- ✅ Listado de productos con paginación
- ✅ Filtros avanzados (categoría, precio, búsqueda)
- ✅ Detalle de producto
- ✅ Carrito de compras persistente
- ✅ Checkout seguro
- ✅ Confirmación de compra
- ✅ Historial de pedidos

### 🚀 **Funcionalidades Avanzadas**
- ✅ PWA con funcionalidad offline
- ✅ Notificaciones push
- ✅ Optimización de imágenes
- ✅ Caché inteligente
- ✅ Rate limiting
- ✅ Validación robusta
- ✅ Manejo de errores mejorado

## 🎨 Tecnologías Utilizadas

### **Frontend**
- **React 18** con Hooks y Context API
- **React Router DOM** para navegación
- **TailwindCSS** para estilos
- **Axios** para requests HTTP
- **Lucide React** para iconos
- **Service Worker** para PWA

### **Backend**
- **Node.js** con Express
- **MongoDB** con Mongoose ODM
- **Passport.js** para autenticación
- **JWT** para tokens
- **bcryptjs** para encriptación
- **Multer** para upload de archivos
- **Sharp** para optimización de imágenes
- **Jest** para testing

### **Seguridad**
- **Helmet** para headers de seguridad
- **express-rate-limit** para rate limiting
- **express-validator** para validación
- **express-mongo-sanitize** para sanitización
- **xss-clean** para protección XSS

## 📝 Endpoints API

### **Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener perfil actual
- `PUT /api/auth/profile` - Actualizar perfil
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Resetear contraseña
- `GET /api/auth/google` - Login con Google
- `GET /api/auth/facebook` - Login con Facebook
- `GET /api/auth/twitter` - Login con Twitter

### **Productos**
- `GET /api/products` - Listar productos (con paginación)
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (admin)
- `GET /api/products/categories/list` - Listar categorías

### **Pedidos**
- `POST /api/orders` - Crear pedido
- `GET /api/orders/:orderNumber` - Obtener pedido
- `GET /api/orders` - Listar pedidos por email

### **Utilidades**
- `GET /api/health` - Health check
- `GET /uploads/:filename` - Servir imágenes optimizadas

## 🚀 Scripts Disponibles

### **Backend**
- `npm run dev` - Ejecutar en modo desarrollo con nodemon
- `npm start` - Ejecutar en modo producción
- `npm run seed` - Poblar base de datos con productos de ejemplo
- `npm test` - Ejecutar tests
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run test:coverage` - Ejecutar tests con cobertura

### **Frontend**
- `npm start` - Ejecutar aplicación React
- `npm build` - Construir para producción
- `npm test` - Ejecutar tests
- `npm run eject` - Eject de Create React App

## 🔧 Configuración de OAuth (Opcional)

### **Google OAuth**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:5000/api/auth/google/callback` como URI de redirección

### **Facebook OAuth**
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app
3. Configura Facebook Login
4. Agrega `http://localhost:5000/api/auth/facebook/callback` como URI de redirección

### **Twitter OAuth**
1. Ve a [Twitter Developer Portal](https://developer.twitter.com/)
2. Crea una nueva app
3. Configura OAuth 1.0a
4. Agrega `http://localhost:5000/api/auth/twitter/callback` como URI de redirección

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 📱 PWA Features

- **Instalación**: La app se puede instalar como aplicación nativa
- **Offline**: Funciona sin conexión a internet
- **Notificaciones**: Notificaciones push nativas
- **Cache**: Cache inteligente para mejor rendimiento
- **Sincronización**: Sincronización automática cuando hay conexión

## 🔒 Seguridad

- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración restrictiva de CORS
- **Helmet**: Headers de seguridad automáticos
- **Validación**: Validación en frontend y backend
- **Sanitización**: Protección contra inyección de código
- **JWT**: Tokens seguros con expiración

## 🚀 Despliegue

### **Backend (Heroku)**
```bash
# Configurar variables de entorno en Heroku
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Desplegar
git push heroku main
```

### **Frontend (Netlify/Vercel)**
```bash
# Construir para producción
npm run build

# Desplegar build folder
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta tu ecommerce moderno y seguro! 🛒✨**
