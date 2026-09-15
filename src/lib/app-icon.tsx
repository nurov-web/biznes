import { ImageResponse } from "next/og";

/** Нишони барнома — ҳарфи B дар кабуди бренд. */
export function appIconPng(size: number): ImageResponse {
  const fontSize = Math.round(size * 0.54);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1565c0",
          color: "#ffffff",
          fontSize,
          fontWeight: 700,
          fontFamily: "Arial",
          letterSpacing: "-0.06em",
        }}
      >
        B
      </div>
    ),
    { width: size, height: size },
  );
}
