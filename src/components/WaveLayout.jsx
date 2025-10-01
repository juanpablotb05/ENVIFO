import React from "react";
import dynamic from "next/dynamic";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

const WaveLayout = ({ children }) => {
  let size;

  const setup = (p5, canvasParentRef) => {
    size = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * 0.96);
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.noFill();
    p5.noiseSeed(p5.random(100));
    p5.mouseY = p5.height / 2;
  };

  const windowResized = (p5) => {
    size = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * 0.96);
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.noiseSeed(p5.random(100));
    draw(p5);
  };

  const draw = (p5) => {
    p5.clear();
    const _o = p5.millis() * 0.001;

    const amount = Math.max(1, (p5.mouseY / p5.windowWidth) * 40);
    const ampl = p5.height * 0.1;

    for (let k = 0; k < amount; k++) {
      p5.beginShape();
      const offset = (1 - k / amount) * 4;
      const detail = Math.max(4, (p5.mouseX / p5.windowWidth) * 60);

      for (let i = 0; i < p5.width + detail; i += detail) {
        let y = p5.height * 0.5;
        y += Math.sin(i * 0.01 - _o + offset) * ampl;
        y += Math.sin(i * 0.02 - _o + offset) * ampl;
        y +=
          Math.sin(
            i * 0.04 -
              _o +
              10 +
              offset +
              p5.noise(_o * 0.1 + (i / p5.width) * 5) * 10
          ) * ampl;
        p5.vertex(i, y);
      }

      p5.stroke(255, 255, 255, (k / (amount - 1)) * 255);
      p5.endShape();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />
      <div className="absolute z-10">{children}</div>
    </div>
  );
};

export default WaveLayout;
