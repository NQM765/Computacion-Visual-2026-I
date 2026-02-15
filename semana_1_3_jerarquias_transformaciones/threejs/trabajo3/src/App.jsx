import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Leva, useControls } from "leva";
import * as THREE from "three";

function Hierarchy() {
  const { px, py, pz, rx, ry, rz } = useControls("Padre (Group)", {
    px: { value: 0, min: -5, max: 5, step: 0.01 },
    py: { value: 0, min: -5, max: 5, step: 0.01 },
    pz: { value: 0, min: -5, max: 5, step: 0.01 },
    rx: { value: 0, min: -180, max: 180, step: 1 },
    ry: { value: 0, min: -180, max: 180, step: 1 },
    rz: { value: 0, min: -180, max: 180, step: 1 },
  });

  const { crx, cry, crz } = useControls("Hijo (Sub-Group)", {
    crx: { value: 0, min: -180, max: 180, step: 1 },
    cry: { value: 0, min: -180, max: 180, step: 1 },
    crz: { value: 0, min: -180, max: 180, step: 1 },
  });

  return (
    <>
      <gridHelper args={[20, 20]} />
      <axesHelper args={[3]} />

      <group
        position={[px, py, pz]}
        rotation={[
          THREE.MathUtils.degToRad(rx),
          THREE.MathUtils.degToRad(ry),
          THREE.MathUtils.degToRad(rz),
        ]}
      >
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>

        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="tomato" />
        </mesh>

        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="deepskyblue" />
        </mesh>

        <mesh position={[0, 0, 2]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="gold" />
        </mesh>

        <group
          position={[0, 0, -2]}
          rotation={[
            THREE.MathUtils.degToRad(crx),
            THREE.MathUtils.degToRad(cry),
            THREE.MathUtils.degToRad(crz),
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="lime" />
          </mesh>

          <mesh position={[1.2, 0, 0]}>
            <torusKnotGeometry args={[0.25, 0.08, 120, 12]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function App() {
  return (
    <>
      <Leva collapsed={false} />

      {/* Contenedor que garantiza tamaño grande */}
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas camera={{ position: [5, 4, 7], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1} />
          <Hierarchy />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </>
  );
}
