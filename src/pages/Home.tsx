import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Magnetic from '../components/Magnetic';
import PageTransition from '../components/PageTransition';

export default function Home() {
  return (
    <PageTransition className="min-h-[100dvh] pt-32 pb-12 selection:bg-luxury-matcha selection:text-white relative overflow-hidden flex flex-col justify-end">
      
      {/* Background Japanese kanji (very faint) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vh] md:text-[50vh] font-serif text-black/[0.015] pointer-events-none whitespace-nowrap z-[-1] select-none">
        抹茶の木
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-start justify-end h-full flex-grow">
        
        {/* Subtle, clean text at the bottom left to let the 3D model shine completely unobstructed in the center/right */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="max-w-xl pb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-8 bg-luxury-matcha"></span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-matcha font-medium drop-shadow-[0_0_10px_rgba(252,251,248,0.8)]">The Art of Stillness</span>
          </div>
          
          {/* Subtle text shadow added for legibility without needing a massive white radial background */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-luxury-charcoal leading-tight mb-6 drop-shadow-[0_0_20px_rgba(252,251,248,0.7)]">
            Quiet Elegance.<br />
            <span className="italic font-light opacity-80">Modern Tradition.</span>
          </h1>
          
          <p className="text-sm text-luxury-charcoal/80 leading-relaxed max-w-md mb-10 font-light drop-shadow-[0_0_10px_rgba(252,251,248,0.7)]">
            A sanctuary where the ancient tradition of Uji matcha meets contemporary stillness. We embrace the beauty of negative space.
          </p>
          
          <Magnetic strength={0.2}>
            <Link 
              to="/menu" 
              className="group inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-luxury-charcoal hover:text-luxury-matcha transition-colors"
            >
              <span className="relative overflow-hidden pb-1">
                <span className="inline-block relative z-10 font-semibold drop-shadow-[0_0_10px_rgba(252,251,248,0.8)]">Explore the Menu</span>
                <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-luxury-matcha to-transparent transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></span>
              </span>
              <ArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-2 text-luxury-charcoal group-hover:text-luxury-matcha drop-shadow-[0_0_10px_rgba(252,251,248,0.8)]" />
            </Link>
          </Magnetic>
        </motion.div>

      </div>
    </PageTransition>
  );
}
