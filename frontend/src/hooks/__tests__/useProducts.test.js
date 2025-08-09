import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProduct, useCategories } from '../useProducts';
import * as productsService from '../../services/products';

// Mock del servicio de productos
jest.mock('../../services/products');

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch products successfully', async () => {
    const mockProductsData = {
      products: [
        { id: '1', name: 'Product 1', price: 10 },
        { id: '2', name: 'Product 2', price: 20 }
      ],
      pagination: { page: 1, total: 2, pages: 1 }
    };

    productsService.fetchProducts.mockResolvedValue(mockProductsData);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProductsData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle error when fetching products', async () => {
    const mockError = new Error('Failed to fetch products');
    productsService.fetchProducts.mockRejectedValue(mockError);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  test('should pass filters to fetchProducts', async () => {
    const filters = { category: 'electronics', search: 'phone' };
    const mockData = { products: [], pagination: {} };
    
    productsService.fetchProducts.mockResolvedValue(mockData);

    renderHook(() => useProducts(filters), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(productsService.fetchProducts).toHaveBeenCalledWith(filters);
    });
  });
});

describe('useProduct', () => {
  test('should fetch single product successfully', async () => {
    const mockProduct = { id: '1', name: 'Product 1', price: 10 };
    productsService.fetchProductById.mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useProduct('1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProduct);
    expect(productsService.fetchProductById).toHaveBeenCalledWith('1');
  });

  test('should not fetch when id is not provided', () => {
    renderHook(() => useProduct(null), {
      wrapper: createWrapper()
    });

    expect(productsService.fetchProductById).not.toHaveBeenCalled();
  });

  test('should handle error when fetching product', async () => {
    const mockError = new Error('Product not found');
    productsService.fetchProductById.mockRejectedValue(mockError);

    const { result } = renderHook(() => useProduct('1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useCategories', () => {
  test('should fetch categories successfully', async () => {
    const mockCategories = ['Electronics', 'Clothing', 'Books'];
    productsService.fetchCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
    expect(productsService.fetchCategories).toHaveBeenCalledTimes(1);
  });

  test('should handle error when fetching categories', async () => {
    const mockError = new Error('Failed to fetch categories');
    productsService.fetchCategories.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
