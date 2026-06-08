import { ImageResponse } from "next/og";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

export const alt = `${SITE_NAME} — Shift Swapping Platform`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #050505 0%, #14120d 50%, #0a0908 100%)",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(212,175,55,0.15)",
              border: "2px solid rgba(212,175,55,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ↻
          </div>
          <span style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            Swap<span style={{ color: "#d4af37" }}>Board</span>
          </span>
        </div>
        <p
          style={{
            fontSize: "36px",
            fontWeight: 700,
            lineHeight: 1.25,
            maxWidth: "900px",
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          Shift swapping platform for restaurants, healthcare & retail
        </p>
        <p
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
            maxWidth: "860px",
          }}
        >
          {DEFAULT_DESCRIPTION}
        </p>
        <p
          style={{
            marginTop: "40px",
            fontSize: "20px",
            color: "#d4af37",
            fontWeight: 600,
          }}
        >
          swapboard.ca · 14-day free trial
        </p>
      </div>
    ),
    { ...size }
  );
}
