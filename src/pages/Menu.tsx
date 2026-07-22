import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuData, type MenuItem } from '../data/menuData';
import { Coffee, GlassWater, Leaf, Circle, Plus } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import PageTransition from '../components/PageTransition';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { 
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(10px)',
    transition: { 
      duration: 0.4, 
      ease: [0.2, 0.8, 0.2, 1]
    } 
  }
};

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Matcha' | 'Coffee' | 'Tea' | 'Sweets'>('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const addItem = useCartStore(state => state.addItem);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId) {
      const item = menuData.find(m => m.id === itemId);
      if (item) {
        setSelectedItem(item);
        // Optionally clear the query param after opening so it doesn't reopen on next render
        // setSearchParams({}); 
      }
    }
  }, [searchParams]);

  const categories = ['All', 'Matcha', 'Coffee', 'Tea', 'Sweets'] as const;
  
  const filteredMenu = activeCategory === 'All' 
    ? menuData 
    : menuData.filter(item => item.category === activeCategory);

  const renderIcon = (type: string) => {
    const props = { strokeWidth: 0.5, className: "w-20 h-20 opacity-50 group-hover:opacity-100 transition-all duration-700" };
    switch(type) {
      case 'matcha': return <GlassWater {...props} />;
      case 'coffee': return <Coffee {...props} />;
      case 'cold': return <GlassWater {...props} />;
      case 'tea': return <Leaf {...props} />;
      case 'sweet': return <Circle {...props} />;
      default: return <Coffee {...props} />;
    }
  };

  return (
    <PageTransition className="bg-luxury-cream min-h-screen pt-32 pb-32 font-sans selection:bg-luxury-matcha selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-3xl md:text-5xl font-serif text-luxury-charcoal tracking-[0.2em] uppercase mb-4">お品書き</h1>
          <p className="text-xs tracking-[0.3em] uppercase text-luxury-charcoal/70">The Collection</p>
        </div>

        {/* Minimal Filters */}
        <div className="flex flex-wrap justify-center gap-8 mb-24 border-b border-luxury-charcoal/5 pb-8">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 ${
                activeCategory === cat ? 'text-luxury-charcoal font-medium border-b border-luxury-charcoal pb-1' : 'text-luxury-charcoal/60 hover:text-luxury-charcoal/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ultra Minimal Grid List with Staggered Entrance */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16"
          >
            {filteredMenu.map(item => (
              <motion.div 
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer flex gap-10 items-center border-b border-transparent hover:border-luxury-charcoal/30 pb-6 transition-all duration-700"
              >
                {/* 2D Model Icon */}
                <div className="w-24 flex-shrink-0 flex items-center justify-center text-luxury-matcha">
                  {renderIcon(item.icon)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-serif text-xl text-luxury-charcoal tracking-wide group-hover:text-luxury-matcha transition-colors duration-500">{item.name}</h3>
                    <span className="text-sm tracking-wider font-light text-luxury-charcoal/80">{item.price} ฿</span>
                  </div>
                  <div className="text-[10px] text-luxury-charcoal/70 tracking-[0.3em] uppercase mb-3">{item.jpName}</div>
                  <p className="text-xs text-luxury-charcoal/80 font-light leading-relaxed max-w-[250px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 absolute md:relative">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Extreme Minimal Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-cream/95 backdrop-blur-md p-4" 
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="max-w-lg w-full flex flex-col items-center text-center" 
              onClick={e => e.stopPropagation()}
            >
              <div className="text-luxury-matcha mb-16 transform scale-150">
                {renderIcon(selectedItem.icon)}
              </div>
              <h2 className="text-4xl font-serif text-luxury-charcoal tracking-wide mb-4">{selectedItem.name}</h2>
              <div className="text-xs text-luxury-charcoal/70 tracking-[0.4em] uppercase mb-10">{selectedItem.jpName}</div>
              
              <p className="text-luxury-charcoal/80 font-light leading-relaxed mb-12 max-w-sm mx-auto">
                {selectedItem.description}
              </p>
              
              <div className="text-2xl font-serif text-luxury-charcoal mb-12">{selectedItem.price} ฿</div>
              
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => {
                    addItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-luxury-charcoal text-luxury-cream px-12 py-4 rounded-xl text-xs tracking-[0.2em] uppercase hover:bg-luxury-matcha transition-colors shadow-lg flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" /> Add to Order
                </button>
                
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-[10px] tracking-[0.3em] uppercase text-luxury-charcoal/70 hover:text-luxury-charcoal border-b border-luxury-charcoal/40 pb-1 transition-all duration-300"
                >
                  Return to Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
