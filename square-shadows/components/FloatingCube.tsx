import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { CubeProps } from '../types';

// Add type definitions for React Three Fiber elements to fix JSX errors
// Extending 'react' module JSX to ensure compatibility with newer React types
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

// Extending global JSX for other environments
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

export const FloatingCube: React.FC<CubeProps> = ({ position, rotation, scale, color, speed }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Random offset for independent movement
  const offset = useRef(Math.random() * 100);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Rotate the cube continuously
    meshRef.current.rotation.x += delta * speed * 0.5;
    meshRef.current.rotation.y += delta * speed;

    // Float up and down using a sine wave
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed + offset.current) * 0.5;
    
    // Slight scale pulse on hover (if we were using raycasting, but works nicely with proximity logic too)
    const targetScale = hovered ? scale * 1.1 : scale;
    meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale } as any, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={hovered ? '#fbbf24' : color} // Amber-400 on hover, else prop color
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
};