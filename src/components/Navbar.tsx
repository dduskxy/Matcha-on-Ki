import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import Magnetic from './Magnetic';

export default function Navbar() {
  const { toggleCart, items } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const menuVariants: any = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: { duration: 0.8, ease: "easeOut" }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const linkVariants: any = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3 + (i * 0.1), duration: 0.8, ease: "easeOut" }
    })
  };

  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.5 }}
        className="absolute top-0 w-full z-50 pt-10"
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <Magnetic strength={15}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-sm md:text-base text-luxury-charcoal tracking-[0.4em] uppercase hover:opacity-50 transition-opacity duration-500 block">
              Matcha no Ki
            </Link>
          </Magnetic>
          
          {/* Links & Actions */}
          <div className="flex items-center gap-6 md:gap-16 font-sans text-[9px] tracking-[0.4em] uppercase text-luxury-charcoal/70">
            {/* Desktop Links */}
            <div className="hidden md:flex gap-16">
              <Magnetic strength={30}>
                <Link to="/menu" className="hover:text-luxury-charcoal transition-colors duration-500 block p-2">Menu</Link>
              </Magnetic>
              <Magnetic strength={30}>
                <Link to="/about" className="hover:text-luxury-charcoal transition-colors duration-500 block p-2">Philosophy</Link>
              </Magnetic>
              <Magnetic strength={30}>
                <Link to="/whisk" className="hover:text-luxury-charcoal transition-colors duration-500 block p-2">Whisk</Link>
              </Magnetic>
            </div>
            
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Magnetic strength={30}>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hover:text-luxury-charcoal transition-colors duration-500 block p-2 relative z-[60]"
                >
                  {isMobileMenuOpen ? 'CLOSE' : 'MENU'}
                </button>
              </Magnetic>
            </div>
            
            <Magnetic strength={30}>
              <button 
                onClick={toggleCart} 
                aria-label="Toggle Cart"
                className="flex items-center gap-2 hover:text-luxury-charcoal transition-colors duration-500 group relative p-2"
              >
                <span>CART</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-luxury-matcha text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium tracking-normal">
                    {itemCount}
                  </span>
                )}
              </button>
            </Magnetic>
          </div>
          
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-[#F9F8F6] z-40 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ambient Background Decoration for the overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute top-1/4 -right-1/4 w-[50vh] h-[50vh] bg-luxury-matcha rounded-full blur-[120px]"
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                 transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute bottom-1/4 -left-1/4 w-[60vh] h-[60vh] bg-[#E3DAC9] rounded-full blur-[120px]"
               />
            </div>
            
            <div className="flex flex-col items-center gap-10 z-10">
              {['Menu', 'Philosophy', 'Whisk'].map((item, i) => {
                const path = item === 'Menu' ? '/menu' : item === 'Philosophy' ? '/about' : '/whisk';
                return (
                  <motion.div
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    key={item}
                    className="overflow-hidden"
                  >
                    <Link 
                      to={path} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-serif text-3xl text-luxury-charcoal tracking-widest uppercase hover:text-luxury-matcha transition-colors block p-4"
                    >
                      {item}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            
            <motion.div 
              custom={3}
              variants={linkVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute bottom-12 text-center"
            >
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-luxury-charcoal/40">
                Matcha no Ki © 2026
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
