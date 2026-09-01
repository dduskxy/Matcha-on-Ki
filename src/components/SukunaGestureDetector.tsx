/**
 * SukunaGestureDetector
 *
 * A floating webcam panel that listens for Sukuna's Fukuma Mizushi finger seal.
 * Triggered by dispatching the custom event  'sukuna-gesture-panel-toggle'
 * OR by clicking the floating button if SHOW_BUTTON=true.
 *
 * Visual states:
 *   idle      → grey ring, "Activate Camera" prompt
 *   loading   → pulsing red ring
 *   ready     → dim red ring, webcam live
 *   detecting → orange ring flicker (partial gesture)
 *   charging  → red ring fills up charge arc + red glow on the preview
 *   fired     → full burst → Malevolent Shrine fires → cooldown
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSukunaGesture } from '../hooks/useSukunaGesture';
import { Camera, CameraOff, X, Zap } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Toggle via this custom event from anywhere in the app */
const TOGGLE_EVENT = 'sukuna-gesture-panel-toggle';

// ─── Charge Arc SVG helper ────────────────────────────────────────────────────
function ChargeArc({ progress }: { progress: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  const hue = Math.round(progress * 40); // 0=red, 40=orange-red

  return (
    <svg
      className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
      viewBox="0 0 100 100"
    >
      {/* track */}
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      {/* fill */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={`hsl(${hue},100%,55%)`}
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: progress > 0.1 ? `drop-shadow(0 0 6px hsl(${hue},100%,55%))` : undefined,
          transition: 'stroke-dashoffset 0.06s linear, stroke 0.1s ease',
        }}
      />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SukunaGestureDetector() {
  const [panelOpen, setPanelOpen] = useState(false);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const { state, holdProgress, error, start, stop, videoRef } = useSukunaGesture({
    debugCanvasRef: debugCanvasRef as React.RefObject<HTMLCanvasElement | null>,
  });

  // ── Listen for external toggle events ──────────────────────────────────────
  useEffect(() => {
    const toggle = () => setPanelOpen(p => !p);
    window.addEventListener(TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(TOGGLE_EVENT, toggle);
  }, []);

  // ── Mirror the hidden <video> into a visible <canvas> ─────────────────────
  const mirrorRafId = useRef<number>(0);
  const mirrorCanvasRef = useRef<HTMLCanvasElement>(null);

  const startMirror = useCallback(() => {
    const draw = () => {
      const video = videoRef.current;
      const canvas = mirrorCanvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror horizontally (selfie-style)
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
      mirrorRafId.current = requestAnimationFrame(draw);
    };
    draw();
  }, [videoRef]);

  const stopMirror = useCallback(() => {
    cancelAnimationFrame(mirrorRafId.current);
  }, []);

  // ── Stop camera & mirror when panel closes ────────────────────────────────
  useEffect(() => {
    if (!panelOpen) {
      stopMirror();
      stop();
    }
    return () => { stopMirror(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  // ── Explicit camera start (user-initiated only) ───────────────────────────
  const handleStartCamera = useCallback(async () => {
    await start();
    startMirror();
  }, [start, startMirror]);

  const handleStopCamera = useCallback(() => {
    stopMirror();
    stop();
  }, [stop, stopMirror]);

  const isCameraActive = state !== 'idle';

  // ── State → colours / labels ───────────────────────────────────────────────
  const ringColor = {
    idle:      'rgba(255,255,255,0.1)',
    loading:   'rgba(239,68,68,0.4)',
    ready:     'rgba(239,68,68,0.25)',
    detecting: 'rgba(251,146,60,0.5)',
    charging:  'rgba(239,68,68,0.8)',
    fired:     'rgba(239,68,68,1)',
  }[state];

  const stateLabel = {
    idle:      'Camera off',
    loading:   'Loading model…',
    ready:     'Show hand seal',
    detecting: 'Partial seal…',
    charging:  'Charging…',
    fired:     'Domain Expanded!',
  }[state];

  const isCharging = state === 'charging';

  return (
    <>
      {/* ── Floating trigger button (bottom-left) ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
        onClick={() => setPanelOpen(p => !p)}
        title="Sukuna Gesture Detector"
        className="fixed bottom-8 left-8 z-[998] w-12 h-12 rounded-full flex items-center justify-center
                   bg-[#0a0a0a] border border-white/10 shadow-xl hover:border-red-600/60
                   transition-all duration-300 hover:scale-105 group"
        style={{
          boxShadow: panelOpen
            ? '0 0 24px 6px rgba(220,38,38,0.35)'
            : '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {panelOpen
          ? <CameraOff className="w-5 h-5 text-red-400" strokeWidth={1.5} />
          : <Camera    className="w-5 h-5 text-white/50 group-hover:text-red-400 transition-colors" strokeWidth={1.5} />
        }
        {/* Live indicator dot */}
        {isCameraActive && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </motion.button>

      {/* ── Floating Panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="gesture-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-28 left-8 z-[998] w-72 rounded-2xl overflow-hidden shadow-2xl font-sans"
            style={{
              background: 'rgba(8,4,4,0.97)',
              border: `1px solid ${ringColor}`,
              boxShadow: isCharging
                ? `0 0 40px 10px rgba(220,38,38,0.4), 0 0 80px 20px rgba(100,0,0,0.2)`
                : '0 8px 48px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <p className="text-[9px] tracking-[0.4em] uppercase text-red-400/80 mb-0.5">
                  御廚子 · Fukuma Mizushi
                </p>
                <h3 className="text-sm font-serif text-white tracking-widest uppercase">
                  Gesture Seal
                </h3>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-white/20 hover:text-white/70 transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Consent / Camera Preview ── */}
            {!isCameraActive ? (
              /* Consent screen — shown before user grants camera access */
              <div className="flex flex-col items-center justify-center gap-4 px-5 py-8">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white/30" strokeWidth={1} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                    Camera permission required
                  </p>
                  <p className="text-[8px] text-white/25 leading-relaxed">
                    Your camera is used locally for hand gesture detection only.
                    No data is sent to any server.
                  </p>
                </div>
                <button
                  onClick={handleStartCamera}
                  className="mt-2 px-4 py-2 rounded-lg text-[9px] tracking-[0.25em] uppercase
                             bg-red-900/40 text-red-300 border border-red-800/50
                             hover:bg-red-800/60 hover:text-red-200 transition-all duration-200"
                >
                  Allow Camera
                </button>
                {error && (
                  <p className="text-[8px] text-red-500/70 tracking-wider">{error}</p>
                )}
              </div>
            ) : (
              /* Camera active — show preview */
              <>
                {/* Live badge + Stop button */}
                <div className="flex items-center justify-between px-5 py-2 bg-red-950/20 border-b border-red-900/20">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] tracking-[0.3em] uppercase text-red-400/80">Live</span>
                  </div>
                  <button
                    onClick={handleStopCamera}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] tracking-wider uppercase
                               text-red-400/70 border border-red-900/40 hover:bg-red-900/30 hover:text-red-300
                               transition-all duration-200"
                  >
                    <CameraOff className="w-3 h-3" strokeWidth={1.5} />
                    Stop Camera
                  </button>
                </div>

                {/* Camera preview */}
                <div
                  ref={videoContainerRef}
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: '4/3', background: '#050202' }}
                >
                  {/* Mirrored video canvas */}
                  <canvas
                    ref={mirrorCanvasRef}
                    className="w-full h-full object-cover"
                    style={{ display: state !== 'loading' ? 'block' : 'none' }}
                  />

                  {/* Skeleton overlay (debug) — flipped to match mirror */}
                  <canvas
                    ref={debugCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                      transform: 'scaleX(-1)',
                      display: state !== 'loading' ? 'block' : 'none',
                    }}
                  />

                  {/* Loading overlay */}
                  {state === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full border border-red-900/40 flex items-center justify-center"
                      >
                        <Camera className="w-6 h-6 text-red-900/60" strokeWidth={1} />
                      </motion.div>
                      <p className="text-[9px] tracking-[0.25em] uppercase text-white/30">
                        Loading model…
                      </p>
                    </div>
                  )}

                  {/* Scanlines overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)',
                    }}
                  />

                  {/* Charging vignette */}
                  <AnimatePresence>
                    {isCharging && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: holdProgress }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(ellipse at center, transparent 30%, rgba(180,0,0,0.6) 100%)',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Fired flash */}
                  <AnimatePresence>
                    {state === 'fired' && (
                      <motion.div
                        key="flash"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-red-900 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Status / Charge Bar */}
                <div className="px-5 py-4">
                  {/* Charge arc + label row */}
                  <div className="flex items-center gap-4">
                    {/* Arc ring */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <ChargeArc progress={holdProgress} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap
                          className="w-5 h-5 transition-colors duration-300"
                          strokeWidth={1.5}
                          style={{
                            color: holdProgress > 0.1 ? `hsl(${Math.round(holdProgress*40)},100%,60%)` : 'rgba(255,255,255,0.2)',
                            filter: holdProgress > 0.5 ? 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' : undefined,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-grow">
                      {/* State label */}
                      <motion.p
                        key={state}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] tracking-[0.2em] uppercase mb-1.5"
                        style={{ color: isCharging ? '#f87171' : 'rgba(255,255,255,0.4)' }}
                      >
                        {stateLabel}
                      </motion.p>

                      {/* Progress bar */}
                      <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `hsl(${Math.round(holdProgress * 40)},100%,55%)`,
                            boxShadow: holdProgress > 0.1 ? '0 0 8px rgba(239,68,68,0.8)' : undefined,
                          }}
                          animate={{ width: `${holdProgress * 100}%` }}
                          transition={{ duration: 0.06 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instruction */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[8px] text-white/20 tracking-[0.2em] uppercase leading-relaxed">
                      Both hands · index fingers raised · tips crossed · hold 1.5s
                    </p>
                    {error && (
                      <p className="text-[8px] text-red-500/70 mt-2 tracking-wider">{error}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
