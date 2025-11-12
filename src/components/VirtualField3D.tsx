import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface FieldProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
}

const SoilLayer = ({ moisture, soilPh }: { moisture: number; soilPh: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Soil color based on moisture and pH
  const soilColor = useMemo(() => {
    // Dry soil: brown, Wet soil: dark brown/black
    const moistureFactor = moisture / 100;
    const r = 0.4 - (moistureFactor * 0.2);
    const g = 0.26 - (moistureFactor * 0.15);
    const b = 0.13 - (moistureFactor * 0.1);
    
    // pH affects color slightly (acidic: reddish, alkaline: greenish)
    const phOffset = (soilPh - 7) * 0.05;
    return new THREE.Color(r + phOffset, g, b - phOffset);
  }, [moisture, soilPh]);

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]} receiveShadow>
      <boxGeometry args={[8, 1, 8]} />
      <meshStandardMaterial 
        color={soilColor} 
        roughness={0.9 - (moisture / 200)} 
        metalness={0.1}
      />
    </mesh>
  );
};

const Plant = ({ 
  position, 
  health,
  temperature,
  lightIntensity 
}: { 
  position: [number, number, number];
  health: number;
  temperature: number;
  lightIntensity: number;
}) => {
  const stemRef = useRef<THREE.Mesh>(null);
  const leafRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (stemRef.current) {
      // Gentle sway animation
      stemRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });

  // Plant color based on health (combination of all factors)
  const leafColor = useMemo(() => {
    const healthFactor = health / 100;
    // Healthy: bright green, Unhealthy: yellow/brown
    return new THREE.Color(
      0.2 + (1 - healthFactor) * 0.5,
      0.4 + healthFactor * 0.4,
      0.1
    );
  }, [health]);

  const scale = useMemo(() => {
    // Plant size based on health and light
    const baseScale = 0.5 + (health / 100) * 0.5;
    return baseScale * (0.7 + (lightIntensity / 100) * 0.3);
  }, [health, lightIntensity]);

  return (
    <group position={position}>
      {/* Stem */}
      <mesh ref={stemRef} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      
      {/* Leaves */}
      <mesh ref={leafRef} position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.3 * scale, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      
      {/* Additional leaves */}
      <mesh position={[-0.2, 0.5, 0]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.15 * scale, 0.3 * scale, 4]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.15 * scale, 0.3 * scale, 4]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
    </group>
  );
};

const WaterParticles = ({ moisture }: { moisture: number }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = Math.floor((moisture / 100) * 100);
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = Math.random() * 0.5 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    
    return positions;
  }, [moisture]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4fc3f7" transparent opacity={0.6} />
    </points>
  );
};

const TemperatureIndicator = ({ temperature }: { temperature: number }) => {
  const color = useMemo(() => {
    // Blue for cold, Red for hot
    if (temperature < 20) return '#2196f3';
    if (temperature < 25) return '#4caf50';
    if (temperature < 30) return '#ffeb3b';
    if (temperature < 35) return '#ff9800';
    return '#f44336';
  }, [temperature]);

  return (
    <mesh position={[-4.5, 1, 0]}>
      <cylinderGeometry args={[0.1, 0.1, temperature / 10, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
};

const Scene = ({ moisture, temperature, soilPh, lightIntensity }: FieldProps) => {
  // Calculate overall plant health
  const plantHealth = useMemo(() => {
    let health = 100;
    
    // Moisture factor
    if (moisture < 30) health -= (30 - moisture);
    if (moisture > 70) health -= (moisture - 70) * 0.5;
    
    // Temperature factor
    if (temperature < 20) health -= (20 - temperature) * 2;
    if (temperature > 35) health -= (temperature - 35) * 3;
    
    // pH factor
    if (soilPh < 6) health -= (6 - soilPh) * 10;
    if (soilPh > 7.5) health -= (soilPh - 7.5) * 10;
    
    // Light factor
    if (lightIntensity < 50) health -= (50 - lightIntensity) * 0.3;
    
    return Math.max(0, Math.min(100, health));
  }, [moisture, temperature, soilPh, lightIntensity]);

  return (
    <>
      <ambientLight intensity={0.3 + (lightIntensity / 100) * 0.4} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={lightIntensity / 100}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffa726" />

      <SoilLayer moisture={moisture} soilPh={soilPh} />
      <WaterParticles moisture={moisture} />
      <TemperatureIndicator temperature={temperature} />

      {/* Plant grid */}
      {Array.from({ length: 5 }).map((_, x) =>
        Array.from({ length: 5 }).map((_, z) => (
          <Plant
            key={`${x}-${z}`}
            position={[(x - 2) * 1.5, 0, (z - 2) * 1.5]}
            health={plantHealth}
            temperature={temperature}
            lightIntensity={lightIntensity}
          />
        ))
      )}

      {/* Info labels */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={plantHealth > 70 ? '#4caf50' : plantHealth > 40 ? '#ff9800' : '#f44336'}
        anchorX="center"
      >
        Health: {plantHealth.toFixed(0)}%
      </Text>

      <Text
        position={[-4.5, 2, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
      >
        {temperature}°C
      </Text>

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
      <Environment preset="sunset" />
    </>
  );
};

const VirtualField3D = ({ moisture, temperature, soilPh, lightIntensity }: FieldProps) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl">
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene 
          moisture={moisture}
          temperature={temperature}
          soilPh={soilPh}
          lightIntensity={lightIntensity}
        />
      </Canvas>
    </div>
  );
};

export default VirtualField3D;