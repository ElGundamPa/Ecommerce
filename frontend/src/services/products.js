import api from './api';

// Claves de query para React Query
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  categories: () => [...productKeys.all, 'categories'],
};

// Servicios de productos optimizados para React Query
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/products?${params.toString()}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener productos');
  }
  
  return {
    products: response.data.data,
    pagination: response.data.pagination,
  };
};

export const fetchProductById = async (id) => {
  if (!id) throw new Error('ID de producto requerido');
  
  const response = await api.get(`/products/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener producto');
  }
  
  return response.data.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/products/categories/list');
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener categorías');
  }
  
  return response.data.data;
};
