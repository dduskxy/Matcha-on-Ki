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
import { AtmosphereLayer } from './components/AtmosphereLayer';
import HollowPurpleFeature from './components/HollowPurpleFeature';
import MalevolentShrineFeature from './components/MalevolentShrineFeature';
import SukunaGestureDetector from './components/SukunaGestureDetector';

import { useEnvironmentStore } from './store/useEnvironmentStore';
import { memo } from 'react';

const AppContent = memo(function AppContent() {
  const atmosphereMode = useEnvironmentStore((state) => state.atmosphereMode);
  useEffect(() => { document.documentElement.setAttribute('data-atmosphere', atmosphereMode); }, [atmosphereMode]);
  const location = useLocation();
  const navigate = useNavigate();

  // Secret Cheat Codes (type anywhere, outside inputs)
  useEffect(() => {
    const codes: Record<string, () => void> = {
      'admin':  () => navigate('/admin'),
      'sukuna': () => window.dispatchEvent(new Event('malevolent-shrine')),
      'gojo':   () => window.dispatchEvent(new Event('hollow-purple')),
    };
    const maxLen = Math.max(...Object.keys(codes).map(k => k.length));
    let keys = '';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys += e.key.toLowerCase();
      if (keys.length > maxLen) keys = keys.slice(keys.length - maxLen);
      for (const [code, action] of Object.entries(codes)) {
        if (keys.endsWith(code)) { action(); keys = ''; break; }
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
      <HollowPurpleFeature />
      <MalevolentShrineFeature />
      <AtmosphereLayer />
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
      <SukunaGestureDetector />
    </div>
  );
});

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
