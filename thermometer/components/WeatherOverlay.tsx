import React, { useRef, useEffect } from 'react';

interface WeatherOverlayProps {
  temp: number;
}

// Particle types and interfaces
interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  wobble?: number;
  wobbleSpeed?: number;
  opacity?: number;
  life?: number; // For fire
  maxLife?: number; // For fire
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ temp }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempRef = useRef(temp); 

  // Keep tempRef synced
  useEffect(() => {
    tempRef.current = temp;
  }, [temp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Handle Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // --- Particle Systems Initialization ---

    // Snow Particles
    const snowParticles: Particle[] = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 1 + 0.5,
      size: Math.random() * 3 + 1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Rain Particles
    const rainParticles: Particle[] = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 15 + 20, // Fast
      size: Math.random() * 15 + 10, // Length
    }));

    // Fire Particles
    const createFireParticle = (reset: boolean = false): Particle => ({
      x: Math.random() * width,
      y: reset ? height + 20 : Math.random() * height, // Initially spread everywhere
      speed: Math.random() * 3 + 2,
      size: Math.random() * 10 + 5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.05 + 0.02,
      life: Math.random() * 100,
      maxLife: 100,
    });
    const fireParticles: Particle[] = Array.from({ length: 200 }).map(() => createFireParticle());

    // --- Helper for Opacity ---
    const getOpacity = (t: number, range: [number, number, number, number]) => {
      const [start, peakStart, peakEnd, end] = range;
      if (t < start || t > end) return 0;
      if (t >= peakStart && t <= peakEnd) return 1;
      if (t < peakStart) return (t - start) / (peakStart - start);
      if (t > peakEnd) return 1 - (t - peakEnd) / (end - peakEnd);
      return 0;
    };

    // --- Render Loop ---
    const render = () => {
      const currentTemp = tempRef.current;
      
      // Calculate opacities based on current temp
      // Snow: Full visibility until -10, then fades out over 12 degrees (ends at 2).
      // Extending to 2 allows a slight overlap with rain (which starts at 1), creating a "sleet" effect.
      const snowOp = getOpacity(currentTemp, [-100, -100, -10, 2]);
      
      // Rain: Visible between 1 and 15 degrees with smooth fade
      // Fade in: 1° to 5° | Fully visible: 5° to 11° | Fade out: 11° to 15°
      const rainOp = getOpacity(currentTemp, [1, 5, 11, 15]);
      
      const sunOp = getOpacity(currentTemp, [20, 28, 150, 200]);
      const fireOp = getOpacity(currentTemp, [35, 50, 150, 200]);

      ctx.clearRect(0, 0, width, height);

      // --- PHYSICS UPDATE (Always runs) ---
      // This ensures particles are always moving/distributed correctly 
      // even when invisible, so they don't "start from scratch" on transition.

      // Update Snow Physics
      for (const p of snowParticles) {
        p.y += p.speed;
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0);
        p.x += Math.sin(p.wobble) * 0.5;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
      }

      // Update Rain Physics
      for (const p of rainParticles) {
        p.y += p.speed;
        if (p.y > height) {
          p.y = -50;
          p.x = Math.random() * width;
        }
      }

      // Update Fire Physics
      for (const p of fireParticles) {
        p.life = (p.life || 0) - 1;
        p.y -= p.speed;
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0);
        p.x += Math.sin(p.wobble) * 1;
        p.size *= 0.98;

        if ((p.life || 0) <= 0 || p.size < 0.5) {
          Object.assign(p, createFireParticle(true));
        }
      }


      // --- DRAWING (Only if visible) ---

      // 1. Draw Snow
      if (snowOp > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${snowOp})`;
        ctx.beginPath();
        for (const p of snowParticles) {
          // Optimization: Check boundaries before drawing
          if (p.x > -20 && p.x < width + 20 && p.y > -20 && p.y < height + 20) {
             ctx.moveTo(p.x, p.y);
             ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      // 2. Draw Rain
      if (rainOp > 0) {
        ctx.strokeStyle = `rgba(173, 216, 230, ${rainOp * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const p of rainParticles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.size);
        }
        ctx.stroke();
      }

      // 3. Draw Fire
      if (fireOp > 0) {
        ctx.globalCompositeOperation = 'lighter';
        
        for (const p of fireParticles) {
          const alpha = (p.life! / p.maxLife!) * fireOp;
          if (alpha > 0.01) {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            // ORANGE/GOLD Color Scheme
            // Center: Bright Gold/Yellow | Outer: Orange/Dark Orange | End: Transparent
            gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`); 
            gradient.addColorStop(0.4, `rgba(255, 120, 0, ${alpha * 0.8})`); 
            gradient.addColorStop(1, 'rgba(255, 60, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      // 4. Sun/Heat Haze
      if (sunOp > 0) {
         const sunGrad = ctx.createRadialGradient(width, 0, 0, width, 0, 600);
         sunGrad.addColorStop(0, `rgba(255, 200, 0, ${sunOp * 0.4})`);
         sunGrad.addColorStop(1, 'rgba(255, 200, 0, 0)');
         ctx.fillStyle = sunGrad;
         ctx.fillRect(0, 0, width, height);
      }
      
      // 5. Fire Vignette
      if (fireOp > 0) {
          const fireVignette = ctx.createRadialGradient(width/2, height, 0, width/2, height, height * 0.8);
          // Keep vignette reddish for the heat atmosphere, but less intense red
          fireVignette.addColorStop(0, `rgba(255, 80, 0, ${fireOp * 0.3})`);
          fireVignette.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = fireVignette;
          ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
};

export default WeatherOverlay;