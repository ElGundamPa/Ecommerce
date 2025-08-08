import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, Mail, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { orderService, utilService } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerAddress: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'El email es requerido';
    } else if (!utilService.validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'El email no es válido';
    }
    
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'La dirección es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Procesar pedido
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos del pedido
      const orderItems = items.map(item => ({
        product: item._id,
        quantity: item.quantity
      }));

      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        items: orderItems,
        total: total
      };

      // Crear pedido
      const response = await orderService.create(orderPayload);
      
      setOrderData(response.data);
      setOrderSuccess(true);
      
      // Limpiar carrito después de 2 segundos
      setTimeout(() => {
        clearCart();
        navigate('/confirmation', { 
          state: { orderData: response.data } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({
        submit: 'Error al procesar el pedido. Por favor, intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Si no hay productos en el carrito, redirigir
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            ¡Pedido procesado exitosamente!
          </h2>
          <p className="text-gray-600 mb-4">
            Número de pedido: {orderData?.orderNumber}
          </p>
          <p className="text-gray-600">
            Redirigiendo a la confirmación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver al carrito
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💳 Checkout
        </h1>
        <p className="text-gray-600">
          Completa tu información para finalizar la compra
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Información de contacto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerName ? 'border-red-500' : ''}`}
                  placeholder="Tu nombre completo"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerEmail ? 'border-red-500' : ''}`}
                  placeholder="tu@email.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Dirección de envío
                </label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className={`input-field ${errors.customerAddress ? 'border-red-500' : ''}`}
                  placeholder="Calle, número, ciudad, código postal"
                />
                {errors.customerAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerAddress}</p>
                )}
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard size={20} />
                    <span>Finalizar compra</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resumen del pedido
            </h2>

            {/* Productos */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=Imagen';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {utilService.formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{utilService.formatPrice(total)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {utilService.formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Información importante:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Envío gratuito en todos los pedidos</li>
                <li>• Tiempo de entrega: 3-5 días hábiles</li>
                <li>• Recibirás confirmación por email</li>
                <li>• Política de devolución de 30 días</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
