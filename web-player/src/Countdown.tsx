import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  BackgroundLayer,
  HexGridOverlay,
} from "@compositions/shared/GameDayDesignSystem";

const FONT = "'Amazon Ember', 'Inter', system-ui, sans-serif";
const LOGO = staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png");
const COMMUNITY_LOGO = staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png");

// ─── Icons ───────────────────────────────────────────────────────────
const AudioIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" />
  </svg>
);

const MutedIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = GD_PURPLE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" stroke={color} fill="none" />
    <line x1="17" y1="9" x2="23" y2="15" stroke={color} fill="none" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────
interface Milestone { label: string; time: string; id: string; desc: string }
interface CountdownProps { eventDate: string; timezone: string; milestones: Milestone[] }

function msUntil(eventDate: string, time: string): number {
  return Math.max(0, new Date(`${eventDate}T${time}:00`).getTime() - Date.now());
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

// ─── Timer digit ─────────────────────────────────────────────────────
const Digit: React.FC<{ v: string; u: string; pulse: number; big?: boolean }> = ({ v, u, pulse, big }) => (
  <div style={{
    background: `linear-gradient(180deg, ${GD_PURPLE}40, ${GD_DARK}dd)`,
    border: `1px solid ${GD_VIOLET}30`,
    borderRadius: big ? 14 : 8,
    padding: big ? "12px 18px" : "6px 10px",
    textAlign: "center",
    minWidth: big ? 90 : 48,
    backdropFilter: "blur(4px)",
  }}>
    <div style={{
      fontSize: big ? 56 : 28,
      fontWeight: 800,
      fontFamily: FONT,
      color: GD_GOLD,
      textShadow: `0 0 ${(big ? 20 : 10) * pulse}px ${GD_ORANGE}55`,
      lineHeight: 1,
    }}>{v}</div>
    <div style={{ fontSize: big ? 13 : 10, color: GD_ACCENT, marginTop: 3, textTransform: "uppercase", letterSpacing: 1.5 }}>{u}</div>
  </div>
);

const Sep: React.FC<{ pulse: number; big?: boolean }> = ({ pulse, big }) => (
  <div style={{ fontSize: big ? 44 : 22, color: GD_GOLD, opacity: 0.3 + pulse * 0.5, paddingBottom: big ? 16 : 8, fontWeight: 300 }}>:</div>
);

// ─── Main ────────────────────────────────────────────────────────────
export const CountdownComposition: React.FC<CountdownProps> = ({ eventDate, milestones }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.3, 1, 0.3]);

  const anim = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
    transform: `translateY(${interpolate(frame, [delay, delay + 18], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}px)`,
  });

  const gameplay = milestones.find((m) => m.id === "gameplay")!;
  const gMs = msUntil(eventDate, gameplay.time);
  const gT = fmt(gMs);
  const gLive = gMs === 0;

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: FONT }}>
      <BackgroundLayer darken={0.75} />
      <HexGridOverlay />

      {/* ═══ LEFT SIDE: Logos + Hero Countdown ═══ */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: 740, height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* Logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, ...anim(0) }}>
          <Img src={COMMUNITY_LOGO} style={{ height: 60 }} />
          <div style={{ width: 1, height: 40, background: `${GD_PURPLE}55` }} />
          <Img src={LOGO} style={{ height: 50 }} />
        </div>

        {/* Game starts in */}
        <div style={{ ...anim(6), textAlign: "center" }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase",
            letterSpacing: 4, marginBottom: 12,
          }}>
            🎮 Game Starts In
          </div>

          {gLive ? (
            <div style={{ fontSize: 64, fontWeight: 800, color: "#22c55e", textShadow: "0 0 40px #22c55e44" }}>
              GAME ON
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "flex-end" }}>
              {gT.d > 0 && <><Digit v={String(gT.d)} u="days" pulse={pulse} big /><Sep pulse={pulse} big /></>}
              <Digit v={gT.h} u="hours" pulse={pulse} big />
              <Sep pulse={pulse} big />
              <Digit v={gT.m} u="min" pulse={pulse} big />
              <Sep pulse={pulse} big />
              <Digit v={gT.s} u="sec" pulse={pulse} big />
            </div>
          )}

          <div style={{ fontSize: 16, color: GD_ACCENT, marginTop: 16, opacity: 0.8 }}>
            2 hours of competitive cloud gaming
          </div>
          <div style={{ fontSize: 14, color: GD_PURPLE, marginTop: 4 }}>
            53+ User Groups • 20+ Countries • Thousands of players
          </div>
        </div>
      </div>

      {/* ═══ RIGHT SIDE: Schedule + Info ═══ */}
      <div style={{
        position: "absolute", right: 0, top: 0, width: 540, height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 40px 0 0",
      }}>
        {/* Schedule */}
        <div style={{ ...anim(14) }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase",
            letterSpacing: 3, marginBottom: 12,
          }}>
            📅 Schedule — {eventDate}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {milestones.map((ms) => {
              const remaining = msUntil(eventDate, ms.time);
              const isLive = remaining === 0;
              const t = fmt(remaining);
              const isPreshow = ms.id === "preshow";
              const isGame = ms.id === "gameplay";
              const isMuted = ms.id === "preshow" || ms.id === "gameplay";

              return (
                <div key={ms.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  background: isLive ? "#22c55e15" : isGame ? `${GD_GOLD}08` : "rgba(255,255,255,0.02)",
                  borderRadius: 10,
                  border: isLive ? "1px solid #22c55e44" : isGame ? `1px solid ${GD_GOLD}22` : "1px solid transparent",
                  opacity: isPreshow ? 0.5 : 1,
                }}>
                  {/* Time */}
                  <div style={{ width: 50, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isLive ? "#22c55e" : "white" }}>{ms.time}</div>
                    <div style={{ marginTop: 2 }}>{isMuted ? <MutedIcon size={14} /> : <AudioIcon size={14} />}</div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isLive ? "#22c55e" : "white" }}>
                      {ms.label}
                      {isPreshow && <span style={{ fontSize: 11, color: GD_PURPLE, fontWeight: 400, fontStyle: "italic", marginLeft: 6 }}>optional</span>}
                    </div>
                    <div style={{ fontSize: 12, color: GD_PURPLE, marginTop: 2 }}>{ms.desc}</div>
                  </div>

                  {/* Mini timer */}
                  <div style={{ width: 100, textAlign: "right" }}>
                    {isLive ? (
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>✓ LIVE</span>
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: isGame ? GD_GOLD : GD_ACCENT }}>
                        {t.d > 0 ? `${t.d}d ` : ""}{t.h}:{t.m}:{t.s}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preparation checklist */}
        <div style={{ marginTop: 24, ...anim(22) }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase",
            letterSpacing: 3, marginBottom: 10,
          }}>
            ✅ Get Ready
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { icon: "👥", text: "Form a team of 4 at your User Group" },
              { icon: "💻", text: "Have your AWS account ready" },
              { icon: "🖥️", text: "Join the Zoom stream at your location" },
              { icon: "⏰", text: "Team codes distributed at 18:25 CET" },
            ].map((item) => (
              <div key={item.text} style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 14, color: "white", opacity: 0.85,
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 32,
        background: `linear-gradient(90deg, ${GD_PURPLE}22, ${GD_VIOLET}11, ${GD_PURPLE}22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: interpolate(frame, [28, 45], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span style={{ fontSize: 12, color: GD_PURPLE, letterSpacing: 1 }}>
          The first-ever AWS Community GameDay across Europe 🇪🇺
        </span>
      </div>
    </AbsoluteFill>
  );
};
