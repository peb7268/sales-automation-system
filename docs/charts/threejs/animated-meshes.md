# Animated Meshes - Three.js

## Description
Animated meshes in Three.js create dynamic, engaging visualizations through morphing shapes, particle effects, and procedural animations. Perfect for creating memorable data presentations, loading states, and artistic data representations.

## Working Example - Morphing Data Visualization

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// Morphing sphere representing dynamic metrics
function MorphingSphere({
  value,
  maxValue,
  color
}: {
  value: number;
  maxValue: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing based on value
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      const scale = (value / maxValue) * pulse;
      meshRef.current.scale.setScalar(scale);

      // Rotation
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[2, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={hovered ? 0.6 : 0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

// Animated bar chart in 3D
function AnimatedBar({
  position,
  height,
  color,
  delay = 0
}: {
  position: [number, number, number];
  height: number;
  color: string;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentHeight, setCurrentHeight] = useState(0);

  useFrame((state) => {
    if (state.clock.elapsedTime > delay) {
      const targetHeight = height;
      setCurrentHeight(prev =>
        THREE.MathUtils.lerp(prev, targetHeight, 0.05)
      );

      if (meshRef.current) {
        meshRef.current.scale.y = currentHeight;
        meshRef.current.position.y = currentHeight / 2;
      }
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 1, 0.8]}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Box>
    </group>
  );
}

export function AnimatedDashboard() {
  const barData = [
    { height: 3, color: '#FF6B6B' },
    { height: 4.5, color: '#4ECDC4' },
    { height: 2.8, color: '#45B7D1' },
    { height: 5.2, color: '#96CEB4' },
    { height: 3.7, color: '#FFEAA7' }
  ];

  return (
    <div style={{ width: '100%', height: '600px', background: '#0a0a0a' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <fog attach="fog" args={['#0a0a0a', 10, 30]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          intensity={1}
          castShadow
        />

        {/* Animated bars */}
        {barData.map((bar, index) => (
          <AnimatedBar
            key={index}
            position={[(index - 2) * 2, 0, 0]}
            height={bar.height}
            color={bar.color}
            delay={index * 0.2}
          />
        ))}

        {/* Central morphing sphere */}
        <group position={[0, 5, -3]}>
          <MorphingSphere value={75} maxValue={100} color="#8B5CF6" />
        </group>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
```

## Wave Animation with Shader Material

```tsx
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Custom wave shader
const WaveMaterial = shaderMaterial(
  // Uniforms
  { time: 0, color: new THREE.Color(0.2, 0.0, 0.1) },
  // Vertex shader
  `
    uniform float time;
    varying vec2 vUv;
    varying float vZ;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 2.0 + time) * 0.5;
      pos.z += cos(pos.y * 3.0 + time) * 0.3;
      vZ = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 color;
    varying vec2 vUv;
    varying float vZ;
    void main() {
      vec3 finalColor = color + vec3(vZ * 0.2);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ WaveMaterial });

function WavePlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <waveMaterial color="#4ECDC4" />
    </mesh>
  );
}
```

## Particle Flow Animation

```tsx
function ParticleFlow() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Cylindrical distribution
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 3;

      pos[i3] = Math.cos(angle) * radius;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = Math.sin(angle) * radius;

      // Color gradient
      col[i3] = Math.random();
      col[i3 + 1] = Math.random() * 0.5 + 0.5;
      col[i3 + 2] = Math.random() * 0.5 + 0.5;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.1;

      // Update positions for flow effect
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += 0.01;
        if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors sizeAttenuation />
    </points>
  );
}
```

## Key Animation Techniques

| Technique | Description | Use Case |
|-----------|-------------|----------|
| **useFrame** | Animation loop | Continuous animations |
| **MeshDistortMaterial** | Automatic distortion | Organic effects |
| **Shader Materials** | Custom GPU animations | Complex effects |
| **Morph Targets** | Shape interpolation | Smooth transitions |
| **Particle Systems** | Many animated points | Flow visualizations |
| **Spring Physics** | Realistic motion | Natural animations |
| **Lerp/Slerp** | Smooth interpolation | Easing movements |

## Use Cases

- **Live Dashboards**: Real-time data visualization
- **Loading States**: Engaging wait experiences
- **Data Transitions**: Smooth state changes
- **Attention Grabbers**: Highlight important metrics
- **Branding Elements**: Memorable visual identity
- **Interactive Reports**: Engaging data stories
- **Presentation Effects**: Dynamic slide content

## Documentation Links
📚 [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system)
📚 [React Spring Integration](https://docs.pmnd.rs/react-three-fiber/tutorials/using-with-react-spring)
📚 [Shader Materials](https://threejs.org/docs/#api/en/materials/ShaderMaterial)

## Performance Tips
- Use `useMemo` for expensive calculations
- Implement frustum culling for off-screen objects
- Batch geometry updates
- Use instanced rendering for repeated shapes
- Limit particle counts on mobile
- Consider LOD for complex meshes
- Use `dispose()` to clean up resources