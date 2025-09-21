# 3D Clustering Visualization - Three.js

## Description
3D clustering visualizations display data points in three-dimensional space, showing natural groupings, outliers, and relationships. Perfect for customer segmentation, anomaly detection, and multi-dimensional data analysis.

## Working Example

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

// Individual data point component
function DataPoint({
  position,
  color,
  size,
  label,
  cluster
}: {
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
  cluster: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.setScalar(1.2);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.5}
          metalness={0.5}
        />
      </Sphere>
      {hovered && (
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Cluster center indicator
function ClusterCenter({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

export function ProspectClustering3D() {
  // Generate clustered prospect data
  const { dataPoints, clusterCenters } = useMemo(() => {
    const clusters = [
      { center: [2, 2, 2], color: '#FF6B6B', name: 'High Value' },
      { center: [-2, 1, -1], color: '#4ECDC4', name: 'Growth Potential' },
      { center: [1, -2, 1], color: '#45B7D1', name: 'Quick Wins' },
      { center: [-1, -1, -2], color: '#96CEB4', name: 'Long Term' }
    ];

    const points = [];
    clusters.forEach((cluster, clusterIdx) => {
      // Generate points around cluster center
      for (let i = 0; i < 25; i++) {
        const variance = 1.5;
        points.push({
          position: [
            cluster.center[0] + (Math.random() - 0.5) * variance,
            cluster.center[1] + (Math.random() - 0.5) * variance,
            cluster.center[2] + (Math.random() - 0.5) * variance
          ] as [number, number, number],
          color: cluster.color,
          size: 0.05 + Math.random() * 0.1,
          label: `Prospect ${clusterIdx * 25 + i + 1}`,
          cluster: clusterIdx,
          value: Math.random() * 100000
        });
      }
    });

    return { dataPoints: points, clusterCenters: clusters };
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', background: 'linear-gradient(180deg, #1a1a2e, #0f0f1e)' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />

        {/* Grid helper */}
        <gridHelper args={[20, 20, '#444444', '#222222']} />

        {/* Axes helper */}
        <axesHelper args={[5]} />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <DataPoint
            key={index}
            position={point.position}
            color={point.color}
            size={point.size}
            label={point.label}
            cluster={point.cluster}
          />
        ))}

        {/* Cluster centers */}
        {clusterCenters.map((cluster, index) => (
          <ClusterCenter
            key={index}
            position={cluster.center}
            color={cluster.color}
          />
        ))}

        {/* Cluster labels */}
        {clusterCenters.map((cluster, index) => (
          <Text
            key={`label-${index}`}
            position={[cluster.center[0], cluster.center[1] + 1, cluster.center[2]]}
            fontSize={0.3}
            color={cluster.color}
            anchorX="center"
          >
            {cluster.name}
          </Text>
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}

// Interactive clustering with connections
export function NetworkClustering3D() {
  const nodes = useMemo(() => {
    // Generate network nodes
    return Array(30).fill(0).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ] as [number, number, number],
      connections: Array(Math.floor(Math.random() * 3))
        .fill(0)
        .map(() => Math.floor(Math.random() * 30))
        .filter(id => id !== i)
    }));
  }, []);

  return (
    <Canvas>
      {/* Connections */}
      {nodes.map((node, i) =>
        node.connections.map((targetId, j) => {
          const target = nodes[targetId];
          if (!target) return null;
          return (
            <Line
              key={`${i}-${j}`}
              points={[node.position, target.position]}
              color="#666666"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          );
        })
      )}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <Sphere key={i} position={node.position} args={[0.2, 16, 16]}>
          <meshStandardMaterial color="#4ECDC4" />
        </Sphere>
      ))}

      <OrbitControls />
    </Canvas>
  );
}
```

## Key Concepts

| Concept | Description | Implementation |
|---------|-------------|----------------|
| **Data Mapping** | Convert data to 3D positions | Scale and normalize coordinates |
| **Clustering** | Group similar points | Distance calculations, color coding |
| **Interactivity** | User engagement | Hover effects, click handlers |
| **Performance** | Optimize for many points | Instanced meshes, LOD |
| **Navigation** | Camera controls | OrbitControls, zoom limits |
| **Visual Hierarchy** | Emphasize importance | Size, color, glow effects |

## Use Cases

- **Customer Segmentation**: Visualize customer groups by behavior
- **Anomaly Detection**: Identify outliers in 3D space
- **Portfolio Analysis**: Multi-dimensional investment comparison
- **Quality Control**: Defect clustering analysis
- **Market Research**: Consumer preference mapping
- **Network Analysis**: Relationship and influence visualization
- **Risk Assessment**: Multi-factor risk clustering

## Documentation Links
📚 [Three.js Points](https://threejs.org/docs/#api/en/objects/Points)
📚 [Instanced Meshes](https://threejs.org/docs/#api/en/objects/InstancedMesh)
📚 [React Three Fiber Performance](https://docs.pmnd.rs/react-three-fiber/advanced/performance)

## Tips
- Use instanced meshes for better performance with many points
- Implement LOD (Level of Detail) for large datasets
- Add fog for depth perception
- Use color gradients to show additional dimensions
- Consider using `InstancedMesh` for >100 points
- Add labels selectively to avoid clutter
- Implement filtering/highlighting for analysis