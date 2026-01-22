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
import { VisualEditorProvider } from "@/contexts/VisualEditorContext";
import { SeasonalThemeProvider } from "@/contexts/SeasonalThemeContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import StreamerPackageDetail from "./pages/StreamerPackageDetail";
import About from "./pages/About";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Policies from "./pages/Policies";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import CustomizeExperience from "./pages/CustomizeExperience";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import MyOrders from "./pages/MyOrders";
import LoyaltyPoints from "./pages/LoyaltyPoints";
import PageTransition from "./components/PageTransition";
import AISupportButton from "./components/AISupportButton";
import VisualEditorOverlay from "./components/admin/VisualEditorOverlay";
import Snowflakes from "./components/Snowflakes";
import GlobalCursor from "./components/GlobalCursor";
import ScreenshotProtection from "./components/ScreenshotProtection";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/streamer-package/:id" element={<PageTransition><StreamerPackageDetail /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/policies" element={<PageTransition><Policies /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/customize" element={<PageTransition><CustomizeExperience /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
        <Route path="/my-orders" element={<PageTransition><MyOrders /></PageTransition>} />
        <Route path="/loyalty-points" element={<PageTransition><LoyaltyPoints /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SeasonalThemeProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LanguageProvider>
                <CartProvider>
                  <VisualEditorProvider>
                    <Snowflakes />
                    <GlobalCursor />
                    <ScreenshotProtection />
                    <AnimatedRoutes />
                    <VisualEditorOverlay />
                    <AISupportButton />
                  </VisualEditorProvider>
                </CartProvider>
              </LanguageProvider>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </SeasonalThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
