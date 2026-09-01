/**
 * useSukunaGesture — Webcam-based hand gesture detector
 *
 * Detects "Sukuna's Fukuma Mizushi" finger seal via MediaPipe HandLandmarker:
 *   - Both hands visible in frame
 *   - Both index fingers raised (extended upward)
 *   - Other fingers curled (closed fist-like)
 *   - Index finger tips of both hands are close together (crossed / touching)
 *
 * When the seal is held for ~1.5 s, dispatches 'malevolent-shrine' event.
 *
 * Landmark indices (MediaPipe 21-point model):
 *   WRIST=0  THUMB_TIP=4
 *   INDEX_MCP=5  INDEX_TIP=8
 *   MIDDLE_MCP=9  MIDDLE_TIP=12
 *   RING_MCP=13  RING_TIP=16
 *   PINKY_MCP=17 PINKY_TIP=20
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

/** Normalised-coord distance threshold for index tips to be "touching/crossed" */
const TIP_CROSS_THRESHOLD = 0.14;
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
 * Analyse one hand's landmarks.
 * Returns { indexUp, middleCurled, ringCurled, pinkyCurled, thumbCurled, indexTip }.
 *
 * thumbCurled: thumb tip (lm[4]) is close to the index MCP (lm[5]) —
 * i.e. thumb is folded inward across the palm, as in Sukuna's seal.
 * Gojo's pose keeps thumbs extended/out, so this differentiates the two.
 */
function analyseHand(lm: Lm[]) {
  return {
    indexUp:      isExtended(lm[5], lm[8]),
    middleCurled: isCurled(lm[9],  lm[12]),
    ringCurled:   isCurled(lm[13], lm[16]),
    pinkyCurled:  isCurled(lm[17], lm[20]),
    // thumb tip within 0.12 normalised units of index MCP → thumb is tucked
    thumbCurled:  dist2d(lm[4], lm[5]) < 0.12,
    indexTip:     lm[8],
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

    const bothIndexUp =
      h0.indexUp && h1.indexUp;
    const othersCurled =
      h0.middleCurled && h0.ringCurled && h0.pinkyCurled &&
      h1.middleCurled && h1.ringCurled && h1.pinkyCurled;
    // Sukuna's seal: thumbs folded inward. Gojo keeps thumbs out → excludes Gojo pose.
    const bothThumbsCurled =
      h0.thumbCurled && h1.thumbCurled;
    const tipsClose =
      dist2d(h0.indexTip, h1.indexTip) < TIP_CROSS_THRESHOLD;

    const poseHeld = bothIndexUp && othersCurled && bothThumbsCurled && tipsClose;

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
        hands.length === 2 && (bothIndexUp || tipsClose)
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
