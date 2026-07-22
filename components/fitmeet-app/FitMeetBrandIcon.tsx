import Image from "next/image";

import styles from "./fitmeet-complete.module.css";

export function FitMeetBrandIcon({ size = 30, priority = false }: { size?: number; priority?: boolean }) {
  return (
    <Image
      className={styles.brandIcon}
      src="/brand/fitmeet-logo.png"
      alt="FitMeet"
      width={size}
      height={size}
      priority={priority || size >= 40}
    />
  );
}
