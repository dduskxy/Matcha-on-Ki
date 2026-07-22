// App.tsx entry
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import CanvasBackground from './components/CanvasBackground';
import FloatingBarista from './components/FloatingBarista';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';

function AppContent() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen selection:bg-cyber-matcha selection:text-black">
      <Preloader />
      <CustomCursor />
      <CanvasBackground />
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
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
