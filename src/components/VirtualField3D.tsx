import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
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
  wiltFactor
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
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
  
  // Tomato ripeness color based on growth
  const getTomatoColor = (g: number) => {
    if (g > 0.7) return "#e53935"; // Red ripe
    if (g > 0.4) return "#ff9800"; // Orange
    return "#4caf50"; // Green
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Tapered stem segments */}
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
      
      {/* Spiral arranged leaves */}
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
      
      {/* Yellow flower clusters (during flowering stage) */}
      {growth >= 0.4 && growth <= 0.8 && (
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
      
      {/* Tomato fruits */}
      {growth > 0.6 && (
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

// Realistic Lettuce Plant Component
const RealisticLettucePlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leafCount = 16;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: leafCount }).map((_, i) => {
        const layer = Math.floor(i / 4);
        const angleOffset = (i % 4) * (Math.PI / 2) + layer * 0.3;
        const height = layer * 0.06 * growth;
        const scale = (1 - layer * 0.15) * growth;
        const greenIntensity = 0.3 + layer * 0.1; // Inner leaves lighter
        
        return (
          <mesh
            key={`lettuce-leaf-${i}`}
            position={[
              Math.cos(angleOffset) * 0.08 * (4 - layer),
              height,
              Math.sin(angleOffset) * 0.08 * (4 - layer)
            ]}
            rotation={[wiltFactor * 0.2 + 0.2, angleOffset, 0]}
            castShadow
          >
            <sphereGeometry args={[0.08 * scale, 6, 4]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.2, greenIntensity + 0.3, 0.15)} 
              roughness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Realistic Pepper Plant Component
const RealisticPepperPlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pepperColors = ["#f44336", "#ff9800", "#4caf50", "#ffeb3b"];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.02;
    }
  });

  const stemHeight = 0.6 * growth;

  return (
    <group ref={groupRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, stemHeight, 8]} />
        <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
      </mesh>
      
      {/* Four branch stems at 90° intervals */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <group key={`branch-${i}`}>
            <mesh
              position={[
                Math.cos(angle) * 0.1,
                stemHeight * 0.7,
                Math.sin(angle) * 0.1
              ]}
              rotation={[0, -angle, Math.PI / 4]}
              castShadow
            >
              <cylinderGeometry args={[0.015, 0.02, 0.15, 6]} />
              <meshStandardMaterial color="#4a6b3a" roughness={0.8} />
            </mesh>
            
            {/* Leaves on branches */}
            <mesh
              position={[
                Math.cos(angle) * 0.18,
                stemHeight * 0.75,
                Math.sin(angle) * 0.18
              ]}
              rotation={[wiltFactor * 0.3, angle, 0]}
              castShadow
            >
              <sphereGeometry args={[0.06 * growth, 6, 4]} />
              <meshStandardMaterial 
                color={new THREE.Color(0.15, 0.45, 0.1)} 
                roughness={0.6}
              />
            </mesh>
            
            {/* Peppers */}
            {growth > 0.5 && (
              <mesh
                position={[
                  Math.cos(angle) * 0.15,
                  stemHeight * 0.5,
                  Math.sin(angle) * 0.15
                ]}
                rotation={[0.3, angle, 0]}
                castShadow
              >
                <capsuleGeometry args={[0.025, 0.08 * growth, 4, 8]} />
                <meshStandardMaterial 
                  color={pepperColors[i]} 
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Realistic Strawberry Plant Component
const RealisticStrawberryPlant = ({ 
  position, 
  plantId,
  growth,
  wiltFactor
}: { 
  position: [number, number, number];
  plantId: number;
  growth: number;
  wiltFactor: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + plantId) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Trifoliate leaf groups on petiole stems */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <group key={`leaf-group-${i}`}>
            {/* Petiole stem */}
            <mesh
              position={[
                Math.cos(angle) * 0.06,
                0.1 * growth,
                Math.sin(angle) * 0.06
              ]}
              rotation={[0.5, -angle, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.015, 0.12 * growth, 6]} />
              <meshStandardMaterial color="#5d7a4a" roughness={0.8} />
            </mesh>
            
            {/* Three leaflets */}
            {[0, 1, 2].map((j) => {
              const leafAngle = angle + (j - 1) * 0.4;
              return (
                <mesh
                  key={`leaflet-${j}`}
                  position={[
                    Math.cos(leafAngle) * 0.14,
                    0.15 * growth,
                    Math.sin(leafAngle) * 0.14
                  ]}
                  rotation={[wiltFactor * 0.2 + 0.3, leafAngle, 0]}
                  castShadow
                >
                  <sphereGeometry args={[0.04 * growth, 6, 4]} />
                  <meshStandardMaterial 
                    color={new THREE.Color(0.12, 0.4, 0.08)} 
                    roughness={0.6}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
      
      {/* White flower clusters */}
      {growth >= 0.3 && growth <= 0.6 && (
        <>
          {[0, 1].map((i) => (
            <mesh
              key={`flower-${i}`}
              position={[
                Math.cos(i * 3) * 0.08,
                0.12,
                Math.sin(i * 3) * 0.08
              ]}
            >
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffcc" emissiveIntensity={0.1} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Strawberry fruits (cone geometry with seeds) */}
      {growth > 0.5 && (
        <>
          {[0, 1].map((i) => (
            <group key={`strawberry-${i}`}>
              <mesh
                position={[
                  Math.cos(i * 4) * 0.1,
                  0.04,
                  Math.sin(i * 4) * 0.1
                ]}
                rotation={[Math.PI, 0, 0]}
                castShadow
              >
                <coneGeometry args={[0.035 * growth, 0.06 * growth, 8]} />
                <meshStandardMaterial color="#e53935" roughness={0.4} />
              </mesh>
              {/* Seeds */}
              {[0, 1, 2, 3].map((s) => (
                <mesh
                  key={`seed-${s}`}
                  position={[
                    Math.cos(i * 4) * 0.1 + Math.cos(s * 1.5) * 0.02,
                    0.03,
                    Math.sin(i * 4) * 0.1 + Math.sin(s * 1.5) * 0.02
                  ]}
                >
                  <sphereGeometry args={[0.005, 4, 4]} />
                  <meshStandardMaterial color="#ffeb3b" />
                </mesh>
              ))}
            </group>
          ))}
        </>
      )}
    </group>
  );
};

// Raised Garden Bed Component
const RaisedGardenBed = ({ 
  position, 
  moisture,
  temperature,
  plantType,
  bedId
}: { 
  position: [number, number, number];
  moisture: number;
  temperature: number;
  plantType: 'tomato' | 'lettuce' | 'pepper' | 'strawberry';
  bedId: number;
}) => {
  const soilColor = useMemo(() => {
    const moistureFactor = moisture / 100;
    return new THREE.Color(
      0.35 - moistureFactor * 0.15,
      0.22 - moistureFactor * 0.1,
      0.1 - moistureFactor * 0.05
    );
  }, [moisture]);

  const wiltFactor = useMemo(() => {
    let wilt = 0;
    if (moisture < 25) wilt += (25 - moisture) / 25 * 0.5;
    if (temperature > 38) wilt += (temperature - 38) / 12 * 0.3;
    return Math.min(1, wilt);
  }, [moisture, temperature]);

  // 3x3 grid of plants per bed
  const plants = useMemo(() => {
    const plantList = [];
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        const plantId = bedId * 9 + x * 3 + z;
        const growth = calculateGrowthFactor(moisture, temperature, plantId);
        plantList.push({
          position: [(x - 1) * 0.5, 0.15, (z - 1) * 0.5] as [number, number, number],
          plantId,
          growth,
        });
      }
    }
    return plantList;
  }, [moisture, temperature, bedId]);

  const PlantComponent = {
    tomato: RealisticTomatoPlant,
    lettuce: RealisticLettucePlant,
    pepper: RealisticPepperPlant,
    strawberry: RealisticStrawberryPlant,
  }[plantType];

  return (
    <group position={position}>
      {/* Wood frame */}
      {[
        [0, 0.075, -0.9, 1.9, 0.15, 0.1],
        [0, 0.075, 0.9, 1.9, 0.15, 0.1],
        [-0.9, 0.075, 0, 0.1, 0.15, 1.8],
        [0.9, 0.075, 0, 0.1, 0.15, 1.8],
      ].map((dims, i) => (
        <mesh key={`frame-${i}`} position={[dims[0], dims[1], dims[2]]} castShadow>
          <boxGeometry args={[dims[3], dims[4], dims[5]]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Soil layer */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.1, 1.7]} />
        <meshStandardMaterial color={soilColor} roughness={0.95} />
      </mesh>
      
      {/* Plants */}
      {plants.map((plant, i) => (
        <PlantComponent
          key={i}
          position={plant.position}
          plantId={plant.plantId}
          growth={plant.growth}
          wiltFactor={wiltFactor}
        />
      ))}
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
        
        // Reset particles that drift too far
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

// Legacy plant component for backward compatibility
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

  const wiltFactor = useMemo(() => {
    let wilt = 0;
    if (moisture < 25) wilt += (25 - moisture) / 25 * 0.5;
    if (temperature > 38) wilt += (temperature - 38) / 12 * 0.3;
    if (health < 40) wilt += (40 - health) / 40 * 0.2;
    return Math.min(1, wilt);
  }, [moisture, temperature, health]);

  useFrame((state) => {
    if (groupRef.current) {
      const swayAmount = 0.03 * (1 - wiltFactor * 0.7);
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * swayAmount;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.02 * (1 - wiltFactor);
      groupRef.current.rotation.x = wiltFactor * 0.3;
    }
  });

  const leafColor = useMemo(() => {
    const healthFactor = health / 100;
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
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#3d5a2c" roughness={0.8} />
      </mesh>
      
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
      
      <mesh position={[0, 0.6 * (1 - wiltFactor * 0.3), 0]} rotation={[wiltFactor * 0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.15 * scale, 8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

const WaterDroplets = ({ todayRainfall, totalRainfall }: { todayRainfall: number; totalRainfall: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Only show rain droplets when there's actual rainfall
  // Today's rainfall has more impact on droplet count, total rainfall adds some background effect
  const particleCount = useMemo(() => {
    if (todayRainfall <= 0 && totalRainfall <= 0) return 0;
    // Scale: today's rainfall (0-50mm) maps to 0-200 particles
    // Total rainfall adds a subtle background (0-200mm) maps to 0-50 particles
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
      
      // Droplet speed based on rainfall intensity
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

const Scene = ({ moisture, temperature, soilPh, lightIntensity, humidity, todayRainfall, totalRainfall }: FieldProps) => {
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
    if (todayRainfall > 5) return 14; // Rainy/overcast
    return 8;
  }, [temperature, humidity, todayRainfall]);

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
      <IrrigationSystem active={isIrrigating} />

      {/* Sensor poles */}
      <SensorPole position={[5.5, 0, 5.5]} label="Moisture" value={`${moisture}%`} />
      <SensorPole position={[5.5, 0, -5.5]} label="Temp" value={`${temperature}°C`} />
      <SensorPole position={[-5.5, 0, 5.5]} label="pH" value={soilPh.toFixed(1)} />
      <SensorPole position={[-5.5, 0, -5.5]} label="Humidity" value={`${humidity}%`} />

      {/* Raised Garden Beds - 4 beds with different plant types */}
      <RaisedGardenBed 
        position={[-2.5, 0, -2.5]} 
        moisture={moisture} 
        temperature={temperature} 
        plantType="tomato" 
        bedId={0} 
      />
      <RaisedGardenBed 
        position={[-2.5, 0, 2.5]} 
        moisture={moisture} 
        temperature={temperature} 
        plantType="lettuce" 
        bedId={1} 
      />
      <RaisedGardenBed 
        position={[2.5, 0, -2.5]} 
        moisture={moisture} 
        temperature={temperature} 
        plantType="pepper" 
        bedId={2} 
      />
      <RaisedGardenBed 
        position={[2.5, 0, 2.5]} 
        moisture={moisture} 
        temperature={temperature} 
        plantType="strawberry" 
        bedId={3} 
      />

      {/* Bed Labels */}
      <Text position={[-2.5, 1.2, -2.5]} fontSize={0.18} color="#e53935" anchorX="center">
        🍅 Tomatoes
      </Text>
      <Text position={[-2.5, 1.2, 2.5]} fontSize={0.18} color="#4caf50" anchorX="center">
        🥬 Lettuce
      </Text>
      <Text position={[2.5, 1.2, -2.5]} fontSize={0.18} color="#ff5722" anchorX="center">
        🌶️ Peppers
      </Text>
      <Text position={[2.5, 1.2, 2.5]} fontSize={0.18} color="#e91e63" anchorX="center">
        🍓 Strawberries
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

const VirtualField3D = ({ moisture, temperature, soilPh, lightIntensity, humidity, todayRainfall, totalRainfall }: FieldProps) => {
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
        />
      </Canvas>
    </div>
  );
};

export default VirtualField3D;
