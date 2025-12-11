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

// Soil cracks component for low moisture
const SoilCracks = ({ moisture }: { moisture: number }) => {
  const crackIntensity = useMemo(() => Math.max(0, (20 - moisture) / 20), [moisture]);
  
  // Use a seed-based approach for consistent crack positions
  const cracks = useMemo(() => {
    if (crackIntensity <= 0) return [];
    const crackCount = Math.floor(crackIntensity * 25) + 10;
    const result = [];
    
    for (let i = 0; i < crackCount; i++) {
      // Create main crack
      const x = ((i * 7.3) % 8) - 4;
      const z = ((i * 5.7) % 8) - 4;
      result.push({
        x,
        z,
        rotation: (i * 0.7) % Math.PI,
        length: 0.8 + (i % 5) * 0.4,
        width: 0.08 + (i % 3) * 0.04,
        isMain: true,
      });
      
      // Add branching cracks
      if (i % 2 === 0) {
        result.push({
          x: x + 0.3,
          z: z + 0.2,
          rotation: ((i * 0.7) % Math.PI) + Math.PI / 4,
          length: 0.4 + (i % 3) * 0.2,
          width: 0.05,
          isMain: false,
        });
      }
    }
    return result;
  }, [crackIntensity]);

  if (crackIntensity <= 0) return null;

  return (
    <group position={[0, 0, 0]}>
      {cracks.map((crack, i) => (
        <group key={i}>
          {/* Dark crack base - visible depression */}
          <mesh
            position={[crack.x, -0.44, crack.z]}
            rotation={[-Math.PI / 2, 0, crack.rotation]}
          >
            <planeGeometry args={[crack.length, crack.width * 1.5]} />
            <meshBasicMaterial 
              color="#0a0503"
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Lighter edge highlight */}
          <mesh
            position={[crack.x, -0.43, crack.z]}
            rotation={[-Math.PI / 2, 0, crack.rotation]}
          >
            <planeGeometry args={[crack.length + 0.1, crack.width * 2.5]} />
            <meshBasicMaterial 
              color="#3d2914"
              transparent
              opacity={0.6 * crackIntensity}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      
      {/* Add 3D crack depth effect using boxes */}
      {cracks.filter(c => c.isMain).slice(0, 8).map((crack, i) => (
        <mesh
          key={`3d-${i}`}
          position={[crack.x, -0.52, crack.z]}
          rotation={[0, crack.rotation, 0]}
        >
          <boxGeometry args={[crack.length * 0.8, 0.1, crack.width * 0.8]} />
          <meshStandardMaterial 
            color="#1a0a05"
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Dust particles for dry soil
const DustParticles = ({ moisture, temperature }: { moisture: number; temperature: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const dustIntensity = useMemo(() => Math.max(0, (30 - moisture) / 30) * (temperature > 25 ? 1.5 : 1), [moisture, temperature]);
  
  const particleCount = useMemo(() => Math.floor(dustIntensity * 100), [dustIntensity]);

  const [positions, velocities] = useMemo(() => {
    if (particleCount === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      vel[i * 3] = (Math.random() - 0.3) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, vel];
  }, [particleCount]);

  useFrame(() => {
    if (pointsRef.current && particleCount > 0) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];
        
        if (pos[i * 3] > 5 || pos[i * 3] < -5) {
          pos[i * 3] = (Math.random() - 0.5) * 10;
        }
        if (pos[i * 3 + 1] > 2.5) {
          pos[i * 3 + 1] = 0;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (particleCount === 0) return null;

  return (
    <points ref={pointsRef} key={`dust-${particleCount}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#c4a574" 
        transparent 
        opacity={0.4 * dustIntensity}
        sizeAttenuation
      />
    </points>
  );
};

// Heat shimmer effect for high temperature
const HeatShimmer = ({ temperature }: { temperature: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const heatIntensity = useMemo(() => Math.max(0, (temperature - 30) / 20), [temperature]);

  useFrame((state) => {
    if (meshRef.current && heatIntensity > 0) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05 * heatIntensity;
    }
  });

  if (heatIntensity <= 0) return null;

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial 
        color="#ffaa00"
        transparent
        opacity={0.1 * heatIntensity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Frost crystals for low temperature
const FrostCrystals = ({ temperature }: { temperature: number }) => {
  const frostIntensity = useMemo(() => Math.max(0, (10 - temperature) / 15), [temperature]);

  const crystals = useMemo(() => {
    if (frostIntensity <= 0) return [];
    const count = Math.floor(frostIntensity * 40) + 10;
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 9,
      z: (Math.random() - 0.5) * 9,
      scale: 0.05 + Math.random() * 0.1,
      rotation: Math.random() * Math.PI * 2,
    }));
  }, [frostIntensity]);

  if (frostIntensity <= 0) return null;

  return (
    <group>
      {crystals.map((crystal, i) => (
        <mesh
          key={i}
          position={[crystal.x, -0.45, crystal.z]}
          rotation={[0, crystal.rotation, 0]}
          scale={crystal.scale}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#e0f7fa"
            transparent
            opacity={0.7 * frostIntensity}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Salt deposits for high pH
const SaltDeposits = ({ soilPh }: { soilPh: number }) => {
  const saltIntensity = useMemo(() => Math.max(0, (soilPh - 7.5) / 2), [soilPh]);

  const deposits = useMemo(() => {
    if (saltIntensity <= 0) return [];
    const count = Math.floor(saltIntensity * 25) + 5;
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      scaleX: 0.1 + Math.random() * 0.3,
      scaleZ: 0.1 + Math.random() * 0.3,
    }));
  }, [saltIntensity]);

  if (saltIntensity <= 0) return null;

  return (
    <group>
      {deposits.map((deposit, i) => (
        <mesh
          key={i}
          position={[deposit.x, -0.47, deposit.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[deposit.scaleX, 8]} />
          <meshStandardMaterial 
            color="#f5f5f5"
            transparent
            opacity={0.6 * saltIntensity}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

// Acid burn patches for low pH
const AcidPatches = ({ soilPh }: { soilPh: number }) => {
  const acidIntensity = useMemo(() => Math.max(0, (5.5 - soilPh) / 2), [soilPh]);

  const patches = useMemo(() => {
    if (acidIntensity <= 0) return [];
    const count = Math.floor(acidIntensity * 20) + 5;
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      scale: 0.15 + Math.random() * 0.35,
    }));
  }, [acidIntensity]);

  if (acidIntensity <= 0) return null;

  return (
    <group>
      {patches.map((patch, i) => (
        <mesh
          key={i}
          position={[patch.x, -0.46, patch.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[patch.scale, 12]} />
          <meshStandardMaterial 
            color="#5d4037"
            transparent
            opacity={0.7 * acidIntensity}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Waterlogging puddles for high moisture
const WaterPuddles = ({ moisture }: { moisture: number }) => {
  const puddleIntensity = useMemo(() => Math.max(0, (moisture - 75) / 25), [moisture]);

  const puddles = useMemo(() => {
    if (puddleIntensity <= 0) return [];
    const count = Math.floor(puddleIntensity * 12) + 3;
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 7,
      z: (Math.random() - 0.5) * 7,
      scaleX: 0.3 + Math.random() * 0.6,
      scaleZ: 0.2 + Math.random() * 0.4,
    }));
  }, [puddleIntensity]);

  if (puddleIntensity <= 0) return null;

  return (
    <group>
      {puddles.map((puddle, i) => (
        <mesh
          key={i}
          position={[puddle.x, -0.44, puddle.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[puddle.scaleX, puddle.scaleZ, 1]}
        >
          <circleGeometry args={[1, 16]} />
          <meshStandardMaterial 
            color="#1e88e5"
            transparent
            opacity={0.5 * puddleIntensity}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Status warning indicators floating above field
const StatusIndicators = ({ moisture, temperature, soilPh, lightIntensity, humidity }: FieldProps) => {
  const warnings = useMemo(() => {
    const w: { text: string; color: string; position: [number, number, number] }[] = [];
    
    if (moisture < 20) {
      w.push({ text: "⚠️ Severe Drought", color: "#ff5722", position: [-3, 2.3, 0] });
    } else if (moisture < 30) {
      w.push({ text: "🏜️ Low Moisture", color: "#ff9800", position: [-3, 2.3, 0] });
    }
    
    if (moisture > 80) {
      w.push({ text: "💧 Waterlogging Risk", color: "#2196f3", position: [3, 2.3, 0] });
    }
    
    if (temperature > 40) {
      w.push({ text: "🔥 Heat Stress", color: "#f44336", position: [-3, 2, 2] });
    } else if (temperature < 5) {
      w.push({ text: "❄️ Frost Warning", color: "#00bcd4", position: [-3, 2, 2] });
    }
    
    if (soilPh > 8) {
      w.push({ text: "⚗️ High Alkalinity", color: "#9c27b0", position: [3, 2, 2] });
    } else if (soilPh < 5.5) {
      w.push({ text: "⚗️ High Acidity", color: "#ff5722", position: [3, 2, 2] });
    }
    
    if (lightIntensity < 30) {
      w.push({ text: "🌑 Low Light", color: "#607d8b", position: [0, 2.3, 3] });
    }
    
    if (humidity > 90) {
      w.push({ text: "💨 High Humidity", color: "#03a9f4", position: [0, 2, -3] });
    }
    
    return w;
  }, [moisture, temperature, soilPh, lightIntensity, humidity]);

  return (
    <group>
      {warnings.map((warning, i) => (
        <Text
          key={i}
          position={warning.position}
          fontSize={0.2}
          color={warning.color}
          anchorX="center"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {warning.text}
        </Text>
      ))}
    </group>
  );
};

const RealisticSoilLayer = ({ moisture, soilPh }: { moisture: number; soilPh: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const soilTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base soil color - affected by moisture
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
  lightIntensity,
  moisture 
}: { 
  position: [number, number, number];
  health: number;
  temperature: number;
  lightIntensity: number;
  moisture: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate wilting based on conditions
  const wiltFactor = useMemo(() => {
    let wilt = 0;
    if (moisture < 25) wilt += (25 - moisture) / 25 * 0.5;
    if (temperature > 38) wilt += (temperature - 38) / 12 * 0.3;
    if (health < 40) wilt += (40 - health) / 40 * 0.2;
    return Math.min(1, wilt);
  }, [moisture, temperature, health]);

  useFrame((state) => {
    if (groupRef.current) {
      // Natural sway reduced when wilting
      const swayAmount = 0.03 * (1 - wiltFactor * 0.7);
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * swayAmount;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.02 * (1 - wiltFactor);
      
      // Wilting effect - droop
      groupRef.current.rotation.x = wiltFactor * 0.3;
    }
  });

  const leafColor = useMemo(() => {
    const healthFactor = health / 100;
    // Add browning for drought stress
    const brownFactor = moisture < 25 ? (25 - moisture) / 25 * 0.3 : 0;
    return new THREE.Color(
      0.1 + (1 - healthFactor) * 0.4 + brownFactor * 0.3,
      0.3 + healthFactor * 0.5 - brownFactor * 0.2,
      0.05
    );
  }, [health, moisture]);

  const scale = useMemo(() => {
    const baseScale = (0.6 + (health / 100) * 0.4) * (0.8 + (lightIntensity / 100) * 0.2);
    return baseScale * (1 - wiltFactor * 0.3);
  }, [health, lightIntensity, wiltFactor]);

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
        const droopAngle = wiltFactor * 0.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.15,
              height * (1 - wiltFactor * 0.2),
              Math.sin(angle) * 0.15
            ]}
            rotation={[angle + droopAngle, angle, angle]}
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
      <mesh position={[0, 0.6 * (1 - wiltFactor * 0.3), 0]} rotation={[wiltFactor * 0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.15 * scale, 8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

const WaterDroplets = ({ moisture, humidity }: { moisture: number; humidity: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = useMemo(() => 
    Math.floor((moisture / 100) * 150 + (humidity / 100) * 50),
    [moisture, humidity]
  );

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3 - 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = -Math.random() * 0.02 - 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, vel];
  }, [particleCount]);

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
    <points ref={pointsRef} key={particleCount}>
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

  // Sky color based on conditions
  const skyTurbidity = useMemo(() => {
    if (temperature > 35) return 12; // Hazy hot day
    if (humidity > 80) return 10; // Humid/overcast
    return 8;
  }, [temperature, humidity]);

  return (
    <>
      <Sky 
        sunPosition={[100 * sunIntensity, 20 + 30 * sunIntensity, 100]} 
        turbidity={skyTurbidity}
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
      
      {/* Environmental effects */}
      <SoilCracks moisture={moisture} />
      <DustParticles moisture={moisture} temperature={temperature} />
      <HeatShimmer temperature={temperature} />
      <FrostCrystals temperature={temperature} />
      <SaltDeposits soilPh={soilPh} />
      <AcidPatches soilPh={soilPh} />
      <WaterPuddles moisture={moisture} />
      <StatusIndicators 
        moisture={moisture} 
        temperature={temperature} 
        soilPh={soilPh} 
        lightIntensity={lightIntensity} 
        humidity={humidity} 
      />
      
      <WaterDroplets key={`${moisture}-${humidity}`} moisture={moisture} humidity={humidity} />
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
            moisture={moisture}
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
