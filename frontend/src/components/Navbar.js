import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🛒</div>
            <span className="text-xl font-bold text-gray-900">Ecommerce MVP</span>
          </Link>

          {/* Navegación */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Home size={18} />
              <span>Inicio</span>
            </Link>
            
            <Link
              to="/cart"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isActive('/cart')
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Navegación móvil */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navegación móvil expandida */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'text-primary bg-blue-50'
                : 'text-gray-700 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <Home size={18} />
            <span>Inicio</span>
          </Link>
          
          <Link
            to="/cart"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/cart')
                ? 'text-primary bg-blue-50'
                : 'text-gray-700 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={18} />
            <span>Carrito ({itemCount})</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
