import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141a2b",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#e2611d" strokeWidth="3.8" />
          <circle cx="16" cy="16" r="2.2" fill="#fff" />
        </svg>
      </div>
    ),
    size
  );
}
