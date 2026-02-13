export default function UI({ mode, setMode, modelUrl, setModelUrl, stats }) {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        left: 12,
        top: 12,
        padding: 12,
        borderRadius: 8,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        width: 320,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Modelo (URL en /public)</div>
        <input
          value={modelUrl}
          onChange={(e) => setModelUrl(e.target.value)}
          style={{ width: "100%", padding: 6, borderRadius: 6 }}
          placeholder="/models/model.glb"
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setMode("faces")} disabled={mode === "faces"}>
          Caras
        </button>
        <button onClick={() => setMode("edges")} disabled={mode === "edges"}>
          Aristas
        </button>
        <button
          onClick={() => setMode("vertices")}
          disabled={mode === "vertices"}
        >
          Vértices
        </button>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.4 }}>
        <div><b>Meshes:</b> {stats.meshes}</div>
        <div><b>Vértices:</b> {stats.vertices}</div>
        <div><b>Triángulos:</b> {stats.triangles}</div>
      </div>
    </div>
  );
}
