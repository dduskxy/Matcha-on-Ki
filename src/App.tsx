// App.tsx entry
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Admin from './pages/Admin';
import Kiosk from './pages/Kiosk';
import CanvasBackground from './components/CanvasBackground';
import FloatingBarista from './components/FloatingBarista';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import LiveToast from './components/LiveToast';
import GlobalHandCursor from './components/GlobalHandCursor';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Secret Admin Cheat Code (type 'admin' anywhere)
  useEffect(() => {
    let keys = '';
    const secretCode = 'admin';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      keys += e.key.toLowerCase();
      if (keys.length > secretCode.length) {
        keys = keys.slice(1);
      }
      if (keys === secretCode) {
        navigate('/admin');
        keys = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="relative min-h-screen selection:bg-cyber-matcha selection:text-black">
      <Preloader />
      <LiveToast />
      <CustomCursor />
      <GlobalHandCursor />
      <CanvasBackground />
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/kiosk" element={<Kiosk />} />
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
