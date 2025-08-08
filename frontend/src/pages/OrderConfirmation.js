import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, Calendar, Home, ShoppingBag } from 'lucide-react';
import { utilService } from '../services/api';

const OrderConfirmation = () => {
  const location = useLocation();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);

  useEffect(() => {
    // Si no hay datos del pedido, redirigir al inicio
    if (!orderData) {
      // En un caso real, podrías buscar el pedido por URL params
      console.log('No hay datos del pedido');
    }
  }, [orderData]);

  if (!orderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Pedido no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            No se encontraron datos del pedido. Por favor, verifica la URL.
          </p>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header de confirmación */}
      <div className="text-center mb-8">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Pedido confirmado!
        </h1>
        <p className="text-gray-600">
          Gracias por tu compra. Hemos recibido tu pedido y te enviaremos una confirmación por email.
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        {/* Número de pedido */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Número de pedido
          </h2>
          <div className="text-2xl font-bold text-primary bg-blue-50 px-6 py-3 rounded-lg inline-block">
            {orderData.orderNumber}
          </div>
        </div>

        {/* Información del pedido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del pedido
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-600">
                  Fecha: {new Date(orderData.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Package size={16} className="text-gray-500" />
                <span className="text-gray-600">
                  Estado: <span className="text-green-600 font-medium">{orderData.status}</span>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-500" />
                <span className="text-gray-600">
                  Email: {orderData.customerEmail}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de envío
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Nombre:</strong> {orderData.customerName}
              </p>
              <p className="text-gray-600">
                <strong>Dirección:</strong> {orderData.customerAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de productos */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productos ordenados
          </h3>
          <div className="space-y-3">
            {orderData.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48x48?text=Imagen';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity} × {utilService.formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {utilService.formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total del pedido:</span>
            <span className="text-2xl font-bold text-primary">
              {utilService.formatPrice(orderData.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ¿Qué sigue?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Mail size={20} className="text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Confirmación por email</h4>
            <p className="text-sm text-gray-600">
              Recibirás un email con los detalles de tu pedido
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Package size={20} className="text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Preparación</h4>
            <p className="text-sm text-gray-600">
              Tu pedido será preparado y enviado en 1-2 días hábiles
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Entrega</h4>
            <p className="text-sm text-gray-600">
              Entrega estimada en 3-5 días hábiles
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Home size={20} />
          <span>Continuar comprando</span>
        </Link>
        
        <Link
          to="/cart"
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <ShoppingBag size={20} />
          <span>Ver carrito</span>
        </Link>
      </div>

      {/* Información de contacto */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          ¿Tienes alguna pregunta? Contáctanos en{' '}
          <a href="mailto:soporte@ecommerce.com" className="text-primary hover:underline">
            soporte@ecommerce.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
