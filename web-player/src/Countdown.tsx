import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  BackgroundLayer,
  HexGridOverlay,
} from "@compositions/shared/GameDayDesignSystem";

interface CountdownProps {
  eventDate: string;
  timezone: string;
  milestones: { label: string; time: string }[];
}

/** Compute remaining ms from a reference "now" to a target datetime. */
function msUntil(eventDate: string, time: string, nowMs: number): number {
  // Build target in local terms — we pass the real wall-clock via nowMs
  const target = new Date(`${eventDate}T${time}:00`).getTime();
  return Math.max(0, target - nowMs);
}

function formatHMS(ms: number): { h: string; m: string; s: string } {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export const CountdownComposition: React.FC<CountdownProps> = ({
  eventDate,
  timezone,
  milestones,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Use frame to create a ticking clock — each frame is 1/30s
  // We read the real clock at mount and advance by frame offset
  const nowMs = Date.now() + (frame / fps) * 0;
  // Actually, for a live player we just use Date.now() since it re-renders each frame
  const realNow = Date.now();

  // Pulsing glow animation
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.3, 1, 0.3]);
  const titleSlide = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: GD_DARK }}>
      <BackgroundLayer darken={0.85} />
      <HexGridOverlay />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${titleSlide}px)`,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: "white",
            letterSpacing: 1,
            textShadow: `0 0 40px ${GD_VIOLET}88`,
          }}
        >
          AWS Community GameDay Europe
        </div>
        <div
          style={{
            fontSize: 16,
            color: GD_ACCENT,
            marginTop: 8,
            opacity: 0.7,
          }}
        >
          {eventDate} • All times CET
        </div>
      </div>

      {/* Countdown rows */}
      <div
        style={{
          position: "absolute",
          top: 180,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {milestones.map((ms, i) => {
          const remaining = msUntil(eventDate, ms.time, realNow);
          const isLive = remaining === 0;
          const { h, m, s } = formatHMS(remaining);

          const rowDelay = i * 8;
          const rowOpacity = interpolate(frame, [rowDelay, rowDelay + 15], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const rowSlide = interpolate(frame, [rowDelay, rowDelay + 15], [20, 0], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          return (
            <div
              key={ms.time}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: rowOpacity,
                transform: `translateY(${rowSlide}px)`,
              }}
            >
              {/* Label */}
              <div
                style={{
                  width: 260,
                  textAlign: "right",
                  fontSize: 18,
                  fontWeight: 600,
                  color: isLive ? "#22c55e" : GD_ACCENT,
                }}
              >
                {ms.label}
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 400,
                    color: GD_PURPLE,
                    marginTop: 2,
                  }}
                >
                  {ms.time} CET
                </span>
              </div>

              {/* Timer or LIVE badge */}
              {isLive ? (
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#22c55e",
                    textShadow: `0 0 ${20 * pulse}px #22c55e88`,
                    width: 280,
                  }}
                >
                  ✓ LIVE
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, width: 280 }}>
                  {[
                    { val: h, unit: "h" },
                    { val: m, unit: "m" },
                    { val: s, unit: "s" },
                  ].map((t) => (
                    <div
                      key={t.unit}
                      style={{
                        background: `linear-gradient(180deg, ${GD_PURPLE}44, ${GD_DARK}cc)`,
                        border: `1px solid ${GD_VIOLET}33`,
                        borderRadius: 8,
                        padding: "8px 12px",
                        textAlign: "center",
                        minWidth: 64,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          fontFamily: "monospace",
                          color: GD_GOLD,
                          textShadow: `0 0 ${12 * pulse}px ${GD_ORANGE}66`,
                        }}
                      >
                        {t.val}
                      </div>
                      <div style={{ fontSize: 11, color: GD_ACCENT, marginTop: 2 }}>
                        {t.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          textAlign: "center",
          fontSize: 14,
          color: GD_PURPLE,
          opacity: interpolate(frame, [30, 50], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      >
        53+ User Groups • 20+ Countries • One GameDay
      </div>
    </AbsoluteFill>
  );
};
