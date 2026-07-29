import Image from "next/image";

import styles from "./fitmeet-complete.module.css";

export function FitMeetBrandIcon({
  size = 30,
  priority = false,
  src = "/brand/fitmeet-logo-v2.png",
}: {
  size?: number;
  priority?: boolean;
  src?: string;
}) {
  return (
    <Image
      className={styles.brandIcon}
      src={src}
      alt="FitMeet"
      width={size}
      height={size}
      priority={priority || size >= 40}
    />
  );
}
