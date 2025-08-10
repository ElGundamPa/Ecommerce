import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Home, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Search,
  User
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import Button from './ui/Button';
import { cn } from '../utils/cn';

const Navbar = () => {
  const { itemCount } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const { largeFonts, highContrast, reducedMotion, toggleLargeFonts, toggleHighContrast, toggleReducedMotion } = useAccessibility();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        isScrolled && 'shadow-sm'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              className="text-2xl"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              🛒
            </motion.div>
            <span className="text-xl font-bold">Ecommerce MVP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive('/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            
            <Link
              to="/cart"
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                isActive('/cart')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Carrito</span>
              {itemCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* A11y toggles */}
            <div className="flex items-center space-x-1" aria-label="Accesibilidad">
              <Button variant="ghost" size="sm" aria-pressed={largeFonts} onClick={toggleLargeFonts} title="Fuente grande (A11y)">A+</Button>
              <Button variant="ghost" size="sm" aria-pressed={highContrast} onClick={toggleHighContrast} title="Alto contraste (A11y)">◑</Button>
              <Button variant="ghost" size="sm" aria-pressed={reducedMotion} onClick={toggleReducedMotion} title="Reducir animaciones (A11y)">⚡︎</Button>
            </div>
            
            <Button variant="ghost" size="sm" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" aria-label="User profile">
              <User className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* A11y compact toggles */}
            <Button variant="ghost" size="sm" aria-pressed={largeFonts} onClick={toggleLargeFonts} title="Fuente grande (A11y)">A+</Button>
            
            <Link
              to="/cart"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </Link>

            {/* A11y compact toggles cont. */}
            <Button variant="ghost" size="sm" aria-pressed={highContrast} onClick={toggleHighContrast} title="Alto contraste (A11y)">◑</Button>
            <Button variant="ghost" size="sm" aria-pressed={reducedMotion} onClick={toggleReducedMotion} title="Reducir animaciones (A11y)">⚡︎</Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t bg-background"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                  isActive('/')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Inicio</span>
              </Link>
              
              <Link
                to="/cart"
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                  isActive('/cart')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito ({itemCount})</span>
              </Link>
              
              <div className="flex items-center space-x-2 px-3 py-2">
                <Button variant="ghost" size="sm" aria-label="Search">
                  <Search className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" aria-label="User profile">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
