/**
 * useSukunaGesture — Webcam-based hand gesture detector
 *
 * Detects Sukuna's "Fukuma Mizushi" domain expansion seal via MediaPipe HandLandmarker.
 * The seal is the Buddhist ENMATEN MUDRA (Yama, King of Hell):
 *
 *   - Both hands PRESSED TOGETHER (wrists close, hands clasped)
 *   - MIDDLE + RING fingers on each hand EXTENDED upward (touching between hands)
 *   - INDEX + PINKY + THUMB on each hand FOLDED / curled inward
 *
 * This is the EXACT OPPOSITE of Gojo's Taishakuten-In (one hand, index up, middle wrapped).
 *
 * When held for ~1.5 s → dispatches 'malevolent-shrine' event.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

/** How many consecutive frames the gesture must be held (@ ~30 fps ≈ 1.5 s) */
const HOLD_FRAMES = 45;
/** Cooldown after firing (ms) so it doesn't retrigger instantly */
const COOLDOWN_MS = 15_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Lm = { x: number; y: number; z: number };

/** Euclidean distance between two 2-D normalised landmarks */
const dist2d = (a: Lm, b: Lm) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Returns true if the finger (given its MCP and TIP landmarks) is extended —
 * i.e. TIP is above MCP in image space (lower y = higher in frame).
 */
const isExtended = (mcp: Lm, tip: Lm): boolean => tip.y < mcp.y - 0.04;

/**
 * Returns true if the finger is clearly curled —
 * TIP is BELOW or level with MCP in image space.
 */
const isCurled = (mcp: Lm, tip: Lm): boolean => tip.y > mcp.y - 0.01;

/**
 * Analyse one hand's landmarks for the Enmaten Mudra (Sukuna's Fukuma Mizushi seal).
 *
 * TRUE pose (from anime / Buddhist mudra research):
 *   ✅ Middle finger (9→12) — EXTENDED upward
 *   ✅ Ring   finger (13→16) — EXTENDED upward, pressed against middle
 *   ❌ Index  finger  (5→8) — CURLED / folded inward
 *   ❌ Pinky  finger (17→20) — CURLED / folded inward
 *   ❌ Thumb             (2→4) — tucked (tip near index MCP lm[5])
 *
 * This is the exact opposite of Gojo's Taishakuten-In where index is UP
 * and middle is wrapped around it.
 */
function analyseHand(lm: Lm[]) {
  return {
    // Core Sukuna fingers — middle & ring must be clearly extended upward
    middleUp:    isExtended(lm[9],  lm[12]),
    ringUp:      isExtended(lm[13], lm[16]),
    // Exclusion fingers — index & pinky must be folded down
    indexCurled: isCurled(lm[5],  lm[8]),
    pinkyCurled: isCurled(lm[17], lm[20]),
    // Thumb tucked inward (tip near index MCP)
    thumbCurled: dist2d(lm[4], lm[5]) < 0.13,
    // Wrist position — used to check if hands are pressed together
    wrist:       lm[0],
    // Middle & ring tips — both hands' fingers should be close/touching
    middleTip:   lm[12],
    ringTip:     lm[16],
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type GestureState =
  | 'idle'        // camera not started
  | 'loading'     // loading MediaPipe model
  | 'ready'       // running, no gesture
  | 'detecting'   // partial gesture (one hand / wrong pose)
  | 'charging'    // both hands correct, building up hold frames
  | 'fired';      // just triggered — in cooldown

export interface SukunaGestureOptions {
  /** Canvas ref to draw the debug skeleton on (optional) */
  debugCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function useSukunaGesture(options: SukunaGestureOptions = {}) {
  const [state, setState]       = useState<GestureState>('idle');
  const [holdProgress, setHold] = useState(0); // 0–1
  const [error, setError]       = useState<string | null>(null);

  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const landmarker  = useRef<HandLandmarker | null>(null);
  const rafId       = useRef<number>(0);
  const holdFrames  = useRef(0);
  const lastFired   = useRef(0);
  const running     = useRef(false);

  // ── Build MediaPipe model lazily ──────────────────────────────────────────
  const init = useCallback(async (video: HTMLVideoElement) => {
    setState('loading');
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      landmarker.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      videoRef.current = video;
      running.current = true;
      setState('ready');
      loop();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load MediaPipe');
      setState('idle');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Per-frame detection loop ──────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!running.current || !landmarker.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      rafId.current = requestAnimationFrame(loop);
      return;
    }

    const result: HandLandmarkerResult = landmarker.current.detectForVideo(
      video,
      performance.now(),
    );

    // Draw optional debug skeleton
    if (options.debugCanvasRef?.current) {
      drawDebug(options.debugCanvasRef.current, video, result);
    }

    const hands = result.landmarks; // array of 21-point arrays
    const now = Date.now();

    if (now - lastFired.current < COOLDOWN_MS) {
      setState('fired');
      holdFrames.current = 0;
      setHold(0);
      rafId.current = requestAnimationFrame(loop);
      return;
    }

    if (hands.length < 2) {
      // Need both hands
      holdFrames.current = Math.max(0, holdFrames.current - 2);
      setHold(holdFrames.current / HOLD_FRAMES);
      setState(hands.length === 1 ? 'detecting' : 'ready');
      rafId.current = requestAnimationFrame(loop);
      return;
    }

    // Analyse both hands
    const h0 = analyseHand(hands[0]);
    const h1 = analyseHand(hands[1]);

    // ── Enmaten Mudra analysis ─────────────────────────────────────────────
    // Each hand: middle+ring EXTENDED, index+pinky+thumb CURLED
    const h0CorrectShape =
      h0.middleUp && h0.ringUp &&
      h0.indexCurled && h0.pinkyCurled && h0.thumbCurled;
    const h1CorrectShape =
      h1.middleUp && h1.ringUp &&
      h1.indexCurled && h1.pinkyCurled && h1.thumbCurled;

    // Hands must be pressed together: wrists within ~0.30 normalised units
    const wristsTogether = dist2d(h0.wrist, h1.wrist) < 0.30;

    // Middle finger tips from each hand must be close (fingers touching/overlapping)
    const middleTipsTouching = dist2d(h0.middleTip, h1.middleTip) < 0.12;

    const poseHeld =
      h0CorrectShape && h1CorrectShape && wristsTogether && middleTipsTouching;

    if (poseHeld) {
      holdFrames.current = Math.min(holdFrames.current + 1, HOLD_FRAMES);
      setHold(holdFrames.current / HOLD_FRAMES);
      setState('charging');

      if (holdFrames.current >= HOLD_FRAMES) {
        // 🔥 FIRE!
        lastFired.current = now;
        holdFrames.current = 0;
        setHold(0);
        setState('fired');
        window.dispatchEvent(new Event('malevolent-shrine'));
      }
    } else {
      holdFrames.current = Math.max(0, holdFrames.current - 1);
      setHold(holdFrames.current / HOLD_FRAMES);
      setState(
        hands.length === 2 && (h0CorrectShape || h1CorrectShape || wristsTogether)
          ? 'detecting'
          : 'ready',
      );
    }

    rafId.current = requestAnimationFrame(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.debugCanvasRef]);

  // ── Start / Stop ──────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (running.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      await video.play();
      await init(video);
    } catch (e: any) {
      setError(e?.message ?? 'Camera access denied');
    }
  }, [init]);

  const stop = useCallback(() => {
    running.current = false;
    cancelAnimationFrame(rafId.current);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    landmarker.current?.close();
    landmarker.current = null;
    holdFrames.current = 0;
    setHold(0);
    setState('idle');
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { state, holdProgress, error, start, stop, videoRef };
}

// ─── Debug Skeleton Renderer ──────────────────────────────────────────────────

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],        // thumb
  [0,5],[5,6],[6,7],[7,8],        // index
  [5,9],[9,10],[10,11],[11,12],   // middle
  [9,13],[13,14],[14,15],[15,16], // ring
  [13,17],[17,18],[18,19],[19,20],// pinky
  [0,17],
];

function drawDebug(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  result: HandLandmarkerResult,
) {
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const lm of result.landmarks) {
    ctx.strokeStyle = 'rgba(239,68,68,0.7)';
    ctx.lineWidth   = 2;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
      ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
      ctx.stroke();
    }
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
  }
}
