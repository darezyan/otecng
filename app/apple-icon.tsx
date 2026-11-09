import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the OTEC mark in white on the site's zinc-950.
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
          background: "#09090b",
        }}
      >
        <svg width="90" height="120" viewBox="0 0 227 304" fill="#ffffff">
          <path d="M0 0H75V57.5Q37 43 0 2Z" />
          <path d="M152 0H227V2Q190 43 152 57.5Z" />
          <path d="M0 74Q113.5 148 227 74V304H152V194Q113.5 180 75 194V304H0Z" />
        </svg>
      </div>
    ),
    size
  );
}
