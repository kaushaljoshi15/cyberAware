"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Characters - strictly binary numerals
    const characters = "01";
    const charsArray = characters.split("");

    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start off-screen
    }

    const draw = () => {
      // Black background with slight opacity to create the fading trail effect
      ctx.fillStyle = "rgba(10, 15, 20, 0.1)"; // Match the dark neutral-950 theme with fade
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";

      for (let i = 0; i < drops.length; i++) {
        const text = charsArray[Math.floor(Math.random() * charsArray.length)];
        
        const x = i * fontSize + (fontSize / 2);
        const y = drops[i] * fontSize;

        // Make the head of the drop brighter
        if (Math.random() > 0.95) {
          ctx.fillStyle = "#34d399"; // emerald-400
        } else {
          ctx.fillStyle = "#059669"; // emerald-600
        }

        ctx.fillText(text, x, y);

        // Reset drop to top randomly when it reaches the bottom
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50); // 20 fps

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      columns = Math.floor(width / fontSize);
      // Re-initialize drops if screen widens
      while (drops.length < columns) {
        drops.push(Math.random() * -100);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80 mix-blend-screen"
      aria-hidden="true"
    />
  );
}
