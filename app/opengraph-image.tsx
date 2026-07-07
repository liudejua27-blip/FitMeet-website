import { ImageResponse } from "next/og";

export const alt = "FitMeet Social World - 一句想法，变成一次真实到场";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "54px 58px",
          color: "#fff7ef",
          background:
            "radial-gradient(circle at 72% 28%, rgba(255,43,27,0.32), transparent 270px), radial-gradient(circle at 18% 78%, rgba(255,110,45,0.18), transparent 260px), linear-gradient(135deg, #050505 0%, #0b0503 54%, #030303 100%)",
          fontFamily: "PingFang SC, Hiragino Sans GB, Avenir Next, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.42,
            background:
              "linear-gradient(108deg, transparent 0 18%, rgba(255,43,27,0.24) 18.3% 18.9%, transparent 19.2% 46%, rgba(255,255,255,0.08) 46.2% 46.7%, transparent 47%), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 72px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 88,
            right: 88,
            top: 312,
            height: 2,
            background: "linear-gradient(90deg, rgba(255,43,27,0), rgba(255,43,27,0.88), rgba(255,255,255,0.42), rgba(255,43,27,0))",
          }}
        />
        {[210, 430, 700, 940].map((left, index) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left,
              top: index % 2 === 0 ? 286 : 330,
              width: 16,
              height: 16,
              border: "1px solid rgba(255,255,255,0.42)",
              background: "#ff2b1b",
              boxShadow: "0 0 28px rgba(255,43,27,0.72)",
              transform: "rotate(45deg)",
            }}
          />
        ))}

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff7ef",
                background: "linear-gradient(135deg, #ff2b1b, #5e0b06)",
                fontSize: "38px",
                fontWeight: 950,
              }}
            >
              F
            </div>
            <div style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.04em" }}>FitMeet</div>
          </div>
          <div
            style={{
              padding: "12px 16px",
              border: "1px solid rgba(255,43,27,0.48)",
              color: "#ffd4c7",
              background: "rgba(255,43,27,0.12)",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            Social World
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              fontSize: "112px",
              lineHeight: 0.78,
              letterSpacing: "-0.11em",
              fontWeight: 950,
              textTransform: "uppercase",
            }}
          >
            Social World
          </div>
          <div
            style={{
              maxWidth: "700px",
              color: "rgba(255,247,239,0.76)",
              fontSize: "34px",
              lineHeight: 1.12,
              fontWeight: 850,
              letterSpacing: "-0.04em",
            }}
          >
            一句想法，变成一次真实到场。
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "rgba(255,232,222,0.78)",
            fontSize: "22px",
            fontWeight: 900,
          }}
        >
          <span>想法</span>
          <span style={{ color: "#ff5b2f" }}>→</span>
          <span>公开场景</span>
          <span style={{ color: "#ff5b2f" }}>→</span>
          <span>边界</span>
          <span style={{ color: "#ff5b2f" }}>→</span>
          <span>计划</span>
          <span style={{ color: "#ff5b2f" }}>→</span>
          <span>同频到场</span>
        </div>
      </div>
    ),
    size
  );
}
