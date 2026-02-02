import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Sky, Cloud, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import crackedSoilTexture from '@/assets/cracked-soil-texture.png';

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

// Realistic dried mud cracks using actual texture
const CrackedSoilOverlay = ({ moisture }: { moisture: number }) => {
  const crackIntensity = useMemo(() => Math.max(0, (20 - moisture) / 20), [moisture]);
  const texture = useTexture(crackedSoilTexture);
  
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
  }, [texture]);

  if (crackIntensity <= 0) return null;

  return (
    <mesh position={[0, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={crackIntensity}
        roughness={1}
        metalness={0}
      />
    </mesh>
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
const StatusIndicators = ({ moisture, temperature, soilPh, lightIntensity, humidity }: Omit<FieldProps, 'todayRainfall' | 'totalRainfall'>) => {
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
    
    const moistureFactor = moisture / 100;
    const baseR = Math.floor((0.4 - moistureFactor * 0.2) * 255);
    const baseG = Math.floor((0.26 - moistureFactor * 0.15) * 255);
    const baseB = Math.floor((0.13 - moistureFactor * 0.1) * 255);
    
    ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
    ctx.fillRect(0, 0, 512, 512);
    
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

// Calculate growth factor based on environmental conditions
const calculateGrowthFactor = (moisture: number, temperature: number, plantId: number): number => {
  const baseGrowth = Math.min(1, Math.max(0.3, (moisture / 100) * (temperature / 22)));
  const variation = 0.85 + Math.sin(plantId * 0.7) * 0.15;
  return baseGrowth * variation;
};

// Realistic Tomato Plant Component
const RealisticTomatoPlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor,
  currentWeek = 1
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
  currentWeek?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const stemSegments = 5;
  const leafCount = 8;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.02 * (1 - wiltFactor * 0.5);
    }
  });

  const stemHeight = 0.8 * growth;
  
  const getTomatoColor = (g: number) => {
    if (g > 0.7) return "#e53935";
    if (g > 0.4) return "#ff9800";
    return "#4caf50";
  };

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: stemSegments }).map((_, i) => {
        const segmentHeight = stemHeight / stemSegments;
        const bottomRadius = 0.04 - (i * 0.005);
        const topRadius = 0.035 - (i * 0.005);
        return (
          <mesh 
            key={`stem-${i}`} 
            position={[0, segmentHeight * i + segmentHeight / 2, 0]} 
            castShadow
          >
            <cylinderGeometry args={[topRadius, bottomRadius, segmentHeight, 8]} />
            <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
          </mesh>
        );
      })}
      
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 4;
        const height = 0.15 + (i / leafCount) * stemHeight * 0.8;
        const radius = 0.12 + Math.sin(i) * 0.03;
        const droopAngle = wiltFactor * 0.4;
        return (
          <mesh
            key={`leaf-${i}`}
            position={[
              Math.cos(angle) * 0.08,
              height,
              Math.sin(angle) * 0.08
            ]}
            rotation={[droopAngle + 0.3, angle, Math.PI / 6]}
            castShadow
          >
            <sphereGeometry args={[radius * growth, 6, 4]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.15, 0.5 - wiltFactor * 0.2, 0.1)} 
              roughness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {growth >= 0.4 && growth <= 0.8 && currentWeek >= 8 && currentWeek < 11 && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh
              key={`flower-${i}`}
              position={[
                Math.cos(i * 2.1) * 0.15,
                stemHeight * 0.7 + i * 0.05,
                Math.sin(i * 2.1) * 0.15
              ]}
            >
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </>
      )}
      
      {currentWeek >= 11 && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh
              key={`tomato-${i}`}
              position={[
                Math.cos(i * 2.5) * 0.2,
                stemHeight * 0.5 + i * 0.1,
                Math.sin(i * 2.5) * 0.2
              ]}
              castShadow
            >
              <sphereGeometry args={[0.06 + growth * 0.03, 8, 8]} />
              <meshStandardMaterial 
                color={getTomatoColor(growth)} 
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// Realistic Chili Plant Component
const RealisticChiliPlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor,
  currentWeek = 1
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
  currentWeek?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.02 * (1 - wiltFactor * 0.5);
    }
  });

  const stemHeight = 0.7 * growth;
  
  const getChiliColor = (g: number, index: number) => {
    const ripeness = g + (index * 0.1);
    if (ripeness > 0.85) return "#D32F2F";
    if (ripeness > 0.7) return "#FF5722";
    if (ripeness > 0.55) return "#FF9800";
    if (ripeness > 0.4) return "#FFEB3B";
    return "#4CAF50";
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, stemHeight, 8]} />
        <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
      </mesh>
      
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        const branchHeight = stemHeight * (0.4 + i * 0.1);
        return (
          <group key={`branch-${i}`}>
            <mesh
              position={[
                Math.cos(angle) * 0.08,
                branchHeight,
                Math.sin(angle) * 0.08
              ]}
              rotation={[0, -angle, Math.PI / 3]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.015, 0.12, 6]} />
              <meshStandardMaterial color="#4a6b3a" roughness={0.8} />
            </mesh>
            
            <mesh
              position={[
                Math.cos(angle) * 0.15,
                branchHeight + 0.03,
                Math.sin(angle) * 0.15
              ]}
              rotation={[wiltFactor * 0.4 + 0.2, angle, 0]}
              castShadow
            >
              <sphereGeometry args={[0.05 * growth, 6, 4]} />
              <meshStandardMaterial 
                color={new THREE.Color(0.12, 0.45 - wiltFactor * 0.1, 0.08)} 
                roughness={0.6}
              />
            </mesh>
            
            {growth > 0.5 && currentWeek >= 14 && i < 4 && (
              <mesh
                position={[
                  Math.cos(angle) * 0.12,
                  branchHeight - 0.05,
                  Math.sin(angle) * 0.12
                ]}
                rotation={[0.5 + wiltFactor * 0.3, angle, 0]}
                castShadow
              >
                <capsuleGeometry args={[0.015, 0.06 * growth, 4, 8]} />
                <meshStandardMaterial 
                  color={getChiliColor(growth, i)} 
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
            )}
          </group>
        );
      })}
      
      {currentWeek >= 10 && currentWeek < 14 && (
        <>
          {[0, 1, 2].map((i) => (
            <mesh
              key={`flower-${i}`}
              position={[
                Math.cos(i * 2.1) * 0.1,
                stemHeight * 0.7 + i * 0.03,
                Math.sin(i * 2.1) * 0.1
              ]}
            >
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// Realistic Brinjal (Eggplant) Component
const RealisticBrinjalPlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor,
  currentWeek = 1
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
  currentWeek?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.015 * (1 - wiltFactor * 0.5);
    }
  });

  const stemHeight = 0.8 * growth;
  
  const getBrinjalColor = (g: number) => {
    if (g > 0.8) return "#4A148C";
    if (g > 0.65) return "#5E35B1";
    if (g > 0.5) return "#7E57C2";
    if (g > 0.35) return "#9575CD";
    return "#A5D6A7";
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.045, stemHeight, 8]} />
        <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
      </mesh>
      
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const height = 0.15 + (i / 6) * stemHeight * 0.7;
        return (
          <mesh
            key={`leaf-${i}`}
            position={[
              Math.cos(angle) * 0.12,
              height,
              Math.sin(angle) * 0.12
            ]}
            rotation={[wiltFactor * 0.3 + 0.4, angle, Math.PI / 8]}
            castShadow
          >
            <sphereGeometry args={[0.08 * growth, 6, 4]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.1, 0.35 - wiltFactor * 0.1, 0.08)} 
              roughness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {currentWeek >= 9 && currentWeek < 12 && (
        <>
          {[0, 1].map((i) => (
            <mesh
              key={`flower-${i}`}
              position={[
                Math.cos(i * 3) * 0.1,
                stemHeight * 0.6 + i * 0.05,
                Math.sin(i * 3) * 0.1
              ]}
            >
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color="#9c27b0" emissive="#9c27b0" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </>
      )}
      
      {growth > 0.4 && currentWeek >= 12 && (
        <>
          {[0, 1].map((i) => {
            const fruitSize = 0.04 + growth * 0.04;
            return (
              <group key={`brinjal-${i}`}>
                <mesh
                  position={[
                    Math.cos(i * 4 + 1) * 0.15,
                    stemHeight * 0.4 - i * 0.08,
                    Math.sin(i * 4 + 1) * 0.15
                  ]}
                  rotation={[0.3, i * 1.5, 0]}
                  castShadow
                >
                  <capsuleGeometry args={[fruitSize, fruitSize * 1.5, 8, 16]} />
                  <meshStandardMaterial 
                    color={getBrinjalColor(growth)} 
                    roughness={0.2}
                    metalness={0.15}
                  />
                </mesh>
                <mesh
                  position={[
                    Math.cos(i * 4 + 1) * 0.15,
                    stemHeight * 0.4 - i * 0.08 + fruitSize * 1.8,
                    Math.sin(i * 4 + 1) * 0.15
                  ]}
                >
                  <coneGeometry args={[fruitSize * 0.6, fruitSize * 0.4, 5]} />
                  <meshStandardMaterial color="#2e7d32" roughness={0.7} />
                </mesh>
              </group>
            );
          })}
        </>
      )}
    </group>
  );
};

// Mist particles for high humidity
const MistParticles = ({ humidity }: { humidity: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const mistIntensity = useMemo(() => Math.max(0, (humidity - 65) / 35), [humidity]);
  const particleCount = useMemo(() => Math.floor(mistIntensity * 150), [mistIntensity]);

  const [positions, velocities] = useMemo(() => {
    if (particleCount === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 1.5 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
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
        
        if (Math.abs(pos[i * 3]) > 6) pos[i * 3] *= -0.9;
        if (pos[i * 3 + 1] > 2 || pos[i * 3 + 1] < 0.1) velocities[i * 3 + 1] *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 6) pos[i * 3 + 2] *= -0.9;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (particleCount === 0) return null;

  return (
    <points ref={pointsRef} key={`mist-${particleCount}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color="#e0e0e0" 
        transparent 
        opacity={0.25 * mistIntensity}
        sizeAttenuation
      />
    </points>
  );
};

const WaterDroplets = ({ todayRainfall, totalRainfall }: { todayRainfall: number; totalRainfall: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = useMemo(() => {
    if (todayRainfall <= 0 && totalRainfall <= 0) return 0;
    const todayDroplets = Math.floor((todayRainfall / 50) * 200);
    const totalDroplets = Math.floor((totalRainfall / 200) * 50);
    return Math.min(300, todayDroplets + totalDroplets);
  }, [todayRainfall, totalRainfall]);

  const [positions, velocities] = useMemo(() => {
    if (particleCount === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3 - 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      const speedFactor = 1 + (todayRainfall / 50) * 0.5;
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (-Math.random() * 0.02 - 0.01) * speedFactor;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, vel];
  }, [particleCount, todayRainfall]);

  useFrame(() => {
    if (pointsRef.current && particleCount > 0) {
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

  if (particleCount === 0) return null;

  return (
    <points ref={pointsRef} key={`rain-${particleCount}`}>
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

const Scene = ({ moisture, temperature, soilPh, lightIntensity, humidity, todayRainfall, totalRainfall, selectedCrop = 'tomato', currentWeek = 1 }: FieldProps) => {
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

  const skyTurbidity = useMemo(() => {
    if (temperature > 35) return 12;
    if (humidity > 80) return 10;
    if (todayRainfall > 5) return 14;
    return 8;
  }, [temperature, humidity, todayRainfall]);

  const wiltFactor = useMemo(() => {
    let wilt = 0;
    if (moisture < 25) wilt += (25 - moisture) / 25 * 0.5;
    if (temperature > 38) wilt += (temperature - 38) / 12 * 0.3;
    return Math.min(1, wilt);
  }, [moisture, temperature]);

  // Generate plants scattered across the flat field
  const plants = useMemo(() => {
    const plantList = [];
    // Create a grid of plants across the field
    for (let x = -3; x <= 3; x += 1.2) {
      for (let z = -3; z <= 3; z += 1.2) {
        const plantId = Math.floor((x + 4) * 10 + (z + 4));
        const growth = calculateGrowthFactor(moisture, temperature, plantId);
        // Add slight random offset for natural look
        const offsetX = (Math.random() - 0.5) * 0.3;
        const offsetZ = (Math.random() - 0.5) * 0.3;
        plantList.push({
          position: [x + offsetX, 0, z + offsetZ] as [number, number, number],
          plantId,
          growth,
        });
      }
    }
    return plantList;
  }, [moisture, temperature]);

  // Select the appropriate plant component based on crop type
  const PlantComponent = selectedCrop === 'chili' 
    ? RealisticChiliPlant 
    : selectedCrop === 'brinjal' 
      ? RealisticBrinjalPlant 
      : RealisticTomatoPlant;

  const cropInfo = {
    tomato: { emoji: '🍅', name: 'Tomatoes', color: '#e53935' },
    chili: { emoji: '🌶️', name: 'Chilies', color: '#ff5722' },
    brinjal: { emoji: '🍆', name: 'Brinjal', color: '#7e57c2' },
  }[selectedCrop] || { emoji: '🌱', name: 'Plants', color: '#4caf50' };

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
      <CrackedSoilOverlay moisture={moisture} />
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
      
      <WaterDroplets key={`${todayRainfall}-${totalRainfall}`} todayRainfall={todayRainfall} totalRainfall={totalRainfall} />
      <MistParticles humidity={humidity} />

      {/* Sensor poles */}
      <SensorPole position={[5.5, 0, 5.5]} label="Moisture" value={`${moisture}%`} />
      <SensorPole position={[5.5, 0, -5.5]} label="Temp" value={`${temperature}°C`} />
      <SensorPole position={[-5.5, 0, 5.5]} label="pH" value={soilPh.toFixed(1)} />
      <SensorPole position={[-5.5, 0, -5.5]} label="Week" value={`${currentWeek}`} />

      {/* Plants scattered across flat field */}
      {plants.map((plant, i) => (
        <PlantComponent
          key={i}
          position={plant.position}
          plantId={plant.plantId}
          growth={plant.growth}
          wiltFactor={wiltFactor}
          currentWeek={currentWeek}
        />
      ))}

      {/* Crop and Week Labels */}
      <Text position={[0, 1.8, -4]} fontSize={0.3} color={cropInfo.color} anchorX="center" outlineWidth={0.01} outlineColor="#000000">
        {cropInfo.emoji} {cropInfo.name} - Week {currentWeek}
      </Text>

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

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.1}
      />
      <Environment preset="sunset" />
      
      {/* Ground fog effect */}
      <fog attach="fog" args={['#e8f5e9', 12, 45]} />
    </>
  );
};

const VirtualField3D = ({ moisture, temperature, soilPh, lightIntensity, humidity, todayRainfall, totalRainfall, selectedCrop = 'tomato', currentWeek = 1 }: FieldProps) => {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-b from-sky-200 to-green-100">
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
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
