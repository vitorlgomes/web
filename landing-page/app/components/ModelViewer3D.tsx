"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelPath: string;
  width?: string | number;
  height?: string | number;
  scale?: number;
}

function Model({ path, scale = 1 }: { path: string; scale: number }) {
  const gltf = useGLTF(path);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    if (!gltf.scene) return;

    // Centraliza e escala (mantido)
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    gltf.scene.scale.multiplyScalar(scale);

    // Corrige orientação do BossTab
    gltf.scene.rotation.x = -Math.PI / 2;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/lirio-tablet-ui.png", (texture) => {
      // Configuração base
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.anisotropy = 8;

      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // 🔥 FIX DEFINITIVO DO ZOOM / CORTE
      texture.center.set(0.5, 0.5);
      texture.rotation = 0;
      texture.matrixAutoUpdate = false;

      const imageAspect = texture.image.width / texture.image.height;

      // Aspect da tela do BossTab (ajustável se necessário)
      const screenAspect = 4 / 3;

      if (imageAspect > screenAspect) {
        // imagem mais larga
        texture.matrix.setUvTransform(
          0,
          0,
          screenAspect / imageAspect,
          1,
          0,
          0.5,
          0.5,
        );
      } else {
        // imagem mais alta
        texture.matrix.setUvTransform(
          0,
          0,
          1,
          imageAspect / screenAspect,
          0,
          0.5,
          0.5,
        );
      }

      // Aplica textura SOMENTE na tela
      gltf.scene.traverse((child: any) => {
        if (!child.isMesh) return;

        const matName = child.material?.name?.toLowerCase() || "";

        if (
          matName.includes("glass") ||
          matName.includes("screen") ||
          matName.includes("display")
        ) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            emissiveMap: texture,
            emissiveIntensity: 0.45,
            roughness: 0.15,
            metalness: 0,
            toneMapped: false,
          });
        }
      });

      setTextureLoaded(true);
    });
  }, [gltf, scale]);

  return <primitive object={gltf.scene} />;
}

export default function ModelViewer3D({
  modelPath,
  width = "100%",
  height = 600,
  scale = 1.5,
}: ModelViewerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <div
        style={{
          width,
          height: typeof height === "number" ? `${height}px` : height,
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 3.5], fov: 35 }}
        dpr={[1, 1.5]}
        style={{
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={0.9} />

        <OrbitControls
          autoRotate
          autoRotateSpeed={0.6}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3}
        />

        <Model path={modelPath} scale={scale} />
      </Canvas>
    </div>
  );
}
