import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, Search, Moon, Sun, DollarSign, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import FlyingCartItem from '@/components/FlyingCartItem';
import SearchDialog from '@/components/SearchDialog';
import tboStoreLogo from '@/assets/tbo-store-logo.png';
import sarSymbol from '@/assets/sar-symbol.png';
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const {
    getTotalItems,
    cartIconRef,
    flyingItem
  } = useCart();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    currency,
    setCurrency
  } = useCurrency();
  const {
    user,
    isAdmin
  } = useAuth();
  const location = useLocation();
  const navLinks = [{
    key: 'home',
    to: '/'
  }, {
    key: 'products',
    to: '/products'
  }, {
    key: 'about',
    to: '/about'
  }, {
    key: 'reviews',
    to: '/reviews'
  }, {
    key: 'contact',
    to: '/contact'
  }];
  const isActive = (path: string) => location.pathname === path;
  const itemCount = getTotalItems();

  // Get cart icon position for flying animation
  const getCartPosition = () => {
    if (cartIconRef.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - 40,
        y: rect.top + rect.height / 2 - 40
      };
    }
    return {
      x: window.innerWidth - 100,
      y: 50
    };
  };
  return <>
      {/* Flying Cart Animation */}
      <AnimatePresence>
        {flyingItem && <FlyingCartItem image={flyingItem.image} startPosition={{
        x: flyingItem.x - 40,
        y: flyingItem.y - 40
      }} endPosition={getCartPosition()} />}
      </AnimatePresence>

      {/* Search Dialog */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                {/* Neon glow background for light mode */}
                <div className="absolute inset-0 bg-primary/30 dark:bg-transparent rounded-full blur-xl scale-150 opacity-80" />
                <motion.img src={tboStoreLogo} alt="TBO Store" className="relative h-10 md:h-12 w-auto drop-shadow-[0_0_8px_hsl(var(--primary))]" whileHover={{
                scale: 1.1,
                filter: 'drop-shadow(0 0 12px hsl(var(--primary)))'
              }} whileTap={{
                scale: 0.95
              }} transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
              }} />
              </div>
              <span className="font-display text-xl md:text-2xl font-bold text-foreground">
                TBO <span className="text-primary glow-text-cyan">STORE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => <Link key={link.key} to={link.to} className={`relative text-sm font-medium transition-colors duration-300 font-arabic ${isActive(link.to) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  {t(link.key)}
                  {isActive(link.to) && <motion.div layoutId="navbar-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" transition={{
                type: 'spring',
                stiffness: 350,
                damping: 30
              }} />}
                </Link>)}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language & Currency Toggle - Combined */}
              <motion.div 
                className="hidden sm:flex items-center bg-card/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                {/* Language Toggle */}
                <div className="flex items-center">
                  <motion.button
                    onClick={() => setLanguage('en')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      language === 'en'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-1">🇺🇸</span>
                    EN
                    {language === 'en' && (
                      <motion.div
                        layoutId="lang-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setLanguage('ar')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      language === 'ar'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-1">🇸🇦</span>
                    عربي
                    {language === 'ar' && (
                      <motion.div
                        layoutId="lang-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Separator */}
                <div className="w-px h-5 bg-border mx-1" />

                {/* Currency Toggle */}
                <motion.button
                  onClick={() => setCurrency(currency === 'SAR' ? 'USD' : 'SAR')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <motion.div
                    key={currency}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1"
                  >
                    {currency === 'SAR' ? (
                      <>
                        <img 
                          src={sarSymbol} 
                          alt="SAR" 
                          className="w-3.5 h-3.5" 
                          style={{ filter: theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)' }} 
                        />
                        <span>ر.س</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>USD</span>
                      </>
                    )}
                  </motion.div>
                </motion.button>
              </motion.div>

              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Search Button */}
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Admin Link */}
              {isAdmin && <Link to="/admin">
                  <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <Button variant="ghost" size="icon" className="text-primary">
                      <AlertTriangle className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </Link>}

              {/* User Profile/Auth */}
              <Link to={user ? "/profile" : "/auth"}>
                <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <Button variant="ghost" size="icon">
                    <User className={`w-5 h-5 ${user ? 'text-primary' : ''}`} />
                  </Button>
                </motion.div>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <motion.div ref={cartIconRef} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <Button variant="neon" size="icon" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    <AnimatePresence>
                      {itemCount > 0 && <motion.span key="cart-count" initial={{
                      scale: 0
                    }} animate={{
                      scale: 1
                    }} exit={{
                      scale: 0
                    }} className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                          {itemCount > 99 ? '99+' : itemCount}
                        </motion.span>}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </Link>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <AnimatePresence mode="wait">
                  {isMenuOpen ? <motion.div key="close" initial={{
                  rotate: -90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: 90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                      <X className="w-6 h-6" />
                    </motion.div> : <motion.div key="menu" initial={{
                  rotate: 90,
                  opacity: 0
                }} animate={{
                  rotate: 0,
                  opacity: 1
                }} exit={{
                  rotate: -90,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                      <Menu className="w-6 h-6" />
                    </motion.div>}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.3
          }} className="md:hidden py-4 border-t border-border overflow-hidden">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link, index) => <motion.div key={link.key} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.05
              }}>
                      <Link to={link.to} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-all duration-300 ${isActive(link.to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                        {t(link.key)}
                      </Link>
                    </motion.div>)}
                  
                  {/* Mobile Theme & Currency Toggle */}
                  <motion.div initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: navLinks.length * 0.05
              }} className="flex items-center gap-4 px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex items-center gap-2">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrency(currency === 'SAR' ? 'USD' : 'SAR')} className="flex items-center gap-2">
                      {currency === 'SAR' ? <img src={sarSymbol} alt="SAR" className="w-4 h-4" style={{
                    filter: theme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)'
                  }} /> : <DollarSign className="w-4 h-4" />}
                      {currency}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </nav>
    </>;
};
export default Navbar;