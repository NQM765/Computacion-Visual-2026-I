using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ParentTransformUIController : MonoBehaviour
{
    [Header("Target")]
    public Transform parentTarget; // Asigna aquí el objeto Padre

    [Header("Sliders - Position (Local)")]
    public Slider posX, posY, posZ;

    [Header("Sliders - Rotation (Local Euler)")]
    public Slider rotX, rotY, rotZ;

    [Header("Sliders - Scale (Local)")]
    public Slider scaleX, scaleY, scaleZ;

    [Header("Readout (optional)")]
    public TMP_Text readoutText; // Texto para mostrar valores (opcional)

    [Header("Animation (bonus)")]
    public bool animate = false;
    public float animAmplitude = 1.0f;
    public float animSpeed = 1.0f;

    private Vector3 initialLocalPos;
    private Vector3 initialLocalEuler;
    private Vector3 initialLocalScale;

    void Start()
    {
        if (parentTarget == null) parentTarget = transform;

        // Guardar estado inicial para reinicio
        initialLocalPos = parentTarget.localPosition;
        initialLocalEuler = parentTarget.localEulerAngles;
        initialLocalScale = parentTarget.localScale;

        // Inicializar sliders con valores actuales
        SetSlidersFromTransform();

        // Conectar eventos onValueChanged (cada vez que cambie un slider, aplicamos)
        posX.onValueChanged.AddListener(_ => ApplyFromSliders());
        posY.onValueChanged.AddListener(_ => ApplyFromSliders());
        posZ.onValueChanged.AddListener(_ => ApplyFromSliders());

        rotX.onValueChanged.AddListener(_ => ApplyFromSliders());
        rotY.onValueChanged.AddListener(_ => ApplyFromSliders());
        rotZ.onValueChanged.AddListener(_ => ApplyFromSliders());

        scaleX.onValueChanged.AddListener(_ => ApplyFromSliders());
        scaleY.onValueChanged.AddListener(_ => ApplyFromSliders());
        scaleZ.onValueChanged.AddListener(_ => ApplyFromSliders());

        UpdateReadout();
    }

    void Update()
    {
        if (!animate) return;

        // Animación simple: “bamboleo” en X local alrededor de la posición inicial
        var t = Time.time * animSpeed;
        var p = parentTarget.localPosition;
        p.x = initialLocalPos.x + Mathf.Sin(t) * animAmplitude;
        parentTarget.localPosition = p;

        // Mantener sliders sincronizados (opcional, pero útil para ver el valor)
        posX.SetValueWithoutNotify(parentTarget.localPosition.x);
        UpdateReadout();
    }

    public void ApplyFromSliders()
    {
        // Local: para que se note la jerarquía (hijos heredan)
        parentTarget.localPosition = new Vector3(posX.value, posY.value, posZ.value);
        parentTarget.localEulerAngles = new Vector3(rotX.value, rotY.value, rotZ.value);
        parentTarget.localScale = new Vector3(scaleX.value, scaleY.value, scaleZ.value);

        UpdateReadout();
    }

    public void SetSlidersFromTransform()
    {
        var lp = parentTarget.localPosition;
        var le = parentTarget.localEulerAngles;
        var ls = parentTarget.localScale;

        posX.SetValueWithoutNotify(lp.x);
        posY.SetValueWithoutNotify(lp.y);
        posZ.SetValueWithoutNotify(lp.z);

        // Nota: localEulerAngles va 0..360; si usas sliders -180..180,
        // puedes normalizar. Para la tarea, suele bastar usarlo directo.
        rotX.SetValueWithoutNotify(le.x);
        rotY.SetValueWithoutNotify(le.y);
        rotZ.SetValueWithoutNotify(le.z);

        scaleX.SetValueWithoutNotify(ls.x);
        scaleY.SetValueWithoutNotify(ls.y);
        scaleZ.SetValueWithoutNotify(ls.z);

        UpdateReadout();
    }

    public void ToggleAnimation()
    {
        animate = !animate;
        UpdateReadout();
    }

    public void ResetTransform()
    {
        animate = false;
        parentTarget.localPosition = initialLocalPos;
        parentTarget.localEulerAngles = initialLocalEuler;
        parentTarget.localScale = initialLocalScale;

        SetSlidersFromTransform();
        UpdateReadout();
    }

    private void UpdateReadout()
    {
        var lp = parentTarget.localPosition;
        var lr = parentTarget.localEulerAngles;
        var ls = parentTarget.localScale;

        // Mostrar en UI si hay TMP_Text; si no, a consola
        string msg =
            $"PARENT (LOCAL)\n" +
            $"Pos: {lp}\n" +
            $"Rot: {lr}\n" +
            $"Scl: {ls}\n" +
            $"Anim: {animate}";

        if (readoutText != null) readoutText.text = msg;
        else Debug.Log(msg);
    }
}
