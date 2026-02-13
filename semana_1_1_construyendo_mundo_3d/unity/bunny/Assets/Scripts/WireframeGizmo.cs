using UnityEngine;

[DisallowMultipleComponent]
public class WireframeGizmo : MonoBehaviour
{
    public bool showWire = true;
    public bool onlyWhenSelected = true;
    public Color color = Color.cyan;

    // Si el OBJ tiene varios meshes en hijos, esto lo resuelve:
    public bool includeChildren = true;

    void OnDrawGizmos()
    {
        if (onlyWhenSelected) return;
        DrawWire();
    }

    void OnDrawGizmosSelected()
    {
        if (!onlyWhenSelected) return;
        DrawWire();
    }

    void DrawWire()
    {
        if (!showWire) return;

        Gizmos.color = color;

        if (includeChildren)
        {
            // Incluye hijos (típico en OBJ importados)
            var meshFilters = GetComponentsInChildren<MeshFilter>(true);
            foreach (var mf in meshFilters)
            {
                if (mf == null || mf.sharedMesh == null) continue;

                // OJO: usa el transform del MeshFilter (mf.transform), no el del padre.
                Gizmos.DrawWireMesh(
                    mf.sharedMesh,
                    mf.transform.position,
                    mf.transform.rotation,
                    mf.transform.lossyScale
                );
            }
        }
        else
        {
            var mf = GetComponent<MeshFilter>();
            if (mf == null || mf.sharedMesh == null) return;

            Gizmos.DrawWireMesh(
                mf.sharedMesh,
                transform.position,
                transform.rotation,
                transform.lossyScale
            );
        }
    }
}
