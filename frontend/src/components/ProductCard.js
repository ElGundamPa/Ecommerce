import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Eye, 
  Heart,
  Star,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { utilService } from '../services/api';
import { Card, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import { cn } from '../utils/cn';

const ProductCard = ({ product, delay = 0 }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product._id);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAddingToCart(true);
    addToCart(product);
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  return (
    <Card 
      className="group overflow-hidden"
      hover={true}
      delay={delay}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Loading Skeleton */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Product Image */}
        <motion.img
          src={product.image}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            isImageLoading ? "opacity-0" : "opacity-100 group-hover:scale-110"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Overlay Actions */}
        <motion.div 
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="rounded-full p-2"
              >
                <Link to={`/product/${product._id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                loading={isAddingToCart}
                className="rounded-full p-2"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 rounded-full p-1 bg-background/80 backdrop-blur-sm"
        >
          <Heart className={cn(
            "h-4 w-4 transition-colors",
            isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
          )} />
        </Button>

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-destructive text-xs">
              Solo {product.stock}
            </span>
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-secondary text-xs">
              Sin stock
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="badge badge-outline text-xs">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarSolid 
                key={i} 
                className={cn(
                  "h-4 w-4",
                  i < 4 ? "text-yellow-400" : "text-muted"
                )} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-1">(4.0)</span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {utilService.formatPrice(product.price)}
          </div>
          
          <div className="flex items-center space-x-2">
            {quantity > 0 && (
              <span className="text-sm text-muted-foreground">
                {quantity} en carrito
              </span>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              loading={isAddingToCart}
            >
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
