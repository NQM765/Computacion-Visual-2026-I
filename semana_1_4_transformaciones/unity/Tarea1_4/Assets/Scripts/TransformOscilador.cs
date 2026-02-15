using UnityEngine;

public class TransformOscilador : MonoBehaviour
{
    [Header("Traslacion aleatoria")]
    [SerializeField] private float intervaloTraslacion = 2.0f;
    [SerializeField] private float distanciaMin = 0.5f;
    [SerializeField] private float distanciaMax = 2.0f;

    [Header("Rotacion constante")]
    [SerializeField] private Vector3 ejeRotacion = new Vector3(0f, 1f, 0f);
    [SerializeField] private float velocidadRotacion = 90f;

    [Header("Escalado oscilante")]
    [SerializeField] private float escalaBase = 1f;
    [SerializeField] private float amplitudEscala = 0.25f;
    [SerializeField] private float frecuenciaEscala = 1f;

    private float temporizadorTraslacion;
    private Vector3 escalaInicial;

    private void Start()
    {
        escalaInicial = transform.localScale;
        temporizadorTraslacion = intervaloTraslacion;
    }

    private void Update()
    {
        AplicarTraslacionAleatoria();
        AplicarRotacionConstante();
        AplicarEscalaOscilante();
    }

    private void AplicarTraslacionAleatoria()
    {
        temporizadorTraslacion -= Time.deltaTime;
        if (temporizadorTraslacion > 0f) return;

        float distancia = Random.Range(distanciaMin, distanciaMax);
        float direccion = Random.value < 0.5f ? -1f : 1f;
        bool moverEnX = Random.value < 0.5f;

        Vector3 desplazamiento = moverEnX
            ? new Vector3(distancia * direccion, 0f, 0f)
            : new Vector3(0f, distancia * direccion, 0f);

        transform.Translate(desplazamiento, Space.World);
        temporizadorTraslacion = intervaloTraslacion;
    }

    private void AplicarRotacionConstante()
    {
        transform.Rotate(ejeRotacion * velocidadRotacion * Time.deltaTime, Space.Self);
    }

    private void AplicarEscalaOscilante()
    {
        float factor = escalaBase + Mathf.Sin(Time.time * frecuenciaEscala) * amplitudEscala;
        transform.localScale = escalaInicial * factor;
    }
}
