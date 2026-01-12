import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useProducts } from '@/hooks/useProducts';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { products, loading } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.nameAr.includes(query) ||
      product.category.toLowerCase().includes(searchTerm)
    ).slice(0, 6);
  }, [query, products]);

  const handleProductClick = () => {
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Search Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث عن المنتجات...' : 'Search products...'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg"
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Loading State */}
              {loading && query.trim() && (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
              )}

              {/* Results */}
              {!loading && filteredProducts.length > 0 && (
                <div className="max-h-96 overflow-y-auto p-2">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        onClick={handleProductClick}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={language === 'ar' ? product.nameAr : product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {language === 'ar' ? product.nameAr : product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!loading && query.trim() && filteredProducts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                </div>
              )}

              {/* Empty State */}
              {!query.trim() && (
                <div className="p-8 text-center text-muted-foreground">
                  {language === 'ar' ? 'اكتب للبحث عن المنتجات' : 'Type to search products'}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchDialog;
