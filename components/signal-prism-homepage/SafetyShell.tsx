import type { CSSProperties } from "react";
import { safetyRules, signalImages } from "./enterpriseAssets";
import { CinematicImage } from "./CinematicImage";
import styles from "./signal-prism-homepage.module.css";

export function SafetyShell() {
  return (
    <div className={styles.safetyShell} data-safety-shell>
      <div className={styles.safetyVisual}>
        <CinematicImage image={signalImages.safety} />
        <div className={styles.boundaryRings} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={styles.safetyRules}>
        {safetyRules.map((rule, index) => (
          <span key={rule} style={{ "--rule-index": index } as CSSProperties}>{rule}</span>
        ))}
      </div>
    </div>
  );
}
