import type { CSSProperties } from "react";
import { activitySignals } from "./enterpriseAssets";
import { CinematicImage } from "./CinematicImage";
import styles from "./signal-prism-homepage.module.css";

const groups = [
  {
    id: "sport",
    label: "运动轨道",
    proof: "有强度、有时间、有公开场地",
    ids: ["night-run", "gym", "climbing", "badminton", "cycling"]
  },
  {
    id: "social",
    label: "低压力轨道",
    proof: "先有场景，再慢慢靠近",
    ids: ["park-picnic", "board-game", "coffee", "dog-walk", "camping-bbq"]
  },
  {
    id: "interest",
    label: "兴趣轨道",
    proof: "共同目的比头像更可靠",
    ids: ["cos-partner", "cos-photo", "gaming", "music-festival", "hiking"]
  }
];

export function ActivityOrbit() {
  return (
    <div className={styles.activityOrbit} data-orbit data-section-reveal>
      {groups.map((group, groupIndex) => (
        <div className={styles.orbitLane} data-orbit-lane={group.id} key={group.id} style={{ "--lane": groupIndex } as CSSProperties}>
          <div className={styles.orbitLaneHeader}>
            <span>{group.label}</span>
            <strong>{group.proof}</strong>
          </div>
          <div className={styles.orbitTrack}>
            {group.ids.map((id, index) => {
              const image = activitySignals.find((item) => item.id === id);
              if (!image) return null;
              return (
                <article className={styles.activityCard} key={id} style={{ "--card-index": index } as CSSProperties}>
                  <CinematicImage image={image} />
                  <div className={styles.activityCopy}>
                    <strong>{image.title}</strong>
                    <span>{image.need}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
