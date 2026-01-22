import React, { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { PhysicsSettings, ShapeType, GeneratorSettings } from '../types';
import { COLORS } from '../constants';

interface PhysicsCanvasProps {
  settings: PhysicsSettings;
  generatorSettings: GeneratorSettings;
  selectedShape: ShapeType;
  onClearTrigger: number;
}

const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({ 
  settings, 
  generatorSettings, 
  selectedShape, 
  onClearTrigger 
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);

  // Refs for current values
  const selectedShapeRef = useRef(selectedShape);
  const settingsRef = useRef(settings);
  const generatorSettingsRef = useRef(generatorSettings);

  useEffect(() => { selectedShapeRef.current = selectedShape; }, [selectedShape]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { generatorSettingsRef.current = generatorSettings; }, [generatorSettings]);

  // Wall management - defined as callback to be used in initialization and updates
  const updateWalls = useCallback(() => {
    if (!engineRef.current) return;
    const world = engineRef.current.world;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallThickness = 100; 
    const buffer = wallThickness / 2; 

    // Remove existing walls
    if (wallsRef.current.length > 0) {
      Matter.Composite.remove(world, wallsRef.current);
      wallsRef.current = [];
    }

    // Only add walls if enabled
    if (settingsRef.current.showWalls) {
      const wallOptions = { 
        isStatic: true,
        friction: settingsRef.current.friction,
        restitution: 0.5, // Walls need some restitution to not absorb all energy immediately
        render: {
          fillStyle: COLORS.grid,
          strokeStyle: COLORS.cyan,
          lineWidth: 2,
          opacity: 0.8
        }
      };

      const walls = [
        // Top (placed just off-screen)
        Matter.Bodies.rectangle(width / 2, -buffer, width + wallThickness * 2, wallThickness, wallOptions),
        // Bottom
        Matter.Bodies.rectangle(width / 2, height + buffer, width + wallThickness * 2, wallThickness, wallOptions),
        // Right
        Matter.Bodies.rectangle(width + buffer, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
        // Left
        Matter.Bodies.rectangle(-buffer, height / 2, wallThickness, height + wallThickness * 2, wallOptions)
      ];

      wallsRef.current = walls;
      Matter.Composite.add(world, walls);
    }
  }, []);

  // Update Physics Parameters dynamically
  useEffect(() => {
    if (engineRef.current) {
      const world = engineRef.current.world;
      engineRef.current.gravity.y = settings.gravity;
      
      const bodies = Matter.Composite.allBodies(world);
      bodies.forEach(body => {
        if (!body.isStatic) {
          body.friction = settings.friction;
          body.frictionAir = settings.frictionAir;
          body.restitution = settings.restitution;
        } else if (body.label !== 'Mouse Constraint') {
           body.friction = settings.friction;
        }
      });
      updateWalls();
    }
  }, [settings, updateWalls]);

  // Handle Clear
  useEffect(() => {
    if (onClearTrigger > 0 && engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const bodiesToRemove = bodies.filter(b => !b.isStatic && b.label !== 'Mouse Constraint');
      Matter.Composite.remove(engineRef.current.world, bodiesToRemove);
    }
  }, [onClearTrigger]);

  // Initialization
  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          Composite = Matter.Composite,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.gravity.y = settingsRef.current.gravity;

    // Create renderer
    // CRITICAL FIX: Removed pixelRatio option to prevent coordinate drift.
    // Matter.js defaults to 1:1 mapping which ensures clicks are accurate.
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false,
        // pixelRatio: 1 // Implicit default, explicit omission is safer for some versions
      }
    });
    renderRef.current = render;

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    // Initial Walls
    updateWalls();

    // Mouse
    const mouse = Mouse.create(render.canvas);
    
    // Mouse Constraint
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
          strokeStyle: 'rgba(255, 255, 255, 0.5)',
          lineWidth: 2,
          type: 'line' 
        } as any
      }
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Spawn Event
    Events.on(mouseConstraint, 'mousedown', (event) => {
      // Check if we are interacting with an existing body
      if (!mouseConstraint.body) {
        // Use the mouse position directly from the constraint's mouse instance
        // This is synchronized with the engine's coordinate system
        spawnShape(mouse.position.x, mouse.position.y);
      }
    });

    // Resize Handler
    const handleResize = () => {
      if (!render.canvas || !renderRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;

      render.canvas.width = width;
      render.canvas.height = height;
      
      // Force bounds update to match new dimensions
      render.options.width = width;
      render.options.height = height;
      render.bounds.max.x = width;
      render.bounds.max.y = height;

      updateWalls();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const spawnShape = (x: number, y: number) => {
    if (!engineRef.current) return;
    
    const shape = selectedShapeRef.current;
    const physSettings = settingsRef.current;
    const genSettings = generatorSettingsRef.current;
    
    const size = genSettings.size;
    const angleRad = (genSettings.angle * Math.PI) / 180;

    const options: Matter.IBodyDefinition = {
      restitution: physSettings.restitution,
      friction: physSettings.friction,
      frictionAir: physSettings.frictionAir,
      angle: angleRad,
      render: {
        fillStyle: 'rgba(6, 182, 212, 0.2)', // Cyan transparent
        strokeStyle: COLORS.cyan,
        lineWidth: 2
      }
    };

    let body: Matter.Body;

    switch (shape) {
      case ShapeType.CIRCLE:
        body = Matter.Bodies.circle(x, y, size / 2, options);
        break;
      case ShapeType.RECTANGLE:
        body = Matter.Bodies.rectangle(x, y, size, size, options);
        break;
      case ShapeType.TRIANGLE:
        body = Matter.Bodies.polygon(x, y, 3, size / 1.5, options);
        break;
      case ShapeType.PENTAGON:
        body = Matter.Bodies.polygon(x, y, 5, size / 1.5, options);
        break;
      default:
        body = Matter.Bodies.circle(x, y, size / 2, options);
    }

    Matter.Composite.add(engineRef.current.world, body);
  };

  return (
    <div ref={sceneRef} className="w-full h-full absolute inset-0 z-0 cursor-crosshair" />
  );
};

export default PhysicsCanvas;