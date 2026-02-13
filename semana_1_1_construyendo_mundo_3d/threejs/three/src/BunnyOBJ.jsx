import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Edges } from "@react-three/drei";
import { useMemo, useEffect } from "react";

// Helper: une geometrías en una sola BufferGeometry (sin depender de BufferGeometryUtils)
function mergeGeometries(geoms) {
  // Merge simple usando BufferGeometryUtils sería ideal, pero esto funciona bien para Bunny:
  // convertimos a no-indexed y concatenamos atributos position/normal si existen.
  const positions = [];
  const normals = [];

  for (const g0 of geoms) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    const p = g.getAttribute("position");
    if (p) positions.push(p.array);

    const n = g.getAttribute("normal");
    if (n) normals.push(n.array);
  }

  const posArray = Float32Array.from(positions.flatMap((a) => Array.from(a)));
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

  if (normals.length === positions.length && normals.length > 0) {
    const nArray = Float32Array.from(normals.flatMap((a) => Array.from(a)));
    geom.setAttribute("normal", new THREE.BufferAttribute(nArray, 3));
  } else {
    geom.computeVertexNormals();
  }

  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  return geom;
}

export default function BunnyOBJ({ url = "/models/bunny.obj", mode = "faces", onStats }) {
  const obj = useLoader(OBJLoader, url); // OBJLoader: loader para .obj :contentReference[oaicite:3]{index=3}

  const { geometry, center, scale, stats } = useMemo(() => {
    const geoms = [];
    let meshes = 0;
    let vertices = 0;
    let triangles = 0;

    obj.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshes += 1;
        const g = child.geometry;
        const pos = g.attributes?.position;
        if (pos) vertices += pos.count;
        if (g.index) triangles += g.index.count / 3;
        else if (pos) triangles += pos.count / 3;

        geoms.push(g);
      }
    });

    const merged = mergeGeometries(geoms);

    // Centrar y escalar para que siempre se vea
    const bs = merged.boundingSphere;
    const c = bs ? bs.center.clone() : new THREE.Vector3();
    const s = bs ? 1 / bs.radius : 1;

    return {
      geometry: merged,
      center: c,
      scale: s,
      stats: {
        meshes,
        vertices: Math.round(vertices),
        triangles: Math.round(triangles),
      },
    };
  }, [obj]);

  useEffect(() => {
    onStats?.(stats);
  }, [stats, onStats]);

  // Material base para “caras”
  const faceMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d9d9d9", roughness: 0.9, metalness: 0.0 }),
    []
  );

  // Points material para “vértices”
  const pointsMaterial = useMemo(
    () => new THREE.PointsMaterial({ size: 0.01, color: "#ff3355" }),
    []
  );

  return (
    <group position={center.clone().multiplyScalar(-scale)} scale={scale}>
      {/* Caras */}
      {(mode === "faces" || mode === "edges" || mode === "vertices") && (
        <mesh geometry={geometry} material={faceMaterial}>
          {/* Aristas (Edges abstrae THREE.EdgesGeometry y toma geometry del parent mesh) */}
          {mode === "edges" && <Edges />}
          {/* Si quieres custom line material: <Edges><lineBasicMaterial /></Edges> */}
        </mesh>
      )}

      {/* Vértices reales */}
      {mode === "vertices" && (
        <points geometry={geometry} material={pointsMaterial} />
      )}
    </group>
  );
}
