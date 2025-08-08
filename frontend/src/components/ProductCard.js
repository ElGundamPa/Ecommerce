import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { utilService } from '../services/api';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="card group animate-fade-in">
      {/* Imagen del producto */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
          }}
        />
        
        {/* Overlay con botones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <Link
              to={`/product/${product._id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Ver detalles"
            >
              <Eye size={18} />
            </Link>
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Agregar al carrito"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>

        {/* Badge de stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-warning">
              Solo {product.stock} disponibles
            </span>
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-red-100 text-red-800">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Categoría */}
        <div className="mb-2">
          <span className="badge badge-primary text-xs">
            {product.category}
          </span>
        </div>

        {/* Nombre del producto */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {utilService.formatPrice(product.price)}
          </div>
          
          <div className="flex items-center space-x-2">
            {quantity > 0 && (
              <span className="text-sm text-gray-500">
                {quantity} en carrito
              </span>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`btn-primary text-sm px-3 py-1.5 ${
                product.stock === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              } transition-all duration-200`}
            >
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
