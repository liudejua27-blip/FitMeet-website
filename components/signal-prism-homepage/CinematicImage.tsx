import type { EnterpriseImage } from "./enterpriseAssets";
import styles from "./signal-prism-homepage.module.css";

export function CinematicImage({ image, priority = false }: { image: EnterpriseImage; priority?: boolean }) {
  return (
    <figure className={styles.cinematicImage} data-image-role={image.role}>
      <img src={image.src} alt={image.alt} loading={priority ? "eager" : "lazy"} decoding="async" />
      <figcaption>
        <span>{image.role}</span>
        <strong>{image.title}</strong>
      </figcaption>
    </figure>
  );
}
