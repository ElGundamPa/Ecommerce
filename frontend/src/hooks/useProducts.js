import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductById, fetchCategories, productKeys } from '../services/products';

// Hook para obtener lista de productos con paginación
export const useProducts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    ...options,
  });
};

// Hook para obtener productos con scroll infinito
export const useInfiniteProducts = (baseFilters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: productKeys.list(baseFilters),
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...baseFilters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.pages ? pagination.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { pagination } = firstPage;
      return pagination.page > 1 ? pagination.page - 1 : undefined;
    },
    ...options,
  });
};

// Hook para obtener un producto específico
export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    ...options,
  });
};

// Hook para obtener categorías
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutos (las categorías cambian poco)
    ...options,
  });
};
