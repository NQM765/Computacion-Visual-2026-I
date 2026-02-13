import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import BunnyOBJ from "./BunnyOBJ";

function UI({ mode, setMode, stats }) {
  return (
    <div style={{
      position: "absolute", zIndex: 10, left: 12, top: 12,
      padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.6)",
      color: "white", fontFamily: "system-ui", width: 320
    }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setMode("faces")} disabled={mode === "faces"}>Caras</button>
        <button onClick={() => setMode("edges")} disabled={mode === "edges"}>Aristas</button>
        <button onClick={() => setMode("vertices")} disabled={mode === "vertices"}>Vértices</button>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.4 }}>
        <div><b>Vértices:</b> {stats.vertices}</div>
        <div><b>Triángulos:</b> {stats.triangles}</div>
        <div><b>Meshes (en el OBJ):</b> {stats.meshes}</div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.9, marginTop: 10 }}>
        Modelo: /models/bunny.obj
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("faces");
  const [stats, setStats] = useState({ meshes: 0, vertices: 0, triangles: 0 });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <UI mode={mode} setMode={setMode} stats={stats} />

      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <BunnyOBJ url="/models/bunny.obj" mode={mode} onStats={setStats} />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
