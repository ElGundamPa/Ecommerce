import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información del proyecto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">🛒 Ecommerce MVP</h3>
            <p className="text-gray-300 text-sm">
              Un ecommerce completo desarrollado con React, Node.js y MongoDB.
              Proyecto MVP con funcionalidades básicas de tienda online.
            </p>
          </div>

          {/* Tecnologías */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tecnologías</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Frontend: React + Context API</li>
              <li>• Backend: Node.js + Express</li>
              <li>• Base de datos: MongoDB</li>
              <li>• Estilos: TailwindCSS</li>
              <li>• Rutas: React Router DOM</li>
            </ul>
          </div>

          {/* Funcionalidades */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Funcionalidades</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Listado de productos</li>
              <li>• Carrito de compras</li>
              <li>• Checkout completo</li>
              <li>• Persistencia en localStorage</li>
              <li>• API RESTful</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Ecommerce MVP. Desarrollado con ❤️ para demostrar capacidades de desarrollo full-stack.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
