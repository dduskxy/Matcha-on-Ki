import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function About() {
  return (
    <PageTransition className="bg-transparent min-h-screen pt-40 pb-32 font-sans selection:bg-luxury-matcha selection:text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        
        {/* Clean Layout with Soft Radial Glow (No boxy frames) */}
        <div className="relative py-16 md:py-24 z-10 flex flex-col items-center">
          
          {/* Massive soft glow behind the text to ensure readability over the 3D model without a visible box */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(252,251,248,0.95)_0%,rgba(252,251,248,0.8)_40%,rgba(252,251,248,0)_70%)] -z-10 rounded-full scale-[2]"></div>
          
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
            
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-luxury-matcha/50 to-transparent mx-auto my-12"></div>
            
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
    </PageTransition>
  );
}
