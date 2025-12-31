import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Policies from "./pages/Policies";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/policies" element={<PageTransition><Policies /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LanguageProvider>
              <CartProvider>
                <AnimatedRoutes />
              </CartProvider>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
