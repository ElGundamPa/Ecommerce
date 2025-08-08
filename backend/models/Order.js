const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'El nombre del cliente es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  customerEmail: {
    type: String,
    required: [true, 'El email del cliente es requerido'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  customerAddress: {
    type: String,
    required: [true, 'La dirección del cliente es requerida'],
    trim: true,
    maxlength: [200, 'La dirección no puede tener más de 200 caracteres']
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: [0, 'El total no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'],
    default: 'Pendiente'
  },
  orderNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Middleware para generar número de pedido antes de guardar
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

// Método para calcular el total
orderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Método para formatear el total
orderSchema.methods.getFormattedTotal = function() {
  return `$${this.total.toFixed(2)}`;
};

// Índices para mejorar el rendimiento
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
