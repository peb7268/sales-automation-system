"use client"

import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Box, Sphere, Cone, Cylinder, MeshDistortMaterial } from "@react-three/drei"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import * as THREE from "three"

// Animated funnel segment
function FunnelSegment({ 
  position, 
  scale, 
  color, 
  label, 
  value, 
  index 
}: { 
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  label: string
  value: number
  index: number
}) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05
    }
  })

  return (
    <group position={position}>
      <Cylinder
        ref={meshRef}
        args={[scale[0], scale[0] * 0.7, scale[1], 16]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Cylinder>
      <Text
        position={[0, 0, scale[0] + 0.5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.4, scale[0] + 0.5]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {value} prospects
      </Text>
    </group>
  )
}

// Animated data points
function DataPoint({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <Sphere ref={meshRef} position={position} args={[0.1, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  )
}

// Main 3D pipeline visualization
export function Pipeline3D() {
  const { prospects } = usePipelineStore()
  
  const stages = [
    { name: 'Cold', count: prospects.filter(p => p.temperature === 'cold').length, color: '#64748b' },
    { name: 'Warm', count: prospects.filter(p => p.temperature === 'warm').length, color: '#f59e0b' },
    { name: 'Hot', count: prospects.filter(p => p.temperature === 'hot').length, color: '#ef4444' },
    { name: 'Meeting', count: prospects.filter(p => p.pipelineStage === 'meeting').length, color: '#10b981' },
    { name: 'Closed', count: prospects.filter(p => p.pipelineStage === 'closed').length, color: '#3b82f6' },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>3D Pipeline Visualization</CardTitle>
        <CardDescription>Interactive funnel view with real-time animations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
            
            {/* Funnel segments */}
            {stages.map((stage, index) => (
              <FunnelSegment
                key={stage.name}
                position={[0, 2 - index * 1, 0]}
                scale={[2 - index * 0.3, 0.8, 1]}
                color={stage.color}
                label={stage.name}
                value={stage.count}
                index={index}
              />
            ))}

            {/* Floating data points */}
            {Array.from({ length: 20 }, (_, i) => (
              <DataPoint
                key={i}
                position={[
                  (Math.random() - 0.5) * 6,
                  (Math.random() - 0.5) * 6,
                  (Math.random() - 0.5) * 2
                ]}
                color={stages[Math.floor(Math.random() * stages.length)].color}
              />
            ))}
            
            {/* Grid helper */}
            <gridHelper args={[10, 10, 0x444444, 0x222222]} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  )
}

// 3D scatter plot for prospect clustering
function ProspectNode({ position, color, size, data }: any) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = React.useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      if (hovered) {
        meshRef.current.scale.setScalar(size * 1.5)
      } else {
        meshRef.current.scale.setScalar(size)
      }
    }
  })

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.2, 0.2, 0.2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.3}
          radius={1}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
        />
      </Box>
      {hovered && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data.name}
        </Text>
      )}
    </group>
  )
}

export function ProspectClustering3D() {
  const { prospects } = usePipelineStore()
  
  // Create clusters based on qualification score and temperature
  const nodes = prospects.slice(0, 50).map(prospect => ({
    id: prospect.id,
    name: prospect.businessName,
    x: (prospect.qualificationScore / 100) * 4 - 2,
    y: prospect.temperature === 'hot' ? 2 : prospect.temperature === 'warm' ? 0 : -2,
    z: (Math.random() - 0.5) * 4,
    color: prospect.temperature === 'hot' ? '#ef4444' : 
           prospect.temperature === 'warm' ? '#f59e0b' : '#64748b',
    size: 0.5 + (prospect.qualificationScore / 100) * 0.5
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Prospect Clustering Analysis</CardTitle>
        <CardDescription>3D visualization of prospect distribution by score and temperature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <Canvas camera={{ position: [5, 3, 5], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            <OrbitControls enablePan={true} />
            
            {nodes.map(node => (
              <ProspectNode
                key={node.id}
                position={[node.x, node.y, node.z]}
                color={node.color}
                size={node.size}
                data={node}
              />
            ))}

            {/* Axis labels */}
            <Text position={[0, -3, 0]} fontSize={0.3} color="#888">
              Qualification Score →
            </Text>
            <Text position={[-3, 0, 0]} fontSize={0.3} color="#888" rotation={[0, Math.PI / 2, 0]}>
              Temperature ↑
            </Text>
            
            {/* Reference planes */}
            <mesh position={[0, 0, -3]} rotation={[0, 0, 0]}>
              <planeGeometry args={[8, 8]} />
              <meshBasicMaterial color="#1a1a1a" opacity={0.3} transparent />
            </mesh>
          </Canvas>
        </div>
      </CardContent>
    </Card>
  )
}