import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const GlobalHandCursor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  
  const hoverStartTime = useRef<number | null>(null);
  const hoveredElement = useRef<HTMLElement | null>(null);
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let handLandmarker: HandLandmarker;
    let animationFrameId: number;
    let lastVideoTime = -1;
    let stream: MediaStream | null = null;

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

        stream = await navigator.mediaDevices.getUserMedia({
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

          // Use document.elementFromPoint to find the element under the cursor
          // The cursor div already has pointer-events-none, so it won't block the element below
          const elementUnderCursor = document.elementFromPoint(x, y);
          const clickable = elementUnderCursor?.closest(
            'button, a, [role="button"], [data-clickable="true"]'
          ) as HTMLElement | null;

          if (clickable) {
            if (hoveredElement.current !== clickable) {
              hoveredElement.current = clickable;
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
                clickable.click();
                
                // Reset state to avoid multiple rapid clicks
                hoverStartTime.current = null;
                hoveredElement.current = null;
                
                if (circleRef.current) {
                  circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
                }
              }
            }
          } else {
            hoveredElement.current = null;
            hoverStartTime.current = null;
            if (circleRef.current) {
              circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
            }
          }
        } else {
          // No hands detected
          if (cursorRef.current) cursorRef.current.style.opacity = '0';
          hoveredElement.current = null;
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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Hidden Webcam Stream for Processing */}
      <video 
        ref={videoRef} 
        className="hidden" 
        playsInline 
        autoPlay 
        muted 
      />

      {/* Hand Tracking Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-[9999] flex items-center justify-center opacity-0 transition-opacity duration-300"
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
    </>
  );
};

export default GlobalHandCursor;
