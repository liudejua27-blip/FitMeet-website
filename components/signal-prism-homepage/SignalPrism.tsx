import styles from "./signal-prism-homepage.module.css";

export function SignalPrism({ mode = "awake" }: { mode?: "awake" | "parse" | "safe" | "final" }) {
  const showBrandMark = mode === "final";
  return (
    <div className={`${styles.signalPrism} ${styles[`signalPrism_${mode}`]}`} aria-hidden="true" data-prism-core>
      <div className={styles.prismOrbit} />
      <div className={styles.prismBody}>
        <span className={styles.prismFacetA} />
        <span className={styles.prismFacetB} />
        <span className={styles.prismFacetC} />
        <span className={styles.prismFacetD} />
        <span className={styles.prismF}>{showBrandMark ? "F" : <i className={styles.prismPulseDot} />}</span>
      </div>
      <svg className={styles.prismSvg} viewBox="0 0 300 300" role="presentation">
        <path d="M150 26 L252 88 L252 211 L150 274 L48 211 L48 88 Z" />
        <path d="M150 26 L150 274" />
        <path d="M48 88 L252 211" />
        <path d="M252 88 L48 211" />
        <circle cx="150" cy="150" r="54" />
      </svg>
    </div>
  );
}
