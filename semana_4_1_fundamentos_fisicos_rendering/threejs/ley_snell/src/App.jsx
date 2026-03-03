import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import { Leva, useControls } from "leva";
import * as THREE from "three";

function SnellSimulation() {

  const { angleDeg, n1, n2 } = useControls({
    angleDeg: { value: 30, min: 0, max: 89 },
    n1: { value: 1.0, min: 1.0, max: 2.5, step: 0.01 },
    n2: { value: 1.5, min: 1.0, max: 2.5, step: 0.01 },
  });

 const data = useMemo(() => {

  const theta1 = THREE.MathUtils.degToRad(angleDeg);
  const origin = new THREE.Vector3(0, 0, 0);

  // ===============================
  // RAYO INCIDENTE (desde arriba)
  // ===============================
  const incidentDir = new THREE.Vector3(
    Math.sin(theta1),
    -Math.cos(theta1),
    0
  );

  const incidentStart = origin.clone().add(
    incidentDir.clone().multiplyScalar(-5)
  );

  // ===============================
  // REFLEXIÓN (ángulo igual al incidente)
  // ===============================
  const reflectedDir = new THREE.Vector3(
    Math.sin(theta1),
    Math.cos(theta1),
    0
  );

  const reflectedEnd = origin.clone().add(
    reflectedDir.multiplyScalar(5)
  );

  // ===============================
  // LEY DE SNELL
  // ===============================

  const sinTheta2 = (n1 / n2) * Math.sin(theta1);

  let refractedEnd = null;
  let totalInternalReflection = false;

  if (sinTheta2 <= 1) {

    const theta2 = Math.asin(sinTheta2);

    const refractedDir = new THREE.Vector3(
      Math.sin(theta2),
      -Math.cos(theta2),
      0
    );

    refractedEnd = origin.clone().add(
      refractedDir.multiplyScalar(5)
    );

  } else {
    totalInternalReflection = true;
  }

  return {
    incidentStart,
    reflectedEnd,
    refractedEnd,
    totalInternalReflection
  };

}, [angleDeg, n1, n2]);

  return (
    <>
      {/* Interfaz */}
      <Line points={[[-6, 0, 0], [6, 0, 0]]} color="white" />

      {/* Normal */}
      <Line points={[[0, -6, 0], [0, 6, 0]]} color="gray" />

      {/* Rayo incidente */}
      <Line
        points={[
          [data.incidentStart.x, data.incidentStart.y, 0],
          [0, 0, 0]
        ]}
        color="yellow"
      />
      <Text
        position={[data.incidentStart.x, data.incidentStart.y, 0]}
        fontSize={0.4}
        color="yellow"
        anchorX="center"
        anchorY="bottom"
      >
        Incidente
      </Text>

      {/* Rayo reflejado */}
      <Line
        points={[
          [0, 0, 0],
          [data.reflectedEnd.x, data.reflectedEnd.y, 0]
        ]}
        color="lime"
      />
      <Text
        position={[data.reflectedEnd.x, data.reflectedEnd.y, 0]}
        fontSize={0.4}
        color="lime"
        anchorX="center"
        anchorY="bottom"
      >
        Reflejado
      </Text>

      {/* Rayo refractado */}
      {!data.totalInternalReflection && data.refractedEnd && (
        <>
          <Line
            points={[
              [0, 0, 0],
              [data.refractedEnd.x, data.refractedEnd.y, 0]
            ]}
            color="cyan"
          />
          <Text
            position={[data.refractedEnd.x, data.refractedEnd.y, 0]}
            fontSize={0.4}
            color="cyan"
            anchorX="center"
            anchorY="top"
          >
            Refractado
          </Text>
        </>
      )}

      {data.totalInternalReflection && (
        <Text
          position={[0, -2, 0]}
          fontSize={0.5}
          color="red"
          anchorX="center"
        >
          Reflexión Total Interna
        </Text>
      )}
    </>
  );
}

export default function App() {
  return (
    <>
      <Leva />
      <Canvas 
        orthographic camera={{ zoom: 80, position: [0, 0, 10] }}
        style={{ width: '100vw', height: '100vh' }}
        >
        <color attach="background" args={["#111"]} />
        <SnellSimulation />
      </Canvas>
    </>
  );
}