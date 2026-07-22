import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Magnetic from '../components/Magnetic';
import PageTransition from '../components/PageTransition';

export default function Home() {
  return (
    <PageTransition className="min-h-screen pt-32 pb-20 selection:bg-luxury-matcha selection:text-white relative overflow-hidden">
      
      {/* Large Decorative Kanji Watermark (Adds depth without clutter) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vh] font-serif text-luxury-charcoal/[0.04] pointer-events-none select-none z-0 whitespace-nowrap">
        <motion.div
          animate={{ y: [-15, 15, -15], x: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        >
          抹茶の木
        </motion.div>
      </div>

      {/* Structural Minimal Lines (Shoji Screen Inspiration) */}
      <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-luxury-charcoal/[0.08] hidden md:block"></div>
      <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-luxury-charcoal/[0.08] hidden md:block"></div>

      <div className="max-w-7xl mx-auto px-6 h-[85vh] flex flex-col justify-between items-center text-center relative z-10 pt-10 pb-4">
        
        {/* Top Section: Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full flex flex-col items-center mt-8 relative"
        >
          {/* Subtle glow behind title for ultimate readability - Optimized with radial gradient instead of CSS blur */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(252,251,248,0.85)_0%,rgba(252,251,248,0)_70%)] -z-10 rounded-full scale-[2.5]"></div>

          <span className="font-sans text-[10px] md:text-xs tracking-[0.5em] uppercase text-luxury-matcha font-bold mb-8 block">The Art of Stillness</span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] tracking-wide relative flex flex-col items-center">
            <span className="overflow-hidden block pb-2 text-luxury-charcoal font-medium">
              <motion.span 
                initial={{ y: "110%", rotate: 2, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="block origin-top-left drop-shadow-sm"
              >
                Quiet Elegance.
              </motion.span>
            </span>
            <span className="overflow-hidden block pb-2 text-luxury-charcoal/60 italic font-light">
              <motion.span 
                initial={{ y: "110%", rotate: 2, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                className="block origin-top-left drop-shadow-sm"
              >
                Modern Tradition.
              </motion.span>
            </span>
          </h1>
        </motion.div>

        {/* Bottom Section: Paragraph & Button (Giving space for the 3D model in the middle) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.4 }}
          className="w-full flex flex-col items-center mb-12 relative"
        >
          {/* Subtle glow behind paragraph for ultimate readability - Optimized */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(252,251,248,0.95)_0%,rgba(252,251,248,0)_60%)] -z-10 rounded-full scale-[2]"></div>

          <p className="max-w-xl mx-auto text-sm md:text-base text-luxury-charcoal/75 font-light leading-loose mb-10 relative drop-shadow-sm">
            <span className="absolute -left-6 top-3 w-4 h-[1px] bg-gradient-to-r from-transparent to-luxury-matcha/50 hidden md:block"></span>
            <span className="absolute -right-6 top-3 w-4 h-[1px] bg-gradient-to-l from-transparent to-luxury-matcha/50 hidden md:block"></span>
            A sanctuary where the ancient tradition of Uji matcha meets contemporary stillness. We embrace the beauty of negative space, allowing every drop to be measured in time.
          </p>

          <Magnetic strength={20}>
            <Link to="/menu" className="group inline-flex items-center gap-4 pb-2 transition-all duration-700 relative">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold bg-gradient-to-r from-luxury-charcoal to-luxury-matcha bg-clip-text text-transparent group-hover:from-luxury-matcha group-hover:to-[#4A7A3A] transition-all duration-700">
                Explore the Menu
              </span>
              <span className="group-hover:translate-x-2 transition-transform duration-700 opacity-80 text-luxury-matcha">→</span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-luxury-charcoal/30 to-luxury-matcha/50 group-hover:from-luxury-matcha group-hover:to-luxury-matcha transition-all duration-700"></span>
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      {/* Floating Corner Details */}
      <div className="absolute bottom-10 left-6 md:left-12 text-[9px] tracking-[0.3em] uppercase text-luxury-charcoal font-medium hidden md:block writing-vertical-lr rotate-180 opacity-60 bg-luxury-cream/60 px-2 py-4 rounded-full backdrop-blur-md border border-white/20">
        Est. 2026 — Kyoto / BKK
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase font-bold bg-gradient-to-b from-luxury-charcoal to-luxury-matcha bg-clip-text text-transparent">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-luxury-matcha to-transparent"
        ></motion.div>
      </motion.div>

    </PageTransition>
  );
}
