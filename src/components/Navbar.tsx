import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { toggleCart, items } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.5 }}
      className="absolute top-0 w-full z-50 pt-10"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between">
        
        {/* Logo - Smaller, wider tracking, ultra minimal */}
        <Link to="/" className="font-serif text-sm md:text-base text-luxury-charcoal tracking-[0.4em] uppercase hover:opacity-50 transition-opacity duration-500">
          Matcha no Ki
        </Link>
        
        {/* Links & Actions - Extremely small, highly spaced */}
        <div className="flex items-center gap-8 md:gap-16 font-sans text-[9px] tracking-[0.4em] uppercase text-luxury-charcoal/70">
          <div className="hidden md:flex gap-16">
            <Link to="/menu" className="hover:text-luxury-charcoal transition-colors duration-500">Menu</Link>
            <Link to="/about" className="hover:text-luxury-charcoal transition-colors duration-500">Philosophy</Link>
          </div>
          
          <button 
            onClick={toggleCart} 
            className="flex items-center gap-2 hover:text-luxury-charcoal transition-colors duration-500 group relative"
          >
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-3 -right-4 bg-luxury-matcha text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium tracking-normal">
                {itemCount}
              </span>
            )}
          </button>
        </div>
        
      </div>
    </motion.nav>
  );
}
