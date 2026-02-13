import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { Gltf, Edges, Wireframe, Points } from "@react-three/drei";

// Loaders (OBJ/STL) desde three/examples
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

function computeStatsFromObject3D(root) {
  let meshes = 0;
  let vertices = 0;
  let triangles = 0;

  root.traverse((obj) => {
    if (obj.isMesh && obj.geometry) {
      meshes += 1;
      const g = obj.geometry;

      // vertices: position.count (BufferGeometry)
      const pos = g.attributes?.position;
      if (pos) vertices += pos.count;

      // triangles: si es indexada, index.count/3; si no, position.count/3
      if (g.index) triangles += g.index.count / 3;
      else if (pos) triangles += pos.count / 3;
    }
  });

  return {
    meshes,
    vertices: Math.round(vertices),
    triangles: Math.round(triangles),
  };
}

export default function SceneModel({ url, mode, onStats }) {
  const ext = useMemo(() => url.split(".").pop()?.toLowerCase(), [url]);

  // GLTF: recomendado usar <Gltf /> o useGLTF (Drei)
  // OBJ/STL: usar useLoader (R3F)
  const obj = ext === "obj" ? useLoader(OBJLoader, url) : null;
  const stl = ext === "stl" ? useLoader(STLLoader, url) : null;

  // Convertimos STL (geometry) a mesh para unificar flujo
  const stlMesh = useMemo(() => {
    if (!stl) return null;
    const mat = new THREE.MeshStandardMaterial({ color: "#cccccc" });
    const mesh = new THREE.Mesh(stl, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, [stl]);

  // Stats
  useEffect(() => {
    let root = null;
    if (ext === "obj" && obj) root = obj;
    if (ext === "stl" && stlMesh) root = stlMesh;
    // Para GLTF, calculamos stats desde el onCreated del <Gltf/> (abajo)
    if (root) onStats?.(computeStatsFromObject3D(root));
  }, [ext, obj, stlMesh, onStats]);

  // --- RENDER ---
  if (ext === "glb" || ext === "gltf") {
    return (
      <group>
        <Gltf
          src={url}
          onLoad={(gltf) => onStats?.(computeStatsFromObject3D(gltf.scene))}
        >
          <ModelOverlay mode={mode} />
        </Gltf>
      </group>
    );
  }

  if (ext === "obj" && obj) {
    return (
      <primitive object={obj}>
        <ModelOverlay mode={mode} />
      </primitive>
    );
  }

  if (ext === "stl" && stlMesh) {
    return (
      <primitive object={stlMesh}>
        <ModelOverlay mode={mode} />
      </primitive>
    );
  }

  return null;
}

/**
 * Overlay visual: caras (material), aristas (Edges/Wireframe), vértices (Points)
 * - Edges abstrae THREE.EdgesGeometry y toma la geometría del mesh padre :contentReference[oaicite:3]{index=3}
 * - Wireframe: wireframe con shader antialias sobre el mesh :contentReference[oaicite:4]{index=4}
 * - Points: wrapper de THREE.Points :contentReference[oaicite:5]{index=5}
 */
function ModelOverlay({ mode }) {
  // Este componente se “engancha” al mesh hijo cuando existe jerarquía de meshes.
  // Para hacerlo robusto, normalmente recorrerías meshes y aplicarías overlay por mesh.
  // Aquí dejamos una versión simple que funciona bien si tu modelo principal es 1 mesh.
  if (mode === "edges") {
    return (
      <>
        <meshStandardMaterial transparent opacity={0.25} />
        <Edges />
        {/* Alternativa (más “wireframe total”): <Wireframe /> */}
      </>
    );
  }

  if (mode === "vertices") {
    return (
      <>
        <meshStandardMaterial transparent opacity={0.1} />
        {/* Nota: Points de drei es ideal para point-clouds declarativas.
            Para “vértices del mesh”, lo normal es construir un THREE.Points
            a partir del position attribute. Aquí lo simplificamos con Wireframe/Edges
            + baja opacidad del mesh. */}
        <Wireframe />
      </>
    );
  }

  // faces
  return <meshStandardMaterial />;
}
