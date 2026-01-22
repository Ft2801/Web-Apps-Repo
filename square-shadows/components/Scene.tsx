import React, { useRef, useEffect } from 'react';
import { SceneSettings } from '../App';

interface Point {
  x: number;
  y: number;
}

interface Square {
  x: number;
  y: number;
  size: number;
  color: string;
  baseSpeed: number;
  angle: number;
  baseRotationSpeed: number;
}

interface SceneProps {
  settings: SceneSettings;
}

// Utility: Cross product of vectors OA and OB
const cross = (o: Point, a: Point, b: Point) => {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

// Monotone Chain Convex Hull Algorithm
const getConvexHull = (points: Point[]): Point[] => {
  const n = points.length;
  if (n <= 2) return points;

  points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

  const lower: Point[] = [];
  for (let i = 0; i < n; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
      lower.pop();
    }
    lower.push(points[i]);
  }

  const upper: Point[] = [];
  for (let i = n - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
      upper.pop();
    }
    upper.push(points[i]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

const COLORS = [
  '#F472B6', // Pink 400
  '#FBBF24', // Amber 400
  '#34D399', // Emerald 400
  '#60A5FA', // Blue 400
  '#A78BFA', // Violet 400
  '#FB7185', // Rose 400
];

const createSquare = (width: number, height: number): Square => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: 5 + Math.random() * 15,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  // Previous: 0.25 + random*0.06.
  // New (50% faster): 0.375 + random*0.09.
  baseSpeed: 0.375 + Math.random() * 0.09,
  angle: Math.random() * Math.PI * 2,
  baseRotationSpeed: (Math.random() - 0.5) * 0.02
});

export const Scene: React.FC<SceneProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const squaresRef = useRef<Square[]>([]); // Use ref to manage squares across renders
  const settingsRef = useRef(settings);

  // Update ref when settings change (for loop access)
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Handle Square Count Changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentCount = squaresRef.current.length;
    const targetCount = settings.numSquares;
    
    // Add squares
    if (currentCount < targetCount) {
      for (let i = currentCount; i < targetCount; i++) {
        // When adding dynamically, we can spawn them anywhere on screen to feel instant
        const sq = createSquare(canvas.width, canvas.height);
        squaresRef.current.push(sq);
      }
    } 
    // Remove squares
    else if (currentCount > targetCount) {
      squaresRef.current = squaresRef.current.slice(0, targetCount);
    }
  }, [settings.numSquares]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-initialize squares on full resize
      squaresRef.current = [];
      const targetCount = settingsRef.current.numSquares;
      for (let i = 0; i < targetCount; i++) {
         squaresRef.current.push(createSquare(canvas.width, canvas.height));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const { moveSpeed, rotSpeed, shadowIntensity, directionAngle } = settingsRef.current;
      
      const maxDist = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      
      // Calculate global direction vector based on angle (degrees -> radians)
      const rad = directionAngle * (Math.PI / 180);
      const vx = Math.cos(rad);
      const vy = Math.sin(rad);

      const margin = 50;

      // We iterate over the live ref array
      squaresRef.current.forEach(sq => {
        // 1. Update Physics
        const currentSpeed = sq.baseSpeed * moveSpeed;
        const currentRotSpeed = sq.baseRotationSpeed * rotSpeed;

        sq.x += currentSpeed * vx;
        sq.y += currentSpeed * vy; 
        sq.angle += currentRotSpeed;

        // Wrap around logic (Pac-man style) for continuous flow
        if (sq.x > canvas.width + margin) {
            sq.x = -margin;
            // Randomize perpendicular axis slightly to avoid looping tracks
            sq.y = Math.random() * canvas.height; 
        } else if (sq.x < -margin) {
            sq.x = canvas.width + margin;
            sq.y = Math.random() * canvas.height; 
        }

        if (sq.y > canvas.height + margin) {
            sq.y = -margin;
            sq.x = Math.random() * canvas.width;
        } else if (sq.y < -margin) {
            sq.y = canvas.height + margin;
            sq.x = Math.random() * canvas.width;
        }

        // 2. Calculate Geometry
        const halfSize = sq.size / 2;
        const corners: Point[] = [
          { x: -halfSize, y: -halfSize },
          { x: halfSize, y: -halfSize },
          { x: halfSize, y: halfSize },
          { x: -halfSize, y: halfSize }
        ].map(p => {
          const rotX = p.x * Math.cos(sq.angle) - p.y * Math.sin(sq.angle);
          const rotY = p.x * Math.sin(sq.angle) + p.y * Math.cos(sq.angle);
          return { x: rotX + sq.x, y: rotY + sq.y };
        });

        // 3. Calculate Shadow Logic
        const allPoints: Point[] = [...corners];
        
        corners.forEach(corner => {
            const dx = corner.x - mx;
            const dy = corner.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const scale = (maxDist * 2) / (dist || 1); 
            
            allPoints.push({
                x: corner.x + dx * scale,
                y: corner.y + dy * scale
            });
        });

        const hull = getConvexHull(allPoints);

        // 4. Draw Shadow
        ctx.beginPath();
        if (hull.length > 0) {
            ctx.moveTo(hull[0].x, hull[0].y);
            for (let i = 1; i < hull.length; i++) {
                ctx.lineTo(hull[i].x, hull[i].y);
            }
            ctx.closePath();
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity})`;
        ctx.fill();

        // 5. Draw Square
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = sq.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial setup
    handleResize(); 
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); 

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};