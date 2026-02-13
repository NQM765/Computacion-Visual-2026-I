using UnityEngine;

[DisallowMultipleComponent]
public class BunnyMeshStats : MonoBehaviour
{
    [Header("Opciones")]
    public bool logOnStart = true;

    Mesh GetMesh()
    {
        var mf = GetComponent<MeshFilter>();
        if (mf != null && mf.sharedMesh != null) return mf.sharedMesh;
        return null;
    }

    void Start()
    {
        if (logOnStart) PrintStats();
    }

    [ContextMenu("Print Stats")]
    public void PrintStats()
    {
        var mesh = GetMesh();
        if (mesh == null)
        {
            Debug.LogWarning($"[{name}] No hay MeshFilter/sharedMesh.");
            return;
        }

        int vertices = mesh.vertexCount;                 // docs
        int trianglesTotal = mesh.triangles.Length / 3;  // índice por triángulo
        int subMeshes = mesh.subMeshCount;               // docs

        Debug.Log($"[{name}] Vertices: {vertices} | Triangles: {trianglesTotal} | SubMeshes: {subMeshes}");

        // Extra útil: triángulos por submesh sin alocar arrays grandes
        for (int i = 0; i < subMeshes; i++)
        {
            int triSub = (int)(mesh.GetIndexCount(i) / 3);
            Debug.Log($"   SubMesh {i}: {triSub} triangles");
        }
    }
}
