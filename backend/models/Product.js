const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción del producto es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio del producto es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  image: {
    type: String,
    required: [true, 'La imagen del producto es requerida'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'El stock del producto es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'La categoría del producto es requerida'],
    trim: true,
    enum: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Otros']
  }
}, {
  timestamps: true
});

// Método para formatear el precio
productSchema.methods.getFormattedPrice = function() {
  return `$${this.price.toFixed(2)}`;
};

// Índices para mejorar el rendimiento
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
