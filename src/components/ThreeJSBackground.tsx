"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random";
import { useState, useRef } from "react";
import * as THREE from "three";

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(5000), { radius: 1.5 }) as Float32Array
  );

  useFrame((_state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#30f8ff"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function ThreeJSBackground() {
  return (
    <div className="fixed inset-0 z-0 h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  );
};
