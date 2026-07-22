import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-transparent min-h-screen pt-40 pb-32 font-sans selection:bg-luxury-matcha selection:text-white"
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        
        {/* Glassmorphism Card for Ultimate Readability */}
        <div className="bg-luxury-cream/85 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[40px] px-8 py-16 md:px-16 md:py-24 relative overflow-hidden">
          
          {/* Subtle noise/texture overlay optional, kept clean for now */}
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-3xl md:text-5xl font-serif text-luxury-charcoal tracking-[0.2em] uppercase mb-16 relative z-10"
          >
            Philosophy
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-12 text-sm md:text-base text-luxury-charcoal/90 font-light leading-loose relative z-10"
          >
            <p>
              At <span className="font-medium text-luxury-matcha tracking-widest uppercase text-xs">Matcha no Ki</span>, we believe that tea is not merely a beverage, but a momentary pause in the relentless flow of time.
            </p>
            <p>
              Rooted in the ancient principles of Chado (The Way of Tea), we strive to bring harmony, respect, purity, and tranquility into the modern world. Every leaf is meticulously sourced from the misty hills of Uji, Kyoto—handpicked and stone-ground to preserve its purest essence.
            </p>
            
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-luxury-charcoal/30 to-transparent mx-auto my-12"></div>
            
            <h2 className="text-xl md:text-2xl font-serif text-luxury-charcoal tracking-widest uppercase mb-8">Location & Hours</h2>
            <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-luxury-charcoal/80">
              123 Kyoto Street, Sukhumvit 49<br/>
              Bangkok, Thailand 10110
            </p>
            <ul className="text-[10px] md:text-xs tracking-[0.1em] space-y-3 mt-8 text-luxury-charcoal/70">
              <li>Tuesday - Sunday: 08:00 AM - 06:00 PM</li>
              <li>Monday: Closed for Stillness</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
