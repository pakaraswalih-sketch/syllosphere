import { useRef, MouseEvent } from 'react';

export const useGlassHighlight = () => {
  const containerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!containerRef.current || !highlightRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    highlightRef.current.style.setProperty('--x', `${x}px`);
    highlightRef.current.style.setProperty('--y', `${y}px`);
  };

  const handleMouseEnter = () => {
    if (highlightRef.current) {
      highlightRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (highlightRef.current) {
      highlightRef.current.style.opacity = '0';
    }
  };

  return {
    containerRef,
    highlightRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
};
