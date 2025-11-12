import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';

interface FieldProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  humidity: number;
}

const RealisticSoilLayer = ({ moisture, soilPh }: { moisture: number; soilPh: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const soilTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base soil color
    const moistureFactor = moisture / 100;
    const baseR = Math.floor((0.4 - moistureFactor * 0.2) * 255);
    const baseG = Math.floor((0.26 - moistureFactor * 0.15) * 255);
    const baseB = Math.floor((0.13 - moistureFactor * 0.1) * 255);
    
    ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add texture detail
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 3 + 1;
      const darkness = Math.random() * 40;
      ctx.fillStyle = `rgba(${baseR - darkness}, ${baseG - darkness}, ${baseB - darkness}, ${Math.random() * 0.5 + 0.3})`;
      ctx.fillRect(x, y, size, size);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [moisture, soilPh]);

  soilTexture.wrapS = soilTexture.wrapT = THREE.RepeatWrapping;
  soilTexture.repeat.set(4, 4);

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial 
        map={soilTexture}
        roughness={0.95}
        metalness={0}
        displacementScale={0.1}
      />
    </mesh>
  );
};

const RealisticPlant = ({ 
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
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.03;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.02;
    }
  });

  const leafColor = useMemo(() => {
    const healthFactor = health / 100;
    return new THREE.Color(
      0.1 + (1 - healthFactor) * 0.4,
      0.3 + healthFactor * 0.5,
      0.05
    );
  }, [health]);

  const scale = useMemo(() => {
    return (0.6 + (health / 100) * 0.4) * (0.8 + (lightIntensity / 100) * 0.2);
  }, [health, lightIntensity]);

  return (
    <group ref={groupRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
      </mesh>
      
      {/* Main leaf cluster */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const height = 0.4 + i * 0.1;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.15,
              height,
              Math.sin(angle) * 0.15
            ]}
            rotation={[angle, angle, angle]}
            castShadow
          >
            <coneGeometry args={[0.12 * scale, 0.25 * scale, 6]} />
            <meshStandardMaterial 
              color={leafColor} 
              roughness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {/* Top leaves */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.15 * scale, 8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

const WaterDroplets = ({ moisture, humidity }: { moisture: number; humidity: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, velocities] = useMemo(() => {
    const count = Math.floor((moisture / 100) * 150 + (humidity / 100) * 50);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3 - 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = -Math.random() * 0.02 - 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, vel];
  }, [moisture, humidity]);

  useFrame(() => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];
        
        if (pos[i * 3 + 1] < -0.3) {
          pos[i * 3 + 1] = 3;
          pos[i * 3] = (Math.random() - 0.5) * 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.04} 
        color="#4dd0e1" 
        transparent 
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

const IrrigationSystem = ({ active }: { active: boolean }) => {
  const sprayRef = useRef<THREE.Mesh>(null);
  const [particles] = useState(() => {
    const count = 50;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * 0.3;
      pos[i * 3 + 1] = Math.random() * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * 0.3;
    }
    return pos;
  });

  useFrame((state) => {
    if (sprayRef.current && active) {
      sprayRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[-3, 1.5, -3]}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={sprayRef} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {active && (
        <points position={[0, 0.3, 0]}>
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
      )}
    </group>
  );
};

const SensorPole = ({ position, label, value }: { position: [number, number, number]; label: string; value: string }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#1976d2" emissive="#1976d2" emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
      >
        {label}
      </Text>
      <Text
        position={[0, 1.25, 0]}
        fontSize={0.15}
        color="#4caf50"
        anchorX="center"
      >
        {value}
      </Text>
    </group>
  );
};

const Scene = ({ moisture, temperature, soilPh, lightIntensity, humidity }: FieldProps) => {
  const plantHealth = useMemo(() => {
    let health = 100;
    if (moisture < 30) health -= (30 - moisture);
    if (moisture > 70) health -= (moisture - 70) * 0.5;
    if (temperature < 20) health -= (20 - temperature) * 2;
    if (temperature > 35) health -= (temperature - 35) * 3;
    if (soilPh < 6) health -= (6 - soilPh) * 10;
    if (soilPh > 7.5) health -= (soilPh - 7.5) * 10;
    if (lightIntensity < 50) health -= (50 - lightIntensity) * 0.3;
    return Math.max(0, Math.min(100, health));
  }, [moisture, temperature, soilPh, lightIntensity]);

  const sunIntensity = useMemo(() => lightIntensity / 100, [lightIntensity]);
  const isIrrigating = moisture < 40;

  return (
    <>
      <Sky 
        sunPosition={[100 * sunIntensity, 20 + 30 * sunIntensity, 100]} 
        turbidity={8}
        rayleigh={0.5}
      />
      
      {humidity > 70 && (
        <>
          <Cloud position={[-4, 3, -4]} speed={0.2} opacity={0.3} />
          <Cloud position={[4, 3.5, -3]} speed={0.15} opacity={0.25} />
        </>
      )}

      <ambientLight intensity={0.4 + sunIntensity * 0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={sunIntensity * 1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight intensity={0.3} groundColor="#8B7355" />

      <RealisticSoilLayer moisture={moisture} soilPh={soilPh} />
      <WaterDroplets moisture={moisture} humidity={humidity} />
      <IrrigationSystem active={isIrrigating} />

      {/* Sensor poles */}
      <SensorPole position={[4, 0, 4]} label="Moisture" value={`${moisture}%`} />
      <SensorPole position={[4, 0, -4]} label="Temp" value={`${temperature}°C`} />
      <SensorPole position={[-4, 0, 4]} label="pH" value={soilPh.toFixed(1)} />

      {/* Plant field - 6x6 grid */}
      {Array.from({ length: 6 }).map((_, x) =>
        Array.from({ length: 6 }).map((_, z) => (
          <RealisticPlant
            key={`${x}-${z}`}
            position={[(x - 2.5) * 1.3, 0, (z - 2.5) * 1.3]}
            health={plantHealth + (Math.random() - 0.5) * 10}
            temperature={temperature}
            lightIntensity={lightIntensity}
          />
        ))
      )}

      {/* Health indicator */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color={plantHealth > 70 ? '#4caf50' : plantHealth > 40 ? '#ff9800' : '#f44336'}
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Field Health: {plantHealth.toFixed(0)}%
      </Text>

      {isIrrigating && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.25}
          color="#2196f3"
          anchorX="center"
        >
          💧 Irrigation Active
        </Text>
      )}

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={6}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
      />
      <Environment preset="sunset" />
      
      {/* Ground fog effect */}
      <fog attach="fog" args={['#e8f5e9', 10, 40]} />
    </>
  );
};

const VirtualField3D = ({ moisture, temperature, soilPh, lightIntensity, humidity }: FieldProps) => {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-b from-sky-200 to-green-100">
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene 
          moisture={moisture}
          temperature={temperature}
          soilPh={soilPh}
          lightIntensity={lightIntensity}
          humidity={humidity}
        />
      </Canvas>
    </div>
  );
};

export default VirtualField3D;