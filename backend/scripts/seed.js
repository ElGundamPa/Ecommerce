const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

// Datos de productos de ejemplo
const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y diseño en titanio.',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    stock: 25,
    category: 'Electrónicos'
  },
  {
    name: 'MacBook Air M2',
    description: 'Laptop ultraligera con chip M2, pantalla Liquid Retina de 13.6" y hasta 18 horas de batería.',
    price: 1199.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    stock: 15,
    category: 'Electrónicos'
  },
  {
    name: 'Nike Air Max 270',
    description: 'Zapatillas deportivas con tecnología Air Max para máxima comodidad y estilo.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    stock: 50,
    category: 'Deportes'
  },
  {
    name: 'Samsung 4K Smart TV',
    description: 'Televisor inteligente de 55" con resolución 4K, HDR y sistema operativo Tizen.',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    stock: 12,
    category: 'Electrónicos'
  },
  {
    name: 'Camiseta Básica Algodón',
    description: 'Camiseta 100% algodón orgánico, cómoda y transpirable para uso diario.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    stock: 100,
    category: 'Ropa'
  },
  {
    name: 'Cafetera Automática',
    description: 'Cafetera programable con molinillo integrado y múltiples opciones de preparación.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    stock: 30,
    category: 'Hogar'
  },
  {
    name: 'Libro "El Principito"',
    description: 'Clásico de la literatura universal de Antoine de Saint-Exupéry, edición especial.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    stock: 75,
    category: 'Libros'
  },
  {
    name: 'Auriculares Bluetooth Sony',
    description: 'Auriculares inalámbricos con cancelación de ruido y hasta 30 horas de batería.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    stock: 40,
    category: 'Electrónicos'
  },
  {
    name: 'Sofá Moderno 3 Plazas',
    description: 'Sofá elegante con diseño minimalista, perfecto para salas modernas.',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    stock: 8,
    category: 'Hogar'
  },
  {
    name: 'Balón de Fútbol Profesional',
    description: 'Balón oficial de competición con tecnología de última generación.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop',
    stock: 35,
    category: 'Deportes'
  },
  {
    name: 'Jeans Slim Fit',
    description: 'Jeans de alta calidad con corte slim fit, perfectos para cualquier ocasión.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    stock: 60,
    category: 'Ropa'
  },
  {
    name: 'Lámpara de Mesa LED',
    description: 'Lámpara moderna con luz LED ajustable y diseño elegante para escritorio.',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    stock: 25,
    category: 'Hogar'
  }
];

// Función para conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para poblar la base de datos
async function seedDatabase() {
  try {
    // Limpiar productos existentes
    await Product.deleteMany({});
    console.log('🗑️ Productos existentes eliminados');

    // Insertar productos de ejemplo
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ ${products.length} productos insertados exitosamente`);

    // Mostrar resumen
    console.log('\n📊 Resumen de productos por categoría:');
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} productos`);
    });

    console.log('\n🎉 Base de datos poblada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
async function main() {
  await connectDB();
  await seedDatabase();
}

main();
