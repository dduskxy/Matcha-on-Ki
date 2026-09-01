import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const GlobalHandCursor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const scrollIconRef = useRef<SVGSVGElement>(null);
  
  const hoverStartTime = useRef<number | null>(null);
  const hoveredElement = useRef<HTMLElement | null>(null);
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let handLandmarker: HandLandmarker;
    let animationFrameId: number;
    let lastVideoTime = -1;
    let stream: MediaStream | null = null;
    
    // Lerp state
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let lastHandY = -1;

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
          const landmarks = results.landmarks[0];
          const indexTip = landmarks[8];
          const indexPip = landmarks[6];
          const middleTip = landmarks[12];
          const middlePip = landmarks[10];
          const ringTip = landmarks[16];
          const ringPip = landmarks[14];

          // 1. High-Sensitivity 1-Finger Control
          // Map an inner bounding box (0.3 to 0.7) to the full screen
          const innerBoxStart = 0.3;
          const innerBoxSize = 0.4;
          
          const rawX = 1 - indexTip.x; // Mirror X
          const rawY = indexTip.y;
          
          const mappedX = Math.max(0, Math.min(1, (rawX - innerBoxStart) / innerBoxSize));
          const mappedY = Math.max(0, Math.min(1, (rawY - innerBoxStart) / innerBoxSize));
          
          const targetX = mappedX * window.innerWidth;
          const targetY = mappedY * window.innerHeight;

          // 2. Smooth Cursor (Lerp)
          currentX += (targetX - currentX) * 0.2;
          currentY += (targetY - currentY) * 0.2;

          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            cursorRef.current.style.opacity = '1';
          }

          // 3. 2-Finger Scrolling Logic
          // Check if index and middle are raised, but ring finger is down
          const isIndexRaised = indexTip.y < indexPip.y;
          const isMiddleRaised = middleTip.y < middlePip.y;
          const isRingDown = ringTip.y > ringPip.y;
          
          // Check if index and middle tips are close to each other
          const dx = indexTip.x - middleTip.x;
          const dy = indexTip.y - middleTip.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const isScrolling = isIndexRaised && isMiddleRaised && isRingDown && distance < 0.1;

          if (isScrolling) {
            if (lastHandY !== -1) {
              const deltaY = rawY - lastHandY;
              const scrollMultiplier = 3000;
              window.scrollBy({ top: deltaY * scrollMultiplier, behavior: 'auto' });
            }
            lastHandY = rawY;
            
            // Disable hover logic
            hoveredElement.current = null;
            hoverStartTime.current = null;
            if (circleRef.current) {
              circleRef.current.style.strokeDashoffset = `${2 * Math.PI * 24}`;
            }

            // Visual updates for scroll mode (blue dot + scroll icon)
            if (dotRef.current) {
              dotRef.current.classList.remove('bg-rose-500', 'shadow-[0_0_15px_rgba(244,63,94,0.6)]');
              dotRef.current.classList.add('bg-blue-500', 'shadow-[0_0_15px_rgba(59,130,246,0.6)]');
            }
            if (scrollIconRef.current) {
              scrollIconRef.current.style.opacity = '1';
            }
          } else {
            lastHandY = -1;
            
            // Visual updates for normal mode (rose dot, no icon)
            if (dotRef.current) {
              dotRef.current.classList.add('bg-rose-500', 'shadow-[0_0_15px_rgba(244,63,94,0.6)]');
              dotRef.current.classList.remove('bg-blue-500', 'shadow-[0_0_15px_rgba(59,130,246,0.6)]');
            }
            if (scrollIconRef.current) {
              scrollIconRef.current.style.opacity = '0';
            }

            // Normal hover logic using lerped coordinates
            const elementUnderCursor = document.elementFromPoint(currentX, currentY);
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
                  clickable.click();
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
          }
        } else {
          // No hands detected
          if (cursorRef.current) cursorRef.current.style.opacity = '0';
          hoveredElement.current = null;
          hoverStartTime.current = null;
          lastHandY = -1;
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
        <div 
          ref={dotRef}
          className="absolute w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-200" 
        />
        
        {/* Scroll Icon Overlay */}
        <svg
          ref={scrollIconRef}
          className="absolute w-6 h-6 text-white opacity-0 transition-opacity duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>

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
