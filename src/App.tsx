import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CanvasBackground from './components/CanvasBackground';
import FloatingBarista from './components/FloatingBarista';
import CartDrawer from './components/CartDrawer';
import BambooLeaves from './components/BambooLeaves';

function AppContent() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 selection:bg-cyber-matcha selection:text-black">
      <CanvasBackground />
      <BambooLeaves />
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<div className="h-screen flex items-center justify-center font-mono text-cyber-matcha">SYSTEM INFO: V1.0 - ALL NOMINAL</div>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <FloatingBarista />
    </div>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
