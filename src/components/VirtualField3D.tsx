import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FieldProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  humidity: number;
  todayRainfall: number;
  totalRainfall: number;
  selectedCrop?: string;
  currentWeek?: number;
}

// Simple stylized plant - like the screenshot shows
const SimplePlant = ({ 
  position, 
  plantId,
  growth 
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle sway
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + plantId * 0.5) * 0.02;
    }
  });

  const plantHeight = 0.3 + growth * 0.4;
  const leafSize = 0.08 + growth * 0.06;

  return (
    <group ref={groupRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, plantHeight / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.025, plantHeight, 6]} />
        <meshStandardMaterial color="#4a7c34" />
      </mesh>
      
      {/* Top foliage - cone shape like in screenshot */}
      <mesh position={[0, plantHeight + leafSize * 0.8, 0]}>
        <coneGeometry args={[leafSize * 1.2, leafSize * 2, 6]} />
        <meshStandardMaterial color="#5cb85c" />
      </mesh>
      
      {/* Middle leaves */}
      <mesh position={[0, plantHeight * 0.7, 0]}>
        <coneGeometry args={[leafSize * 0.9, leafSize * 1.5, 6]} />
        <meshStandardMaterial color="#6bc46b" />
      </mesh>
      
      {/* Lower leaves */}
      <mesh position={[0, plantHeight * 0.4, 0]}>
        <coneGeometry args={[leafSize * 0.7, leafSize * 1.2, 6]} />
        <meshStandardMaterial color="#7ed07e" />
      </mesh>
    </group>
  );
};

// Flat soil field
const SoilField = () => {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial 
        color="#5d4037"
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
};

// Sensor pole component - matches the screenshot
const SensorPole = ({ position, label, value }: { position: [number, number, number]; label: string; value: string }) => {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Sensor box */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <meshStandardMaterial color="#2196f3" emissive="#2196f3" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Value label */}
      <Text
        position={[0, 1.15, 0]}
        fontSize={0.1}
        color="#4caf50"
        anchorX="center"
      >
        {value}
      </Text>
    </group>
  );
};

// Calculate growth factor based on environmental conditions
const calculateGrowthFactor = (moisture: number, temperature: number, plantId: number): number => {
  const baseGrowth = Math.min(1, Math.max(0.3, (moisture / 100) * (temperature / 22)));
  const variation = 0.85 + Math.sin(plantId * 0.7) * 0.15;
  return baseGrowth * variation;
};

const Scene = ({ moisture, temperature }: FieldProps) => {
  const plantHealth = useMemo(() => {
    let health = 100;
    if (moisture < 30) health -= (30 - moisture);
    if (moisture > 70) health -= (moisture - 70) * 0.5;
    if (temperature < 20) health -= (20 - temperature) * 2;
    if (temperature > 35) health -= (temperature - 35) * 3;
    return Math.max(0, Math.min(100, health));
  }, [moisture, temperature]);

  // Generate a grid of plants - 5x5 layout like in screenshot
  const plants = useMemo(() => {
    const plantList = [];
    const gridSize = 5;
    const spacing = 1.4;
    const startX = -((gridSize - 1) * spacing) / 2;
    const startZ = -((gridSize - 1) * spacing) / 2;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const plantId = row * gridSize + col;
        const growth = calculateGrowthFactor(moisture, temperature, plantId);
        
        plantList.push({
          position: [startX + col * spacing, 0, startZ + row * spacing] as [number, number, number],
          plantId,
          growth,
        });
      }
    }
    return plantList;
  }, [moisture, temperature]);

  return (
    <>
      {/* Simple lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.8}
        castShadow
      />

      {/* Soil field */}
      <SoilField />
      
      {/* Plants grid */}
      {plants.map((plant, index) => (
        <SimplePlant
          key={index}
          position={plant.position}
          plantId={plant.plantId}
          growth={plant.growth}
        />
      ))}
      
      {/* Field Health label floating above */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="#2e7d32"
        anchorX="center"
        fontWeight="bold"
      >
        {`Field Health: ${Math.round(plantHealth)}%`}
      </Text>
      
      {/* Sensor poles at corners */}
      <SensorPole position={[-4.5, 0, -4.5]} label="Temp" value="T" />
      <SensorPole position={[4.5, 0, -4.5]} label="Moisture" value="M" />
      <SensorPole position={[-4.5, 0, 4.5]} label="pH" value="pH" />
      <SensorPole position={[4.5, 0, 4.5]} label="Humidity" value="H" />
      
      <OrbitControls 
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
};

interface VirtualField3DProps {
  moisture?: number;
  temperature?: number;
  soilPh?: number;
  lightIntensity?: number;
  humidity?: number;
  todayRainfall?: number;
  totalRainfall?: number;
  selectedCrop?: string;
  currentWeek?: number;
}

const VirtualField3D = ({
  moisture = 50,
  temperature = 25,
  soilPh = 6.5,
  lightIntensity = 70,
  humidity = 55,
  todayRainfall = 0,
  totalRainfall = 0,
  selectedCrop = 'tomato',
  currentWeek = 1,
}: VirtualField3DProps) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border bg-muted/30">
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(to bottom, #cfd8dc, #b0bec5)' }}
      >
        <Scene
          moisture={moisture}
          temperature={temperature}
          soilPh={soilPh}
          lightIntensity={lightIntensity}
          humidity={humidity}
          todayRainfall={todayRainfall}
          totalRainfall={totalRainfall}
          selectedCrop={selectedCrop}
          currentWeek={currentWeek}
        />
      </Canvas>
    </div>
  );
};

export default VirtualField3D;
