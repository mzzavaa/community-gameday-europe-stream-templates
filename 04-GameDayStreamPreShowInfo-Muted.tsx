import React from "react";
import {
  AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import {
  BackgroundLayer, HexGridOverlay, AudioBadge,
  GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD,
  calculateCountdown, formatTime, STREAM_START, GAME_START,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS } from "./shared/userGroups";
import { LOGO_MAP } from "./archive/CommunityGamedayEuropeV4";
import { ORGANIZERS, AWS_SUPPORTERS } from "./shared/organizers";

const F = "'Amazon Ember', 'Inter', sans-serif";
const COMMUNITY_LOGO = staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png");
const GAMEDAY_LOGO = staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png");

// Shuffle UGs deterministically
const SHUFFLED = [...USER_GROUPS].sort((a, b) => {
  const h = (s: string) => s.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return h(a.name) - h(b.name);
});

// Try to find logo - names differ slightly between userGroups.ts and LOGO_MAP
function findLogo(name: string): string | null {
  if (LOGO_MAP[name]) return LOGO_MAP[name];
  // Try common variations
  for (const key of Object.keys(LOGO_MAP)) {
    if (key.includes(name.replace("AWS UG ", "AWS User Group ").replace(" – ", " – ")) ||
        name.includes(key.replace("AWS User Group ", "AWS UG ").replace("-", " – "))) return LOGO_MAP[key];
  }
  return null;
}

const SIMPLE_SCHEDULE = [
  { time: "T-30 min", label: "Pre-Show", muted: true },
  { time: "T-0", label: "Live Stream", muted: false },
  { time: "T+30 min", label: "GameDay", muted: true },
  { time: "T+2h 30m", label: "Closing", muted: false },
];

const INFO_SLIDES = [
  "53+ AWS User Groups across 20+ countries competing simultaneously",
  "Connect your audio now — if it's not working, use the provided fallback video",
  "This stream will be muted during gameplay — we'll be back to celebrate the winners",
  "Everything behind this event was organized by volunteers — not employed by AWS",
  "Teams of 4 compete on a gamified platform solving real-world AWS challenges",
  "No prior experience needed — just curiosity and teamwork",
];

// ── Persistent top bar ──
const Bar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 68, zIndex: 10,
      background: `linear-gradient(180deg, ${GD_DARK}ee, ${GD_DARK}bb)`,
      borderBottom: `1px solid ${GD_PURPLE}33`,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 36 }} />
        <Img src={GAMEDAY_LOGO} style={{ height: 44 }} />
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: GD_PINK, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Stream In</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: GD_PINK, fontFamily: "monospace" }}>{formatTime(sc)}</div>
        </div>
        <div style={{ width: 1, height: 36, background: `${GD_PURPLE}44` }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: GD_GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Game In</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: GD_GOLD, fontFamily: "monospace" }}>{formatTime(gc)}</div>
        </div>
      </div>
    </div>
  );
};

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ fontFamily: F, background: GD_DARK }}>
    <BackgroundLayer darken={0.7} />
    <HexGridOverlay />
    <AudioBadge muted />
    <Bar />
    <div style={{ position: "absolute", top: 68, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
  </AbsoluteFill>
);

const Heading: React.FC<{ children: string; color?: string }> = ({ children, color = GD_ACCENT }) => (
  <div style={{ fontSize: 22, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 4, marginBottom: 28, fontFamily: F, textAlign: "center" }}>{children}</div>
);

function useStagger(i: number, gap = 5) {
  const frame = useCurrentFrame();
  return interpolate(frame, [i * gap, i * gap + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}

// ── Hero with logos and countdown ──
const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  const m = String(Math.floor(gc / 60)).padStart(2, "0");
  const s = String(gc % 60).padStart(2, "0");
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.3, 1, 0.3]);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 36 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 100 }} />
        <div style={{ width: 1, height: 60, background: `${GD_PURPLE}55` }} />
        <Img src={GAMEDAY_LOGO} style={{ height: 130 }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 5, marginBottom: 18, fontFamily: F }}>Game Starts In</div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
        <TBox v={m} u="min" pulse={pulse} /><div style={{ fontSize: 52, color: GD_GOLD, opacity: 0.5, paddingBottom: 16 }}>:</div><TBox v={s} u="sec" pulse={pulse} />
      </div>
      <div style={{ fontSize: 20, color: GD_ACCENT, marginTop: 24, fontFamily: F }}>The first-ever AWS Community GameDay across Europe</div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginTop: 8, fontFamily: F }}>53+ User Groups · 20+ Countries · 4+ Timezones</div>
    </AbsoluteFill>
  );
};

const TBox: React.FC<{ v: string; u: string; pulse: number }> = ({ v, u, pulse }) => (
  <div style={{ background: `linear-gradient(180deg,${GD_PURPLE}40,${GD_DARK}dd)`, border: `1px solid ${GD_VIOLET}30`, borderRadius: 16, padding: "16px 28px", textAlign: "center", minWidth: 110 }}>
    <div style={{ fontSize: 64, fontWeight: 800, fontFamily: F, color: GD_GOLD, lineHeight: 1, textShadow: `0 0 ${22 * pulse}px ${GD_ORANGE}55` }}>{v}</div>
    <div style={{ fontSize: 13, color: GD_ACCENT, marginTop: 5, textTransform: "uppercase", letterSpacing: 2 }}>{u}</div>
  </div>
);

// ── Single UG Spotlight (one at a time, big) ──
const UGSpotlight: React.FC<{ index: number }> = ({ index }) => {
  const g = SHUFFLED[index % SHUFFLED.length];
  const logo = findLogo(g.name);
  const o = useStagger(0, 1);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>User Group Spotlight</Heading>
      <div style={{ opacity: o, transform: `scale(${0.85 + o * 0.15})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {logo && <Img src={logo} style={{ width: 200, height: 200, borderRadius: 24, objectFit: "cover", border: `2px solid ${GD_PURPLE}44` }} />}
        <span style={{ fontSize: 56, marginTop: logo ? 0 : 20 }}>{g.flag}</span>
        <div style={{ fontSize: 32, fontWeight: 800, color: "white", fontFamily: F, textAlign: "center", maxWidth: 800 }}>{g.name}</div>
        <div style={{ fontSize: 22, color: GD_ACCENT, fontFamily: F }}>{g.city}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── Schedule variant 1: Simple (like countdown page) ──
const ScheduleSimple: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <Heading>Schedule (All times relative)</Heading>
    <div style={{ display: "flex", gap: 24 }}>
      {SIMPLE_SCHEDULE.map((s, i) => {
        const o = useStagger(i, 8);
        return (
          <div key={s.label} style={{
            opacity: o, transform: `translateY(${(1 - o) * 20}px)`,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_PURPLE}33`,
            borderRadius: 18, padding: "24px 28px", textAlign: "center", width: 220,
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: GD_GOLD, fontFamily: F }}>{s.time}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginTop: 10, fontFamily: F }}>{s.label}</div>
            <div style={{ fontSize: 14, color: s.muted ? GD_PURPLE : "#22c55e", marginTop: 6 }}>{s.muted ? "Muted" : "Audio"}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Schedule variant 2: With descriptions ──
const ScheduleDetailed: React.FC = () => {
  const items = [
    { time: "T-30 min", label: "Pre-Show", desc: "Audio & stream test at your location", color: GD_ACCENT },
    { time: "T-0", label: "Live Stream", desc: "Welcome, speakers & GameDay instructions", color: GD_PINK },
    { time: "T+30 min", label: "GameDay", desc: "2 hours of competitive cloud gaming", color: GD_GOLD },
    { time: "T+2h 30m", label: "Closing", desc: "Winners & wrap-up", color: GD_ORANGE },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Event Schedule</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 700 }}>
        {items.map((t, i) => {
          const o = useStagger(i, 6);
          return (
            <div key={t.label} style={{
              opacity: o, transform: `translateX(${(1 - o) * 30}px)`,
              display: "flex", alignItems: "center", gap: 18, padding: "14px 24px",
              borderRadius: 14, background: "rgba(255,255,255,0.04)", borderLeft: `4px solid ${t.color}`,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.color, width: 120, fontFamily: F }}>{t.time}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: F }}>{t.label}</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Schedule variant 3: With faces (who speaks when) + stream host ──
const ScheduleWithFaces: React.FC = () => {
  const linda = ORGANIZERS.find((p) => p.name === "Linda")!;
  const jerome = ORGANIZERS.find((p) => p.name === "Jerome")!;
  const anda = ORGANIZERS.find((p) => p.name === "Anda")!;
  const arnaud = AWS_SUPPORTERS.find((p) => p.name === "Arnaud")!;
  const loic = AWS_SUPPORTERS.find((p) => p.name === "Loïc")!;
  const timeline = [
    { time: "T-0", label: "Community Intro", faces: [linda, jerome, anda] },
    { time: "T+7 min", label: "Special Guest", faces: [] },
    { time: "T+14 min", label: "GameDay Instructions", faces: [arnaud, loic] },
    { time: "T+25 min", label: "Team Codes → Game ON", faces: [] },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48 }}>
      {/* Stream host */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 3 }}>Stream Host</div>
        <Img src={staticFile(linda.face)} style={{ width: 140, height: 140, borderRadius: 70, objectFit: "cover", border: `3px solid ${GD_VIOLET}44` }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: F }}>Linda Mohamed</div>
        <div style={{ fontSize: 14, color: GD_ACCENT }}>AWS Community Hero</div>
      </div>
      {/* Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Heading>Live Stream Program</Heading>
        {timeline.map((t, i) => {
          const o = useStagger(i, 6);
          return (
            <div key={t.label} style={{
              opacity: o, display: "flex", alignItems: "center", gap: 16,
              padding: "12px 20px", borderRadius: 14, background: "rgba(255,255,255,0.04)",
              borderLeft: `3px solid ${GD_PINK}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: GD_PINK, width: 90, fontFamily: F }}>{t.time}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: F, flex: 1 }}>{t.label}</div>
              <div style={{ display: "flex", gap: -8 }}>
                {t.faces.map((f) => (
                  <Img key={f.name} src={staticFile(f.face)} style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover", border: `2px solid ${GD_DARK}`, marginLeft: -8 }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Info slide (one message at a time, big) ──
const InfoSlide: React.FC<{ index: number }> = ({ index }) => {
  const text = INFO_SLIDES[index % INFO_SLIDES.length];
  const o = useStagger(0, 1);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 100px" }}>
      <div style={{ opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "white", fontFamily: F, textAlign: "center", lineHeight: 1.5, maxWidth: 900 }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── Community Organizers ──
const CommunityOrg: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <Heading>Community Organizers</Heading>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 1050 }}>
      {ORGANIZERS.map((p, i) => {
        const o = useStagger(i, 5);
        return (
          <div key={p.name} style={{
            opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_PURPLE}33`,
            borderRadius: 16, padding: "14px 20px", minWidth: 240,
          }}>
            <Img src={staticFile(p.face)} style={{ width: 56, height: 56, borderRadius: 28, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: F }}>{p.flag} {p.name}</div>
              <div style={{ fontSize: 13, color: GD_ACCENT }}>{p.role}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.country}</div>
            </div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── AWS Orga Support & Gamemasters (one line) ──
const AWSSupport: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <Heading color={GD_ORANGE}>AWS Orga Support & Gamemasters</Heading>
    <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
      {AWS_SUPPORTERS.map((p, i) => {
        const o = useStagger(i, 6);
        return (
          <div key={p.name} style={{
            opacity: o, transform: `scale(${0.85 + o * 0.15})`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_ORANGE}33`,
            borderRadius: 20, padding: "24px 32px", width: 220,
          }}>
            <Img src={staticFile(p.face)} style={{ width: 80, height: 80, borderRadius: 40, objectFit: "cover" }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", fontFamily: F }}>{p.name}</div>
            <div style={{ fontSize: 13, color: GD_ORANGE, textAlign: "center" }}>{p.role}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.country}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Stats ──
const Stats: React.FC = () => {
  const stats = [
    { v: "53+", l: "User Groups", c: GD_GOLD },
    { v: "20+", l: "Countries", c: GD_PINK },
    { v: "4+", l: "Timezones", c: GD_VIOLET },
    { v: "1st", l: "Edition", c: GD_ORANGE },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Community GameDay Europe</Heading>
      <div style={{ display: "flex", gap: 32 }}>
        {stats.map((s, i) => {
          const o = useStagger(i, 8);
          return (
            <div key={s.l} style={{
              opacity: o, transform: `scale(${0.8 + o * 0.2})`,
              background: "rgba(255,255,255,0.05)", border: `1px solid ${s.c}33`,
              borderRadius: 20, padding: "28px 40px", textAlign: "center",
            }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: s.c, fontFamily: F }}>{s.v}</div>
              <div style={{ fontSize: 16, color: GD_ACCENT, marginTop: 8, fontFamily: F }}>{s.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Get Ready ──
const Ready: React.FC = () => {
  const items = [
    "Form your team locally before the stream",
    "Be seated with audio ready 5 minutes before start",
    "Watch the live stream for instructions",
    "Team codes distributed locally by your UG leader",
    "Game runs for 2 hours — stream is muted",
    "Stream returns for the closing ceremony",
    "After the ceremony, local UGs continue their schedule",
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Get Ready</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 750 }}>
        {items.map((text, i) => {
          const o = useStagger(i, 5);
          return (
            <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 20}px)`, display: "flex", alignItems: "center", gap: 16, fontSize: 20, color: "rgba(255,255,255,0.9)", fontFamily: F }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: `${GD_VIOLET}33`, border: `1px solid ${GD_VIOLET}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: GD_ACCENT, flexShrink: 0 }}>{i + 1}</div>
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Build section sequence ──
// 30 min = 54000 frames. Each section 8s = 240 frames for UG spotlights, 40s = 1200 for others
const S = 1200; // 40s for content sections
const U = 240;  // 8s per UG spotlight
const T = 20;   // transition duration

function buildSections(): Array<{ key: string; dur: number; el: React.ReactNode }> {
  const out: Array<{ key: string; dur: number; el: React.ReactNode }> = [];
  let ugIdx = 0;
  const nextUGs = (count: number) => {
    for (let i = 0; i < count; i++) {
      out.push({ key: `ug-${ugIdx}`, dur: U, el: <Wrap><UGSpotlight index={ugIdx} /></Wrap> });
      ugIdx++;
    }
  };
  let infoIdx = 0;
  const nextInfo = () => {
    out.push({ key: `info-${infoIdx}`, dur: S, el: <Wrap><InfoSlide index={infoIdx} /></Wrap> });
    infoIdx++;
  };

  // Cycle pattern: hero, UGs, schedule variant, UGs, info, UGs, people, UGs, ...
  // Cycle 1
  out.push({ key: "hero1", dur: S, el: <Wrap><Hero /></Wrap> });
  nextUGs(6);
  out.push({ key: "sched-simple", dur: S, el: <Wrap><ScheduleSimple /></Wrap> });
  nextUGs(6);
  nextInfo();
  out.push({ key: "community-org", dur: S, el: <Wrap><CommunityOrg /></Wrap> });
  nextUGs(6);
  out.push({ key: "sched-detailed", dur: S, el: <Wrap><ScheduleDetailed /></Wrap> });
  nextUGs(6);
  nextInfo();
  out.push({ key: "aws-support", dur: S, el: <Wrap><AWSSupport /></Wrap> });
  nextUGs(6);
  out.push({ key: "sched-faces", dur: S, el: <Wrap><ScheduleWithFaces /></Wrap> });
  nextUGs(6);
  out.push({ key: "stats1", dur: S, el: <Wrap><Stats /></Wrap> });
  nextUGs(6);
  nextInfo();
  out.push({ key: "ready1", dur: S, el: <Wrap><Ready /></Wrap> });
  // Remaining UGs
  while (ugIdx < SHUFFLED.length) nextUGs(1);
  // Cycle 2 (fill remaining time)
  out.push({ key: "hero2", dur: S, el: <Wrap><Hero /></Wrap> });
  nextInfo();
  out.push({ key: "sched-simple2", dur: S, el: <Wrap><ScheduleSimple /></Wrap> });
  out.push({ key: "community-org2", dur: S, el: <Wrap><CommunityOrg /></Wrap> });
  nextInfo();
  out.push({ key: "sched-faces2", dur: S, el: <Wrap><ScheduleWithFaces /></Wrap> });
  out.push({ key: "aws-support2", dur: S, el: <Wrap><AWSSupport /></Wrap> });
  nextInfo();
  out.push({ key: "stats2", dur: S, el: <Wrap><Stats /></Wrap> });
  out.push({ key: "ready2", dur: S, el: <Wrap><Ready /></Wrap> });
  out.push({ key: "hero3", dur: S, el: <Wrap><Hero /></Wrap> });

  return out;
}

const presentations = [
  () => fade(),
  () => slide({ direction: "from-left" }),
  () => fade(),
  () => slide({ direction: "from-bottom" }),
];

export const GameDayPreShowInfo: React.FC = () => {
  const sections = buildSections();
  return (
    <TransitionSeries>
      {sections.map((s, i) => {
        const items: React.ReactNode[] = [];
        if (i > 0) {
          items.push(
            <TransitionSeries.Transition
              key={`t-${s.key}`}
              presentation={presentations[i % presentations.length]()}
              timing={linearTiming({ durationInFrames: T })}
            />
          );
        }
        items.push(
          <TransitionSeries.Sequence key={s.key} durationInFrames={s.dur}>
            {s.el}
          </TransitionSeries.Sequence>
        );
        return items;
      })}
    </TransitionSeries>
  );
};
