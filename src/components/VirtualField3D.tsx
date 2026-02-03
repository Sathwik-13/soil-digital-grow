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

// Tomato plant - bushy with round foliage and red fruits
const TomatoPlant = ({ 
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + plantId * 0.5) * 0.02;
    }
  });

  const plantHeight = 0.35 + growth * 0.45;
  const leafSize = 0.1 + growth * 0.08;

  return (
    <group ref={groupRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, plantHeight / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.03, plantHeight, 6]} />
        <meshStandardMaterial color="#4a7c34" />
      </mesh>
      
      {/* Bushy foliage layers */}
      <mesh position={[0, plantHeight + leafSize * 0.5, 0]}>
        <sphereGeometry args={[leafSize * 1.3, 8, 6]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      
      <mesh position={[0, plantHeight * 0.65, 0]}>
        <sphereGeometry args={[leafSize * 1.1, 8, 6]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
      
      {/* Tomato fruits when grown */}
      {growth > 0.6 && (
        <>
          <mesh position={[leafSize * 0.8, plantHeight * 0.5, 0]}>
            <sphereGeometry args={[0.05 + growth * 0.03, 8, 8]} />
            <meshStandardMaterial color="#e53935" />
          </mesh>
          <mesh position={[-leafSize * 0.6, plantHeight * 0.4, leafSize * 0.5]}>
            <sphereGeometry args={[0.04 + growth * 0.02, 8, 8]} />
            <meshStandardMaterial color="#ff7043" />
          </mesh>
        </>
      )}
    </group>
  );
};

// Chili plant - slender with elongated peppers
const ChiliPlant = ({ 
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.9 + plantId * 0.6) * 0.025;
    }
  });

  const plantHeight = 0.3 + growth * 0.4;
  const leafSize = 0.07 + growth * 0.05;

  return (
    <group ref={groupRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, plantHeight / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.022, plantHeight, 6]} />
        <meshStandardMaterial color="#558b2f" />
      </mesh>
      
      {/* Pointed foliage */}
      <mesh position={[0, plantHeight + leafSize, 0]}>
        <coneGeometry args={[leafSize * 0.8, leafSize * 2.5, 6]} />
        <meshStandardMaterial color="#7cb342" />
      </mesh>
      
      <mesh position={[leafSize * 0.5, plantHeight * 0.7, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[leafSize * 0.6, leafSize * 1.8, 5]} />
        <meshStandardMaterial color="#8bc34a" />
      </mesh>
      
      <mesh position={[-leafSize * 0.5, plantHeight * 0.6, leafSize * 0.3]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[leafSize * 0.5, leafSize * 1.5, 5]} />
        <meshStandardMaterial color="#9ccc65" />
      </mesh>
      
      {/* Chili peppers when grown */}
      {growth > 0.5 && (
        <>
          <mesh position={[leafSize * 0.6, plantHeight * 0.45, 0]} rotation={[0.2, 0, 0.5]}>
            <capsuleGeometry args={[0.02, 0.08 * growth, 4, 8]} />
            <meshStandardMaterial color="#d32f2f" />
          </mesh>
          <mesh position={[-leafSize * 0.4, plantHeight * 0.35, leafSize * 0.4]} rotation={[0.3, 0.5, -0.4]}>
            <capsuleGeometry args={[0.018, 0.07 * growth, 4, 8]} />
            <meshStandardMaterial color="#ff5722" />
          </mesh>
        </>
      )}
    </group>
  );
};

// Brinjal plant - broad leaves with purple fruits
const BrinjalPlant = ({ 
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
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + plantId * 0.4) * 0.015;
    }
  });

  const plantHeight = 0.35 + growth * 0.5;
  const leafSize = 0.12 + growth * 0.1;

  return (
    <group ref={groupRef} position={position}>
      {/* Thick stem */}
      <mesh position={[0, plantHeight / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.04, plantHeight, 6]} />
        <meshStandardMaterial color="#33691e" />
      </mesh>
      
      {/* Broad leaves - flattened spheres */}
      <mesh position={[0, plantHeight + leafSize * 0.3, 0]} scale={[1.4, 0.6, 1.4]}>
        <sphereGeometry args={[leafSize, 8, 6]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>
      
      <mesh position={[leafSize * 0.6, plantHeight * 0.6, 0]} scale={[1.2, 0.5, 1.2]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[leafSize * 0.8, 8, 6]} />
        <meshStandardMaterial color="#388e3c" />
      </mesh>
      
      <mesh position={[-leafSize * 0.5, plantHeight * 0.5, leafSize * 0.4]} scale={[1.1, 0.5, 1.1]} rotation={[0, 0, -0.15]}>
        <sphereGeometry args={[leafSize * 0.7, 8, 6]} />
        <meshStandardMaterial color="#43a047" />
      </mesh>
      
      {/* Brinjal fruits when grown */}
      {growth > 0.5 && (
        <>
          <mesh position={[0, plantHeight * 0.35, leafSize * 0.5]} rotation={[0.4, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.1 * growth, 8, 12]} />
            <meshStandardMaterial color="#5e35b1" />
          </mesh>
          {growth > 0.7 && (
            <mesh position={[leafSize * 0.5, plantHeight * 0.25, -leafSize * 0.3]} rotation={[0.3, 0.5, 0.2]}>
              <capsuleGeometry args={[0.035, 0.08 * growth, 8, 12]} />
              <meshStandardMaterial color="#7e57c2" />
            </mesh>
          )}
        </>
      )}
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

const Scene = ({ moisture, temperature, selectedCrop = 'tomato' }: FieldProps) => {
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

  // Select plant component based on crop type
  const PlantComponent = selectedCrop === 'chili' 
    ? ChiliPlant 
    : selectedCrop === 'brinjal' 
      ? BrinjalPlant 
      : TomatoPlant;

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
        <PlantComponent
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
