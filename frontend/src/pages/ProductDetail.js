import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { productService, utilService } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(id);
        setProduct(response.data);
        setQuantity(getItemQuantity(response.data._id) || 1);
      } catch (err) {
        setError('Producto no encontrado o error al cargar.');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, getItemQuantity]);

  // Manejar cambio de cantidad
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    if (product && quantity > 0) {
      // Si ya está en el carrito, actualizar cantidad
      const currentQuantity = getItemQuantity(product._id);
      if (currentQuantity > 0) {
        updateQuantity(product._id, currentQuantity + quantity);
      } else {
        // Si no está en el carrito, agregar con la cantidad seleccionada
        const productWithQuantity = { ...product, quantity };
        addToCart(productWithQuantity);
      }
      
      // Mostrar feedback visual
      const button = document.getElementById('add-to-cart-btn');
      if (button) {
        button.classList.add('animate-bounce');
        setTimeout(() => button.classList.remove('animate-bounce'), 1000);
      }
    }
  };

  // Ir al carrito
  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Producto no encontrado'}</p>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const currentQuantity = getItemQuantity(product._id);
  const isInCart = currentQuantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver a productos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imágenes */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=Imagen+No+Disponible';
              }}
            />
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Categoría */}
          <div>
            <span className="badge badge-primary">
              {product.category}
            </span>
          </div>

          {/* Nombre */}
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="text-3xl font-bold text-primary">
            {utilService.formatPrice(product.price)}
          </div>

          {/* Stock */}
          <div className="flex items-center space-x-2">
            <Package size={20} className="text-gray-500" />
            <span className="text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stock} unidades disponibles
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Sin stock
                </span>
              )}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Cantidad y botones */}
          {product.stock > 0 && (
            <div className="space-y-4">
              {/* Selector de cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>
                    {isInCart ? `Agregar ${quantity} más` : 'Agregar al carrito'}
                  </span>
                </button>
                
                {isInCart && (
                  <button
                    onClick={handleGoToCart}
                    className="btn-accent flex-1 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>Ver carrito ({currentQuantity})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Categoría:</span>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <span className="text-gray-500">Stock:</span>
                <p className="font-medium">{product.stock} unidades</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
