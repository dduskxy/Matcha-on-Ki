import { useEffect } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';

export function useLightSensor(videoElement: HTMLVideoElement | null) {
  const setLightLevel = useEnvironmentStore((state) => state.setLightLevel);

  useEffect(() => {
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzeBrightness = () => {
      if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA || videoElement.videoWidth === 0) {
        return;
      }
      try {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let sum = 0;
        const numPixels = canvas.width * canvas.height;
        for (let i = 0; i < data.length; i += 4) {
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = sum / numPixels; 
        const percentage = (avgBrightness / 255) * 100;
        setLightLevel(Math.round(percentage));
      } catch (error) {
        console.error('Error analyzing video brightness:', error);
      }
    };

    const intervalId = setInterval(analyzeBrightness, 2000);
    return () => clearInterval(intervalId);
  }, [videoElement, setLightLevel]);
}
