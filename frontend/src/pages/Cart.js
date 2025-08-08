import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { utilService } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-8">
            Parece que aún no has agregado productos a tu carrito.
          </p>
          <button
            onClick={handleContinueShopping}
            className="btn-primary"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🛒 Tu Carrito
            </h1>
            <p className="text-gray-600">
              {itemCount} producto{itemCount !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
          
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
          >
            <Trash2 size={16} />
            <span>Vaciar carrito</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos ({items.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Imagen';
                        }}
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link
                              to={`/product/${item._id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.category}
                          </p>
                          <div className="text-lg font-bold text-primary">
                            {utilService.formatPrice(item.price)}
                          </div>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="px-4 py-2 text-lg font-medium">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar del carrito"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-3 text-right">
                        <span className="text-sm text-gray-500">
                          Subtotal: {utilService.formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del pedido
            </h2>

            {/* Detalles */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos ({itemCount}):</span>
                <span className="font-medium">
                  {utilService.formatPrice(total)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {utilService.formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-3 text-lg"
                disabled={items.length === 0}
              >
                Proceder al checkout
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="w-full btn-secondary py-3"
              >
                Continuar comprando
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ShoppingBag size={16} />
                <span>Envío gratuito en pedidos superiores a $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
