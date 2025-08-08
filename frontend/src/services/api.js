import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de productos
export const productService = {
  // Obtener todos los productos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Obtener producto por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/products/categories/list');
    return response.data;
  }
};

// Servicios de pedidos
export const orderService = {
  // Crear nuevo pedido
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Obtener pedido por número
  getByOrderNumber: async (orderNumber) => {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  },

  // Obtener pedidos por email
  getByEmail: async (email) => {
    const response = await api.get(`/orders?email=${email}`);
    return response.data;
  }
};

// Servicios de utilidad
export const utilService = {
  // Formatear precio
  formatPrice: (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  },

  // Validar email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Generar ID único
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

export default api;
