// App.tsx entry
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
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
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 }}>
      <Router>
        <AppContent />
      </Router>
    </ReactLenis>
  );
}

export default App;
