import { useEffect, useRef, useState } from "react";

interface UsePlaybackClockOptions {
  resetToken: string | number;
  height?: number;
  minWidth?: number;
}

export function usePlaybackClock({
  resetToken,
  height = 520,
  minWidth = 420,
}: UsePlaybackClockOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const [size, setSize] = useState({ width: 720, height });
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setSize({
        width: Math.max(minWidth, Math.round(entry.contentRect.width)),
        height,
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [height, minWidth]);

  useEffect(() => {
    setAnimationTime(0);
    lastTickRef.current = null;
  }, [resetToken]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTickRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const lastTick = lastTickRef.current ?? timestamp;
      const delta = timestamp - lastTick;
      lastTickRef.current = timestamp;

      setAnimationTime((current) => current + delta);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return {
    animationTime,
    canvasRef,
    containerRef,
    isPlaying,
    setIsPlaying,
    size,
  };
}
