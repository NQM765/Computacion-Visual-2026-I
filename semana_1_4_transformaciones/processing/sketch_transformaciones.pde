void setup() {
  size(900, 650, P3D);
  rectMode(CENTER);
  textSize(16);
}

void draw() {
  background(18, 22, 30);
  lights();

  float t = millis() * 0.001f;

  // Plataforma fija (sin afectar el cubo animado).
  pushMatrix();
  translate(width * 0.5f, height * 0.82f, -120);
  fill(230, 120, 70);
  noStroke();
  box(340, 18, 160);
  popMatrix();

  // Cubo con transformaciones animadas en el tiempo.
  pushMatrix();
  translate(
    width * 0.5f + sin(t * 1.5f) * 180,
    height * 0.5f + sin(t * 2.1f) * 45,
    cos(t * 1.2f) * 140
  );

  rotateX(t * 0.9f);
  rotateY(t * 1.4f);
  rotateZ(sin(t) * 0.45f);

  float s = 1.0f + 0.35f * sin(t * 2.6f);
  scale(s);

  fill(80, 170, 255);
  stroke(245);
  strokeWeight(2);
  box(130);
  popMatrix();

  fill(240);
  text("frameCount: " + frameCount, 20, 30);
  text("t (seg): " + nf(t, 1, 2), 20, 55);
}
