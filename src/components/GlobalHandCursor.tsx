import React, { useEffect, useRef, useState } from 'react';
import { useLightSensor } from '../hooks/useLightSensor';
import { useAudioSensor } from '../hooks/useAudioSensor';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const GlobalHandCursor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  useLightSensor(videoEl);
  useAudioSensor();
  const circleRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const scrollIconRef = useRef<SVGSVGElement>(null);
  const hoverStartTime = useRef<number | null>(null);
  const hoveredElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let handLandmarker: HandLandmarker;
    let animationFrameId: number;
    let lastVideoTime = -1;
    let stream: MediaStream | null = null;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let frameCount = 0;

    const GESTURE_COOLDOWN_MS = 4000;
    const HOLD_MS = 600;
    let lastHollowPurpleTime = 0;
    let lastMalevolentShrineTime = 0;
    let hollowPurpleHoldStart = 0;
    let malevolentShrineHoldStart = 0;

    const getDist = (p1: any, p2: any) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error('Hand tracking init error:', err);
      }
    };

    const setCursorRing = (offset: number, stroke: string) => {
      if (!circleRef.current) return;
      circleRef.current.style.stroke = stroke;
      circleRef.current.style.strokeDashoffset = String(offset);
    };

    const predictWebcam = () => {
      if (!videoRef.current || !handLandmarker) return;
      const now = performance.now();
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = handLandmarker.detectForVideo(videoRef.current, now);

        if (results.landmarks && results.landmarks.length > 0) {
          const lm = results.landmarks[0];
          const indexTip = lm[8], indexPip = lm[6];
          const middleTip = lm[12], middlePip = lm[10];
          const ringTip = lm[16], ringPip = lm[14];
          const pinkyTip = lm[20], pinkyPip = lm[18];
          const thumbTip = lm[4], thumbMcp = lm[2];
          const wrist = lm[0];

          const IBS = 0.3, ISZ = 0.4;
          const mappedX = Math.max(0, Math.min(1, ((1 - indexTip.x) - IBS) / ISZ));
          const mappedY = Math.max(0, Math.min(1, (indexTip.y - IBS) / ISZ));
          currentX += (mappedX * window.innerWidth - currentX) * 0.2;
          currentY += (mappedY * window.innerHeight - currentY) * 0.2;
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
            cursorRef.current.style.opacity = '1';
          }

          const C = 2 * Math.PI * 24;

          // GESTURE 1: HOLLOW PURPLE (Gojo)
          const isHP =
            indexTip.y < indexPip.y &&
            middleTip.y > middlePip.y &&
            ringTip.y > ringPip.y &&
            pinkyTip.y > pinkyPip.y &&
            getDist(thumbTip, middleTip) < 0.1;

          if (isHP) {
            if (hollowPurpleHoldStart === 0) hollowPurpleHoldStart = now;
            const prog = Math.min((now - hollowPurpleHoldStart) / HOLD_MS, 1);
            setCursorRing(C * (1 - prog), '#a855f7');
            if (prog >= 1 && now - lastHollowPurpleTime > GESTURE_COOLDOWN_MS) {
              lastHollowPurpleTime = now;
              hollowPurpleHoldStart = 0;
              window.dispatchEvent(new CustomEvent('hollow-purple'));
            }
          } else {
            hollowPurpleHoldStart = 0;
          }

          // GESTURE 2: MALEVOLENT SHRINE (Sukuna)
          const allOpen =
            indexTip.y < indexPip.y &&
            middleTip.y < middlePip.y &&
            ringTip.y < ringPip.y &&
            pinkyTip.y < pinkyPip.y &&
            thumbTip.x < thumbMcp.x + 0.06;
          const isSpread = getDist(indexTip, pinkyTip) > getDist(wrist, middleTip) * 0.55;
          const isMS = allOpen && isSpread && !isHP;

          if (isMS) {
            if (malevolentShrineHoldStart === 0) malevolentShrineHoldStart = now;
            const prog = Math.min((now - malevolentShrineHoldStart) / HOLD_MS, 1);
            setCursorRing(C * (1 - prog), '#ef4444');
            if (prog >= 1 && now - lastMalevolentShrineTime > GESTURE_COOLDOWN_MS) {
              lastMalevolentShrineTime = now;
              malevolentShrineHoldStart = 0;
              window.dispatchEvent(new CustomEvent('malevolent-shrine'));
            }
          } else {
            malevolentShrineHoldStart = 0;
          }

          // Idle hover/click
          if (!isHP && !isMS) {
            setCursorRing(C, '#f43f5e');
            frameCount++;
            if (frameCount % 5 === 0) {
              const el = document.elementFromPoint(currentX, currentY);
              const clickable = el?.closest('button,a,[role="button"],[data-clickable="true"]') as HTMLElement | null;
              if (clickable !== hoveredElement.current) {
                hoveredElement.current = clickable;
                hoverStartTime.current = clickable ? performance.now() : null;
                if (!clickable) setCursorRing(C, '#f43f5e');
              }
            }
            if (hoveredElement.current && hoverStartTime.current) {
              const prog = Math.min((performance.now() - hoverStartTime.current) / 2000, 1);
              setCursorRing(C * (1 - prog), '#f43f5e');
              if (prog >= 1) {
                hoveredElement.current.click();
                hoveredElement.current = null;
                hoverStartTime.current = null;
                setCursorRing(C, '#f43f5e');
              }
            }
          }
        } else {
          if (cursorRef.current) cursorRef.current.style.opacity = '0';
          hoveredElement.current = null;
          hoverStartTime.current = null;
          hollowPurpleHoldStart = 0;
          malevolentShrineHoldStart = 0;
          setCursorRing(2 * Math.PI * 24, '#f43f5e');
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initializeHandDetection();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <>
      <video ref={videoRef} onLoadedData={(e) => setVideoEl(e.currentTarget)} className="hidden" playsInline autoPlay muted />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-[9999] flex items-center justify-center opacity-0"
        style={{ margin: '-32px 0 0 -32px', willChange: 'transform, opacity' }}
      >
        <div ref={dotRef} className="absolute w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
        <svg ref={scrollIconRef} className="absolute opacity-0 pointer-events-none" viewBox="0 0 24 24" />
        <svg width="64" height="64" className="absolute -rotate-90">
          <circle cx="32" cy="32" r="24" stroke="rgba(244,63,94,0.2)" strokeWidth="4" fill="none" />
          <circle
            ref={circleRef}
            cx="32" cy="32" r="24"
            stroke="#f43f5e" strokeWidth="4" fill="none"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24}
          />
        </svg>
      </div>
    </>
  );
};

export default GlobalHandCursor;
