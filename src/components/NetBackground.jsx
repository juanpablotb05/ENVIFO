import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min.js";

const NetLayout = ({ children }) => {
  const vantaRef = useRef(null);

  useEffect(() => {
    const effect = NET({
       el: vantaRef.current,
  THREE: THREE,
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.0,
  minWidth: 200.0,
  scale: 1.0,
  scaleMobile: 1.0,

  
  color: 0xffffff,          // Líneas blancas 
  backgroundColor: 0x000000, // Fondo naranja corporativo
  points: 15.0,             // Más puntos para un efecto más elegante
  maxDistance: 25.0,        // Líneas más largas y suaves
  spacing: 18.0           // separación de la red
    });

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="m-0 p-0 box-border flex justify-center items-center min-h-screen"
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Contenido centrado sobre el fondo */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default NetLayout;
