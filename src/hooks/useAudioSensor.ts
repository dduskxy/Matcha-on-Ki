import { useEffect, useState } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';

export function useAudioSensor() {
  const setNoiseLevel = useEnvironmentStore((state) => state.setNoiseLevel);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    let audioContext: AudioContext | null = null;
    let stream: MediaStream | null = null;

    const startAudioSensor = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        let lastUpdate = performance.now();
        const measureVolume = () => {
          const now = performance.now();
          if (now - lastUpdate > 1000) { // Update store every 1 second
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const averageVolume = sum / dataArray.length;
            const volumePercentage = Math.round((averageVolume / 255) * 100);
            setNoiseLevel(volumePercentage);
            lastUpdate = now;
          }
          animationFrameId = requestAnimationFrame(measureVolume);
        };
        measureVolume();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    startAudioSensor();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(console.error);
      }
    };
  }, [setNoiseLevel]);

  return { error };
}
