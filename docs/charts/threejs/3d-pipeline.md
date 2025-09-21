# 3D Pipeline Funnel - Three.js

## Description
3D pipeline visualizations use Three.js with React Three Fiber to create interactive, animated sales funnels in 3D space. Perfect for engaging dashboards, presentations, and providing intuitive visual representations of conversion processes.

## Working Example

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Cylinder, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// Animated funnel segment component
function FunnelSegment({
  position,
  scale,
  color,
  label,
  value,
  index
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  label: string;
  value: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      // Scale on hover
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
    }
  });

  return (
    <group position={position}>
      <Cylinder
        ref={meshRef}
        args={[scale[0], scale[0] * 0.7, scale[1], 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </Cylinder>

      {/* Label */}
      <Text
        position={[0, 0, scale[0] + 0.5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Value */}
      <Text
        position={[0, -0.4, scale[0] + 0.5]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}

export function Pipeline3DFunnel() {
  const funnelData = [
    { label: 'Prospects', value: 1000, color: '#8884d8' },
    { label: 'Qualified', value: 650, color: '#83a6ed' },
    { label: 'Proposals', value: 420, color: '#8dd1e1' },
    { label: 'Negotiation', value: 230, color: '#82ca9d' },
    { label: 'Closed Won', value: 87, color: '#a4de6c' }
  ];

  return (
    <div style={{ width: '100%', height: '600px', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* Funnel segments */}
        {funnelData.map((segment, index) => {
          const scale = (segment.value / funnelData[0].value) * 2;
          const yPosition = -index * 1.5;

          return (
            <FunnelSegment
              key={segment.label}
              position={[0, yPosition, 0]}
              scale={[scale, 0.8, scale]}
              color={segment.color}
              label={segment.label}
              value={segment.value}
              index={index}
            />
          );
        })}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
```

## Advanced Pipeline with Particles

```tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function ParticleFlow() {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(5000), { radius: 1.5 })
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#5786F5"
        size={0.002}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export function AdvancedPipeline3D() {
  return (
    <Canvas>
      <ParticleFlow />
      {/* Add your pipeline components here */}
    </Canvas>
  );
}
```

## Key Components

| Component | Description | Props |
|-----------|-------------|-------|
| `Canvas` | Three.js scene container | `camera`, `gl`, `shadows` |
| `OrbitControls` | Camera controls | `enableZoom`, `autoRotate` |
| `Mesh` | 3D object | `position`, `rotation`, `scale` |
| `Box/Sphere/Cylinder` | Geometry helpers | `args` for dimensions |
| `Text` | 3D text | `fontSize`, `color`, `anchorX/Y` |
| `MeshDistortMaterial` | Animated material | `distort`, `speed` |
| `Points` | Particle system | `positions`, `stride` |

## Use Cases

- **Sales Funnels**: Interactive conversion visualization
- **Process Flows**: Multi-stage business processes
- **Data Sculptures**: Artistic data representation
- **Dashboard Widgets**: Engaging KPI displays
- **Presentations**: Memorable data storytelling
- **Product Demos**: Interactive feature showcases
- **Network Visualizations**: 3D relationship mapping

## Documentation Links
📚 [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
📚 [Three.js Documentation](https://threejs.org/docs/)
📚 [Drei Helper Library](https://github.com/pmndrs/drei)

## Tips
- Use `useFrame` for smooth animations
- Implement hover states for interactivity
- Add `OrbitControls` for user navigation
- Optimize with `frustumCulled` and LOD
- Use `emissive` materials for glow effects
- Consider performance with particle counts
- Test on various devices for compatibility