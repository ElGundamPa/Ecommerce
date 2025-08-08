#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Ecommerce MVP...\n');

// Función para ejecutar comandos
function runCommand(command, cwd = '.') {
  try {
    console.log(`📦 Ejecutando: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    return false;
  }
}

// Función para crear archivo .env
function createEnvFile() {
  const envContent = `MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=5000
NODE_ENV=development`;

  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado en backend/');
  } else {
    console.log('ℹ️ Archivo .env ya existe en backend/');
  }
}

// Función principal
async function setup() {
  console.log('📋 Pasos de configuración:');
  console.log('1. Instalar dependencias del backend');
  console.log('2. Instalar dependencias del frontend');
  console.log('3. Crear archivo .env');
  console.log('4. Poblar base de datos con productos de ejemplo\n');

  // 1. Instalar dependencias del backend
  console.log('🔧 Instalando dependencias del backend...');
  if (!runCommand('npm install', 'backend')) {
    console.error('❌ Error instalando dependencias del backend');
    process.exit(1);
  }

  // 2. Instalar dependencias del frontend
  console.log('\n🎨 Instalando dependencias del frontend...');
  if (!runCommand('npm install', 'frontend')) {
    console.error('❌ Error instalando dependencias del frontend');
    process.exit(1);
  }

  // 3. Crear archivo .env
  console.log('\n⚙️ Configurando variables de entorno...');
  createEnvFile();

  // 4. Poblar base de datos (opcional)
  console.log('\n🗄️ Para poblar la base de datos con productos de ejemplo, ejecuta:');
  console.log('cd backend && npm run seed');
  console.log('\n⚠️ Asegúrate de tener MongoDB ejecutándose localmente');

  console.log('\n🎉 ¡Configuración completada!');
  console.log('\n📝 Para ejecutar el proyecto:');
  console.log('1. Terminal 1: cd backend && npm run dev');
  console.log('2. Terminal 2: cd frontend && npm start');
  console.log('\n🌐 El frontend estará disponible en: http://localhost:3000');
  console.log('🔧 El backend estará disponible en: http://localhost:5000');
}

// Ejecutar configuración
setup().catch(console.error);
