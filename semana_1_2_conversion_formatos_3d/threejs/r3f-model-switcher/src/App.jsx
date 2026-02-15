import { useMemo, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html, Center } from "@react-three/drei";


// Loaders de Three.js
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MODELS } from "./models";

// Hook de R3F para loaders
import { useLoader } from "@react-three/fiber";

/**
 * Cuenta vértices y triángulos de una BufferGeometry.
 * (En Three.js, positions es el atributo clave para # de vértices) :contentReference[oaicite:2]{index=2}
 */
function getGeometryStats(geometry) {
  if (!geometry) return { vertices: 0, triangles: 0 };
  const pos = geometry.attributes?.position;
  const vertices = pos ? pos.count : 0;

  // Triángulos: si es indexada -> index.count / 3, si no -> vertices / 3
  const triangles = geometry.index ? geometry.index.count / 3 : vertices / 3;

  return { vertices, triangles };
}

function Overlay({ format, stats }) {
  return (
    <Html position={[0, 1.2, 0]} center>
      <div style={{
        padding: "10px 12px",
        background: "rgba(0,0,0,0.65)",
        color: "white",
        borderRadius: 8,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        minWidth: 220
      }}>
        <div><b>Formato:</b> {format.toUpperCase()}</div>
        <div><b>Vértices:</b> {stats.vertices.toLocaleString()}</div>
        <div><b>Triángulos:</b> {Math.floor(stats.triangles).toLocaleString()}</div>
      </div>
    </Html>
  );
}

/**
 * Modelo OBJ
 * OBJLoader devuelve un Group con meshes dentro.
 * Suelen ser materiales básicos a menos que haya MTL/texturas externas.
 */
function ModelOBJ({ url, onStats }) {
  const obj = useLoader(OBJLoader, url);

  useMemo(() => {
    // Recorremos todos los meshes y sumamos vértices/triángulos
    let vertices = 0;
    let triangles = 0;

    obj.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.computeVertexNormals(); // mejora “suavidad” si falta normal (opcional)
        const s = getGeometryStats(child.geometry);
        vertices += s.vertices;
        triangles += s.triangles;

        // Material simple para ver shading
        child.material = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.1 });
      }
    });

    onStats({ vertices, triangles });
  }, [obj, onStats]);

  return <primitive object={obj} />;
}

/**
 * Modelo STL
 * STLLoader devuelve directamente una BufferGeometry.
 * STL no trae color/UV/texturas por diseño (normalmente). :contentReference[oaicite:3]{index=3}
 */
function ModelSTL({ url, onStats }) {
  const geometry = useLoader(STLLoader, url);

  useMemo(() => {
    geometry.computeVertexNormals();
    onStats(getGeometryStats(geometry));
  }, [geometry, onStats]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial roughness={0.35} metalness={0.2} />
    </mesh>
  );
}

/**
 * Modelo GLTF
 * GLTFLoader devuelve { scene, nodes, materials... }.
 * Es el formato más completo para materiales/texturas en web. :contentReference[oaicite:4]{index=4}
 */
function ModelGLTF({ url, onStats }) {
  const gltf = useLoader(GLTFLoader, url);

  useMemo(() => {
    let vertices = 0;
    let triangles = 0;

    gltf.scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const s = getGeometryStats(child.geometry);
        vertices += s.vertices;
        triangles += s.triangles;
      }
    });

    onStats({ vertices, triangles });
  }, [gltf, onStats]);

  return <primitive object={gltf.scene} />;
}

function ModelSwitcher({ modelKey, format, onStats }) {
  const url = MODELS[modelKey][format];

  // Centrar/escala simple (opcional): podrías ajustar position/scale a gusto
  return (
    <group position={[0, -0.2, 0]} scale={1.2}>
      <Center>
        {format === "obj"  && <ModelOBJ  url={url} onStats={onStats} />}
        {format === "stl"  && <ModelSTL  url={url} onStats={onStats} />}
        {format === "gltf" && <ModelGLTF url={url} onStats={onStats} />}
      </Center>
    </group>
  );
}

export default function App() {
  const [modelKey] = useState("suzanne");
  const [format, setFormat] = useState("gltf"); // obj | stl | gltf
  const [stats, setStats] = useState({ vertices: 0, triangles: 0 });

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* UI simple */}
      <div style={{
        position: "absolute",
        zIndex: 10,
        top: 12,
        left: 12,
        display: "flex",
        gap: 8,
        padding: 10,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 10,
        fontFamily: "system-ui, sans-serif"
      }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Formato:
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="gltf">GLTF</option>
            <option value="obj">OBJ</option>
            <option value="stl">STL</option>
          </select>
        </label>

        <button onClick={() => setFormat("gltf")}>GLTF</button>
        <button onClick={() => setFormat("obj")}>OBJ</button>
        <button onClick={() => setFormat("stl")}>STL</button>
      </div>

      <Canvas camera={{ position: [0, 1.1, 3.2], fov: 50 }}>
        {/* Luces para notar shading/suavidad */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1.0} />

        <Suspense fallback={null}>
          <ModelSwitcher
            modelKey={modelKey}
            format={format}
            onStats={setStats}
          />
          <Overlay format={format} stats={stats} />
        </Suspense>

        {/* OrbitControls (drei) */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
