import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function AnimatedCube() {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    const radius = 2;

    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.y = Math.sin(t * 2) * 0.8;
    meshRef.current.position.z = Math.sin(t) * radius;

    meshRef.current.rotation.x += delta * 1.2;
    meshRef.current.rotation.y += delta * 1.8;

    const scale = 1 + 0.25 * Math.sin(t * 2.5);
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff7a18" metalness={0.2} roughness={0.35} />
    </mesh>
  );
}

export default function App() {
  return (
    <div className="app">
      <Canvas camera={{ position: [4, 3, 6], fov: 55 }} shadows>
        <color attach="background" args={["#f6f7fb"]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <AnimatedCube />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#d9e0ea" />
        </mesh>

        <gridHelper args={[18, 18, "#8a95a5", "#b4bcc8"]} />
        <axesHelper args={[3]} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
