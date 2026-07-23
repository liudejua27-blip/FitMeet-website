import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type SceneProps = {
  end: number;
  image: string;
  index: number;
  label: string;
  start: number;
  title: string;
};

const Scene = ({ end, image, index, label, start, title }: SceneProps) => {
  const frame = useCurrentFrame();
  const localFrame = frame - start;
  const duration = end - start;
  const fadeIn = interpolate(localFrame, [0, 22], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(localFrame, [duration - 22, duration], [1, 0], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleProgress = interpolate(localFrame, [10, 38], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.035 + progress * 0.055}) translate3d(${index % 2 === 0 ? progress * -18 : progress * 16}px, ${progress * -12}px, 0)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.46) 0%, rgba(0,0,0,.08) 48%, rgba(0,0,0,.24) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 112,
          bottom: 108,
          color: "white",
          fontFamily: "Arial, PingFang SC, sans-serif",
          transform: `translateY(${(1 - titleProgress) * 48}px)`,
          opacity: titleProgress,
        }}
      >
        <div
          style={{
            marginBottom: 18,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: "-0.055em" }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

const scenes = [
  {
    start: 0,
    end: 92,
    image: "images/social-world/hero-city-motion.png",
    label: "Social World",
    title: "值得抵达的世界",
  },
  {
    start: 72,
    end: 164,
    image: "images/social-world/city-public-space.png",
    label: "Meet The City",
    title: "让城市留出相遇",
  },
  {
    start: 144,
    end: 236,
    image: "images/social-world/mountain-camp.png",
    label: "Arrive Together",
    title: "一起去更远的地方",
  },
  {
    start: 216,
    end: 308,
    image: "images/social-world/night-badminton.png",
    label: "After Dark",
    title: "让夜晚继续发生",
  },
  {
    start: 288,
    end: 360,
    image: "images/social-world/hero-city-motion.png",
    label: "FitMeet Agent",
    title: "让社交更简单",
  },
];

export const SocialWorldLoop = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const brandOpacity = interpolate(frame, [0, 20, durationInFrames - 22, durationInFrames - 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweep = interpolate(frame, [0, durationInFrames], [-520, 2260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#030303", overflow: "hidden" }}>
      {scenes.map((scene, index) => (
        <Scene key={`${scene.image}-${scene.start}`} {...scene} index={index} />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 68% 24%, rgba(17,231,207,.16), transparent 32%), radial-gradient(circle at 40% 82%, rgba(255,64,178,.12), transparent 35%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -360,
          left: sweep,
          width: 220,
          height: 1800,
          background: "linear-gradient(180deg, rgba(13,220,255,0), rgba(13,220,255,.18), rgba(255,64,178,0))",
          filter: "blur(34px)",
          transform: "rotate(23deg)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 56,
          left: 66,
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: "white",
          fontFamily: "Arial, sans-serif",
          opacity: brandOpacity,
        }}
      >
        <Img src={staticFile("brand/fitmeet-logo-v2.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>FITMEET</div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 72,
          bottom: 62,
          color: "rgba(255,255,255,.72)",
          fontFamily: "Arial, sans-serif",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.18em",
          opacity: brandOpacity,
        }}
      >
        YOUR SOCIAL AGENT · 2026
      </div>
    </AbsoluteFill>
  );
};
