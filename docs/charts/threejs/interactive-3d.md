# Interactive 3D Visualizations - Three.js

## Description
Interactive 3D visualizations combine user input with dynamic 3D graphics to create engaging, explorable data experiences. Perfect for complex data exploration, interactive dashboards, and immersive analytics.

## Working Example - Interactive Data Explorer

```tsx
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  Html,
  PivotControls,
  Select,
  Box
} from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Selectable data node
function DataNode({
  position,
  data,
  onSelect,
  isSelected
}: {
  position: [number, number, number];
  data: any;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;

      // Scale on selection
      const targetScale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, 1, 1]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={isSelected ? '#FFD700' : data.color}
          emissive={isSelected ? '#FFD700' : data.color}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
        />
      </Box>

      {/* HTML overlay for selected item */}
      {isSelected && (
        <Html position={[0, 2, 0]} center>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              minWidth: '150px'
            }}
          >
            <h4 style={{ margin: 0 }}>{data.name}</h4>
            <p style={{ margin: '5px 0' }}>Value: {data.value}</p>
            <p style={{ margin: '5px 0' }}>Status: {data.status}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Interactive 3D scatter plot
export function Interactive3DScatter() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState(50);

  // Generate sample data
  const dataPoints = Array(50)
    .fill(0)
    .map((_, i) => ({
      id: i,
      name: `Point ${i + 1}`,
      x: (Math.random() - 0.5) * 10,
      y: Math.random() * 5,
      z: (Math.random() - 0.5) * 10,
      value: Math.random() * 100,
      status: Math.random() > 0.5 ? 'Active' : 'Inactive',
      color: Math.random() > 0.5 ? '#4ECDC4' : '#FF6B6B'
    }));

  const filteredData = dataPoints.filter(d => d.value >= filterValue);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      {/* Control panel */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}
      >
        <label>
          Filter by value: {filterValue}
          <input
            type="range"
            min="0"
            max="100"
            value={filterValue}
            onChange={(e) => setFilterValue(Number(e.target.value))}
            style={{ width: '200px', marginLeft: '10px' }}
          />
        </label>
        <p>Showing {filteredData.length} of {dataPoints.length} points</p>
      </div>

      <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Grid and axes */}
        <gridHelper args={[20, 20]} />
        <axesHelper args={[10]} />

        {/* Data points */}
        {filteredData.map((point) => (
          <DataNode
            key={point.id}
            position={[point.x, point.y, point.z]}
            data={point}
            onSelect={() => setSelectedId(point.id)}
            isSelected={selectedId === point.id}
          />
        ))}

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
```

## Draggable 3D Interface

```tsx
function DraggableChart() {
  const [nodes, setNodes] = useState([
    { id: 1, position: [0, 0, 0], value: 100 },
    { id: 2, position: [3, 0, 0], value: 150 },
    { id: 3, position: [-3, 0, 0], value: 80 }
  ]);

  return (
    <Canvas>
      {nodes.map((node) => (
        <PivotControls
          key={node.id}
          anchor={[0, 0, 0]}
          onDrag={(localMatrix) => {
            const position = new THREE.Vector3();
            localMatrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

            setNodes(prev =>
              prev.map(n =>
                n.id === node.id
                  ? { ...n, position: [position.x, position.y, position.z] }
                  : n
              )
            );
          }}
        >
          <Box args={[1, node.value / 50, 1]}>
            <meshStandardMaterial color="#4ECDC4" />
          </Box>
        </PivotControls>
      ))}
      <OrbitControls />
    </Canvas>
  );
}
```

## Interactive Selection and Filtering

```tsx
function MultiSelectVisualization() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = (id: number, event: ThreeEvent<MouseEvent>) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      // Single select
      setSelected(new Set([id]));
    }
  };

  return (
    <Canvas>
      <Select
        multiple
        box
        onChange={(objects) => {
          const ids = objects.map(obj => obj.userData.id);
          setSelected(new Set(ids));
        }}
      >
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <Box
              key={i}
              userData={{ id: i }}
              position={[
                (i % 5) * 2 - 4,
                Math.floor(i / 5) * 2 - 3,
                0
              ]}
              onClick={(e) => toggleSelection(i, e)}
            >
              <meshStandardMaterial
                color={selected.has(i) ? '#FFD700' : '#4ECDC4'}
                emissive={selected.has(i) ? '#FFD700' : '#000000'}
                emissiveIntensity={selected.has(i) ? 0.3 : 0}
              />
            </Box>
          ))}
      </Select>
      <OrbitControls />
    </Canvas>
  );
}
```

## Key Interactive Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Click Selection** | Select objects | `onClick` event handlers |
| **Hover Effects** | Visual feedback | `onPointerOver/Out` |
| **Drag & Drop** | Move objects | `TransformControls`, `PivotControls` |
| **Multi-Select** | Box/lasso selection | `Select` component |
| **Camera Controls** | Navigate scene | `OrbitControls`, `TrackballControls` |
| **HTML Overlays** | 2D UI in 3D | `Html` component |
| **Raycasting** | Object picking | Built-in Three.js |

## Interaction Patterns

### Mouse Events
- `onClick` - Select/activate
- `onDoubleClick` - Zoom/focus
- `onPointerOver` - Highlight
- `onPointerOut` - Unhighlight
- `onContextMenu` - Context menu
- `onWheel` - Zoom/scroll

### Keyboard Controls
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'Delete': // Delete selected
      case 'Escape': // Deselect all
      case ' ': // Play/pause animation
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Use Cases

- **Data Exploration**: Interactive filtering and selection
- **3D Configurators**: Product customization
- **Network Visualization**: Interactive node graphs
- **Scientific Visualization**: Explore complex datasets
- **Dashboard Controls**: 3D control interfaces
- **Educational Tools**: Interactive learning experiences
- **Design Tools**: 3D manipulation interfaces

## Documentation Links
📚 [React Three Fiber Events](https://docs.pmnd.rs/react-three-fiber/api/events)
📚 [Drei Controls](https://github.com/pmndrs/drei#controls)
📚 [Three.js Raycaster](https://threejs.org/docs/#api/en/core/Raycaster)

## Best Practices
- Provide visual feedback for all interactions
- Use cursor changes to indicate interactive elements
- Implement keyboard shortcuts for power users
- Add tooltips for complex interactions
- Consider touch controls for mobile
- Optimize raycasting for many objects
- Debounce expensive operations
- Test on various devices and browsers