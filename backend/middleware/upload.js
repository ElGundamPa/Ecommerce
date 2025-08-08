const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configuración de almacenamiento
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: fileFilter
});

// Middleware para optimizar imágenes
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const { buffer, originalname } = req.file;
    
    // Generar nombre único
    const timestamp = Date.now();
    const filename = `${timestamp}-${originalname.replace(/\s+/g, '-')}`;
    
    // Optimizar imagen
    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80,
        progressive: true 
      })
      .toBuffer();

    // Crear diferentes tamaños
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 }
    };

    const optimizedImages = {};

    for (const [size, dimensions] of Object.entries(sizes)) {
      const resizedBuffer = await sharp(buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      optimizedImages[size] = resizedBuffer;
    }

    // Guardar en el sistema de archivos (en producción usar CDN)
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, optimizedBuffer);

    // Actualizar req.file con información optimizada
    req.file = {
      ...req.file,
      filename,
      path: filePath,
      size: optimizedBuffer.length,
      optimizedImages
    };

    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    next(error);
  }
};

// Middleware para eliminar archivos
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error eliminando archivo:', error);
  }
};

// Middleware para servir archivos estáticos
const serveImage = (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
  });
};

// Función para generar URL de imagen
const generateImageUrl = (filename, size = 'large') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  upload,
  optimizeImage,
  deleteFile,
  serveImage,
  generateImageUrl
};
