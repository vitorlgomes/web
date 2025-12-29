"use client";

import dynamic from "next/dynamic";
import styles from "../styles.module.css";

const ModelViewer3D = dynamic(() => import("./ModelViewer3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "600px",
        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "18px",
      }}
    >
      Loading 3D Model...
    </div>
  ),
});

export default function ModelSection() {
  return (
    <section className={styles.modelSection}>
      <div className={styles.modelContent}>
        <div className={styles.modelLeft}>
          <h3 className={styles.modelLabel}>Tecnologia</h3>
          <h2 className={styles.modelTitle}>
            Conheça o Nexus Touch Desktop
          </h2>
          <p className={styles.modelDesc}>
            A solução mais avançada para pedidos e pagamentos. Com tecnologia de
            ponta, interface intuitiva e total integração com seu sistema POS,
            o Nexus Touch Desktop transforma a experiência do seu cliente.
          </p>
          <div className={styles.modelFeatures}>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <div>
                <h4>Interface Responsiva</h4>
                <p>Design moderno e fácil de usar</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <div>
                <h4>Integração Total</h4>
                <p>Compatible com todos os sistemas</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span>
              <div>
                <h4>Suporte 24/7</h4>
                <p>Ajuda sempre disponível</p>
              </div>
            </div>
          </div>
          <button className={styles.modelCTA}>Saiba Mais</button>
        </div>
        <div className={styles.modelRight}>
          <ModelViewer3D
            modelPath="/nexus_touch_desktop.gltf"
            height={600}
            scale={1.5}
          />
        </div>
      </div>
    </section>
  );
}
