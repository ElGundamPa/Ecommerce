import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlass, 
  Squares2X2Icon, 
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useProducts, useCategories } from '../hooks/useProducts';
import { QueryErrorBoundary } from '../components/ErrorBoundary';

const Home = () => {
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  // Preparar filtros para React Query
  const filters = useMemo(() => {
    const queryFilters = {};
    if (searchTerm) queryFilters.search = searchTerm;
    if (selectedCategory) queryFilters.category = selectedCategory;
    if (minPrice) queryFilters.minPrice = parseFloat(minPrice);
    if (maxPrice) queryFilters.maxPrice = parseFloat(maxPrice);
    return queryFilters;
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  // React Query hooks
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useProducts(filters);

  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useCategories();

  const products = productsData?.products || [];
  const loading = productsLoading || categoriesLoading;

  // React Query maneja automáticamente la refetch cuando cambian los filtros
  // con debounce integrado en la configuración del queryClient

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando productos..." />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">
            {productsError?.message || 'Error cargando productos'}
          </p>
          <Button onClick={() => refetchProducts()}>
            Reintentar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <QueryErrorBoundary>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">
          🛒 Nuestros Productos
        </h1>
        <p className="text-muted-foreground text-lg">
          Descubre nuestra amplia selección de productos de calidad
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-card rounded-xl border p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div className="lg:w-32">
            <input
              type="number"
              placeholder="Precio min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Max Price */}
          <div className="lg:w-32">
            <input
              type="number"
              placeholder="Precio max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Clear Button */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="lg:w-auto"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </motion.div>

      {/* View Controls */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-muted-foreground">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Products List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner text="Aplicando filtros..." />
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div 
            key="empty"
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-muted-foreground text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
            <Button onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="products"
            className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {products.map((product, index) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </QueryErrorBoundary>
  );
};

export default Home;
