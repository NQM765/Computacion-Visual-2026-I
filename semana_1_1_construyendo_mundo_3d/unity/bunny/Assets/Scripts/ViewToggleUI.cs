using UnityEngine;

public class ViewToggleUI : MonoBehaviour
{
    public WireframeGizmo wire;

    public void SetSolid()
    {
        if (wire != null) wire.showWire = false;
    }

    public void SetWire()
    {
        if (wire != null) wire.showWire = true;
    }
}
