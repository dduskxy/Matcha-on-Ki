import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { menuData } from '../data/menuData';

const KIOSK_ITEMS = [
  menuData.find((m) => m.id === 'm1') || menuData[0], // Matcha Usucha
  menuData.find((m) => m.id === 't3') || menuData[1], // Hojicha Latte
  { ...(menuData.find((m) => m.id === 't2') || menuData[2]), name: 'Yuzu Sencha', jpName: '柚子煎茶', id: 'k-yuzu' }
];

export const Kiosk: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const hoverStartTime = useRef<number | null>(null);
  const hoveredCardId = useRef<string | null>(null);
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let handLandmarker: HandLandmarker;
    let animationFrameId: number;
    let lastVideoTime = -1;

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            setIsReady(true);
            predictWebcam();
          });
        }
      } catch (err) {
        console.error('Error initializing hand tracking:', err);
      }
    };

    const predictWebcam = () => {
      if (!videoRef.current || !handLandmarker) return;

      const startTimeMs = performance.now();
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const indexFingerTip = results.landmarks[0][8];
          
          // Map to screen (mirror x because camera is front-facing)
          const x = (1 - indexFingerTip.x) * window.innerWidth;
          const y = indexFingerTip.y * window.innerHeight;

          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            cursorRef.current.style.opacity = '1';
          }

          let currentHover: string | null = null;
          cardsRef.current.forEach((card) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            // Optional padding can be added here
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
              currentHover = card.dataset.id || null;
            }
          });

          if (currentHover) {
            if (hoveredCardId.current !== currentHover) {
              hoveredCardId.current = currentHover;
              hoverStartTime.current = performance.now();
            } else {
              const elapsed = performance.now() - (hoverStartTime.current || 0);
              const progress = Math.min(elapsed / 2000, 1);
              
              if (circleRef.current) {
                const circumference = 2 * Math.PI * 24;
                circleRef.current.style.strokeDashoffset = `${circumference - progress * circumference}`;
              }

              if (progress === 1) {
                // Item selected after 2 seconds
                const item = KIOSK_ITEMS.find((i) => i.id === currentHover);
                if (item) {
                  addItem(item);
                  setFeedback(item.name);
                  setTimeout(() => setFeedback(null), 2500);
                }
                hoverStartTime.current = null;
                hoveredCardId.current = null;
                
                if (circleRef.current) {
                  circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
                }
              }
            }
          } else {
            hoveredCardId.current = null;
            hoverStartTime.current = null;
            if (circleRef.current) {
              circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
            }
          }
        } else {
          // No hands detected
          if (cursorRef.current) cursorRef.current.style.opacity = '0';
          hoveredCardId.current = null;
          hoverStartTime.current = null;
          if (circleRef.current) {
            circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
          }
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initializeHandDetection();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [addItem]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans overflow-hidden relative selection:bg-rose-200">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-5">
        <svg viewBox="0 0 100 100" className="w-[120vw] h-[120vh] text-stone-900 fill-current">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Hidden Webcam Stream for Processing */}
      <video 
        ref={videoRef} 
        className="hidden" 
        playsInline 
        autoPlay 
        muted 
      />

      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-wider">
            Gestural Ordering
          </h1>
          <p className="text-stone-500 uppercase tracking-widest text-sm">
            {isReady ? 'Hover over an item to add to cart' : 'Initializing camera and AI...'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {KIOSK_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              ref={(el) => (cardsRef.current[idx] = el)}
              data-id={item.id}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.8, ease: 'easeOut' }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-serif pointer-events-none transition-opacity group-hover:opacity-20">
                {item.jpName}
              </div>
              <div className="w-24 h-24 mb-6 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 transition-transform duration-500 group-hover:scale-110">
                <div className="text-4xl opacity-80">
                  {item.icon === 'matcha' ? '🍵' : item.icon === 'coffee' ? '☕' : item.icon === 'cold' ? '🧊' : '🍡'}
                </div>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-2">{item.name}</h3>
              <p className="text-stone-500 text-sm mb-6 flex-grow">{item.description}</p>
              <div className="text-lg font-medium text-rose-800">¥{item.price}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hand Tracking Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-50 flex items-center justify-center opacity-0 transition-opacity duration-300"
        style={{ margin: '-32px 0 0 -32px' }}
      >
        <div className="absolute w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
        <svg width="64" height="64" className="absolute transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="rgba(244,63,94,0.2)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            ref={circleRef}
            cx="32"
            cy="32"
            r="24"
            stroke="#f43f5e"
            strokeWidth="4"
            fill="none"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24}
            className="transition-[stroke-dashoffset] duration-75"
          />
        </svg>
      </div>

      {/* Selection Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl font-serif text-lg flex items-center gap-3"
          >
            <span className="text-rose-400">✨</span> Added {feedback} to cart
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Kiosk;
