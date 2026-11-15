import { ImageResponse } from "next/og";

export const alt = "AstraFlow — Engineered Clarity for .NET";
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f7f3eb",
          color: "#082c26",
          padding: "56px 72px",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #d8d0c2",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <svg
              width="64"
              height="51"
              viewBox="0 0 270 215"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M129 7 H173 L222 87 H181 L152 40 L98 129 C92 139 87 143 77 143 H44 Z"
                fill="#092c27"
              />
              <path
                d="M30 166 H91 C104 166 111 160 119 148 L137 116 C147 102 157 98 169 98 H230 L249 128 H177 C165 128 160 134 154 144 L132 180 C119 196 107 200 89 200 H10 Z"
                fill="#ef6843"
              />
              <path d="M199 145 H237 L259 182 H220 Z" fill="#0b302a" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#082c26",
                }}
              >
                AstraFlow
              </span>
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.2em",
                  color: "#617267",
                  fontFamily: "monospace",
                }}
              >
                ENGINEERED CLARITY
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              borderRadius: "6px",
              border: "1px solid #d8d0c2",
              backgroundColor: "#fffdf7",
              fontSize: "14px",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              color: "#2f5b4e",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#f25e3b",
              }}
            />
            OPEN SOURCE / .NET
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "88px",
              fontWeight: 800,
              lineHeight: 0.96,
              letterSpacing: "-0.05em",
              color: "#082c26",
            }}
          >
            <span>Control the flow</span>
            <span style={{ color: "#f25e3b" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "44px",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              color: "#b73921",
              letterSpacing: "-0.03em",
            }}
          >
            Make intent explicit.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              lineHeight: 1.45,
              color: "#465f53",
              maxWidth: "960px",
            }}
          >
            Focused .NET packages for request dispatch, explicit object mapping,
            source generators, diagnostics, and test workflows.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #d8d0c2",
            paddingTop: "22px",
            fontSize: "15px",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            color: "#617267",
          }}
        >
          <span>MIT LICENSED · MODULAR PACKAGES · DOCUMENTED APIS</span>
          <span style={{ color: "#b73921", fontWeight: 700 }}>
            ASTRAFLOW.DEV
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
