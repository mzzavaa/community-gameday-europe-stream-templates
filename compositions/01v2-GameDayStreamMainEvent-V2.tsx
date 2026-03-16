/**
 * GameDayMainEventV2 — AWS Community GameDay Europe
 *
 * Strict sequential reveal — each visual phase introduces ONE new element.
 * Nothing overlaps. Frame guards are enforced on every component.
 *
 * Phase timeline (30 fps) — STRICTLY SEQUENTIAL, nothing overlaps:
 *  0  –  210  WELCOME HERO   – fullscreen title, nothing else
 * 60  –  ∞    COUNTDOWN      – top-right corner (small, stays forever)
 * 150 –  960  MAP            – europe-map.png fades in as background
 * 210 –  510  STATS          – 4 stat cards, RIGHT side only, then fade out
 * 540 –  690  VIENNA CARD    – "happening here — next door!" spotlight, centered
 * 720 – 1800  HOST CARD      – Linda's StreamHostCard bottom strip
 * 840 – 1080  GREETING BUBBLE– speech bubble above host card
 * 960 –  ∞    SIDEBAR        – schedule slides in from right
 * 1140– 1800  INFO CARDS     – key script points (Linda speaking)
 * 1800– 9300  ORGANIZER      – Jerome & Anda card
 * 1800– 9300  ORG INFO CARDS – community context cards
 * 10800–12599 SUPPORT VIDEO  – Mihaly full-screen H.264 with subtitles
 */

import React from "react";
import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundLayer,
  HexGridOverlay,
  GlassCard,
  AudioBadge,
  calculateCountdown,
  formatTime,
  staggeredEntry,
  springConfig,
  getCardState,
  getPhaseInfo,
  STREAM_START,
  GAME_START,
  GD_DARK,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  TYPOGRAPHY,
  ScheduleSegment,
  CardState,
} from "../shared/GameDayDesignSystem";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE CONSTANTS — single source of truth for every frame gate
// ─────────────────────────────────────────────────────────────────────────────
const P = {
  // Phase 1 — Welcome hero (fullscreen title, countdown is the only other element)
  HERO_IN:        0,
  HERO_FADE_OUT:  150,  // title starts fading at 150, gone by 210
  HERO_OUT:       210,

  // Countdown top-right
  COUNTDOWN_IN:   60,

  // Phase 2 — Europe map background
  MAP_IN:         150,
  MAP_ZOOM_START: 420,
  MAP_OUT:        960,

  // Phase 2 — Stats column (RIGHT side, appears after hero is gone)
  // Strictly ends before Vienna card appears — no overlap
  STATS_IN:       210,
  STATS_OUT:      510,

  // Phase 2b — Vienna spotlight card (appears ONLY after stats are gone)
  VIENNA_IN:      540,
  VIENNA_OUT:     690,

  // Phase 3 — Stream host card (bottom strip, appears ONLY after Vienna fades)
  HOST_IN:        720,
  HOST_COMPACT:   960,
  HOST_OUT:       1800,

  // Phase 3b — Greeting speech bubble (above host card, after it settles)
  BUBBLE_IN:      840,
  BUBBLE_OUT:     1080,

  // Phase 4 — Schedule sidebar (right side)
  SIDEBAR_IN:     960,

  // Phase 4b — Info cards (Linda speaking — above host card, left side)
  INFO_IN:        1140,
  INFO_OUT:       1800,

  // Phase 5 — Jerome & Anda organizer section
  ORG_IN:         1800,
  ORG_OUT:        9300,

  // Phase 6 — Mihaly support video (full-screen takeover)
  SUPPORT_IN:     10800,
  SUPPORT_OUT:    12599,

  // Speaker indicator appears after greeting bubble
  SPEAKER_IN:     1080,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT ZONES (px from edges of 1280×720 canvas)
// ─────────────────────────────────────────────────────────────────────────────
const L = {
  MARGIN:           36,
  PROGRESS_H:       72,
  PROGRESS_Y:       648,   // 720 - 72
  SIDEBAR_W_PCT:    28,    // percent of screen width
  COUNTDOWN_RIGHT:  36,
  COUNTDOWN_TOP:    28,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
const MicIcon   = ({ s = 14, c = "white" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const GlobeIcon  = ({ s = 14, c = "white" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const UsersIcon  = ({ s = 14, c = "white" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon  = ({ s = 14, c = GD_ACCENT }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const GameIcon   = ({ s = 14, c = GD_ACCENT }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>;
const PinIcon    = ({ s = 12, c = GD_PINK }) => <svg width={s} height={s + 2} viewBox="0 0 12 16" fill={c}><path d="M6 0C2.7 0 0 2.7 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5S4.6 3.5 6 3.5 8.5 4.6 8.5 6 7.4 8.5 6 8.5z"/></svg>;
const CheckIcon  = ({ s = 12, c = "#334155" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const InfoIcon   = ({ s = 12, c = GD_ACCENT }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const ChatIcon   = ({ s = 13, c = GD_ACCENT }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const StarIcon   = ({ s = 14, c = GD_GOLD }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const VolumeIcon = ({ s = 14, c = "white" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const HeartIcon  = ({ s = 14, c = GD_PINK }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ASSETS
// ─────────────────────────────────────────────────────────────────────────────
const UG_VIENNA_LOGO = "https://awscommunitydach.notion.site/image/attachment%3A7f5dcfa0-c808-411f-85e7-b8b2283e2c5a%3AAWS_Vienna_-_Vienna_Austria.jpg?table=block&id=3090df17-987f-80a9-a26b-de59a394b30a&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2";
const GD_MAP         = staticFile("AWSCommunityGameDayEurope/europe-map.png");
const GAMEDAY_LOGO   = staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric.png");
const SUPPORT_VIDEO  = staticFile("AWSCommunityGameDayEurope/support-process-h264.mp4");

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE DATA
// ─────────────────────────────────────────────────────────────────────────────
export const SEGMENTS_V2: ScheduleSegment[] = [
  { label: "Community Intro",       startFrame: 0,     endFrame: 10799 },
  { label: "Support Process",       startFrame: 10800, endFrame: 12599 },
  { label: "Special Guest",         startFrame: 12600, endFrame: 23399 },
  { label: "AWS Gamemasters Intro", startFrame: 23400, endFrame: 25199 },
  { label: "GameDay Instructions",  startFrame: 25200, endFrame: 44999 },
  { label: "Distribute Codes",      startFrame: 45000, endFrame: 53999 },
];

const CHAPTERS_V2: ScheduleSegment[] = [
  { label: "Linda — Welcome & Opening",     startFrame: 0,     endFrame: 1799,  speakers: "Linda Mohamed" },
  { label: "Jerome & Anda — How it started",startFrame: 1800,  endFrame: 9299,  speakers: "Jerome & Anda" },
  { label: "Linda — Transition",            startFrame: 9300,  endFrame: 10799, speakers: "Linda Mohamed" },
  { label: "Support Process — Mihaly",      startFrame: 10800, endFrame: 12599, speakers: "Mihaly" },
  { label: "Linda — Introduces Special Guest",startFrame: 12600,endFrame: 14399,speakers: "Linda Mohamed" },
  { label: "Special Guest",                 startFrame: 14400, endFrame: 23399 },
  { label: "Linda — Intro to Gamemasters",  startFrame: 23400, endFrame: 25199, speakers: "Linda Mohamed" },
  { label: "GameDay Rules & Scoring",       startFrame: 25200, endFrame: 32399, speakers: "Arnaud & Loïc" },
  { label: "Challenge Walkthrough",         startFrame: 32400, endFrame: 39599, speakers: "Arnaud & Loïc" },
  { label: "Tips & Final Prep",             startFrame: 39600, endFrame: 44999, speakers: "Arnaud & Loïc" },
  { label: "Distribute Team Codes",         startFrame: 45000, endFrame: 49499 },
  { label: "Final Prep & Game Start!",      startFrame: 49500, endFrame: 53999 },
];

// ─────────────────────────────────────────────────────────────────────────────
// MIHALY SUBTITLES
// NOTE: These are placeholder subtitles. Replace with verified transcript once
// the recording is reviewed. Timing is seconds from start of the video.
// ─────────────────────────────────────────────────────────────────────────────
const SUBTITLES: Array<{ s: number; e: number; t: string }> = [
  { s: 0,  e: 5,  t: "Hello everyone! I'm Mihaly from AWS User Group Budapest." },
  { s: 5,  e: 13, t: "I'll explain how the support process works during GameDay." },
  { s: 13, e: 22, t: "If your team hits a technical issue, first re-read the challenge description carefully." },
  { s: 22, e: 32, t: "For platform issues, use the in-app support button — our team monitors it constantly." },
  { s: 32, e: 41, t: "For AWS console or permission issues, contact your local UG organizer directly." },
  { s: 41, e: 51, t: "Hints are available for each challenge — they cost points, so use them wisely!" },
  { s: 51, e: 60, t: "Our support team will respond as quickly as possible — don't get stuck, ask early." },
  { s: 60, e: 70, t: "Stay calm, communicate with your team, and most importantly — have fun!" },
  { s: 70, e: 80, t: "Good luck to all 53+ user groups out there — let's make history together!" },
  { s: 80, e: 87, t: "Back to you, Linda — and see you all after the game!" },
];

// ─────────────────────────────────────────────────────────────────────────────
// INFO CARDS — Linda's script (frames 1100–1800) + Organizer section (1800–9300)
// ─────────────────────────────────────────────────────────────────────────────
interface Card { text: string; label: string; from: number; to: number; color: string; highlight?: string }

const LINDA_CARDS: Card[] = [
  { from: 1140, to: 1340, color: GD_ORANGE,  label: "AUDIO CHECK",               text: "Connect your audio NOW — the GameDay instructions coming up are critical!", highlight: "Connect your audio NOW" },
  { from: 1340, to: 1560, color: GD_PINK,    label: "IMPORTANT — MUTED DURING GAMEPLAY", text: "This stream will be MUTED the moment the game starts. Come back when the second timer ends to celebrate the global winners!", highlight: "MUTED" },
  { from: 1560, to: 1700, color: GD_ACCENT,  label: "ALSO IN VIENNA — NEXT DOOR", text: "AWS GameDay is also happening here in Vienna — my co-organizers are hosting it in the room right next door!", highlight: "room right next door" },
  { from: 1700, to: 1800, color: GD_GOLD,    label: "THANK YOU, COMMUNITY",       text: "Thank you to every single one of the 53+ UG Leaders across 20+ countries — you made this happen as volunteers!", highlight: "as volunteers" },
];

const ORG_CARDS: Card[] = [
  { from: 1800, to: 2300, color: GD_ACCENT,  label: "ORGANIZED BY THE COMMUNITY",  text: "Every part of this event was organized by AWS Community members — people NOT employed by AWS, giving their free time.", highlight: "NOT employed by AWS" },
  { from: 2300, to: 3100, color: GD_VIOLET,  label: "THE VISION — JEROME & ANDA",  text: "Jerome (Belgium) and Anda (Switzerland) connected User Group leaders across Europe and made this vision a reality.", highlight: "made this vision a reality" },
  { from: 3100, to: 3900, color: GD_PINK,    label: "COMMUNITY-POWERED",           text: "Just like every UG Leader hosting one of the 53+ city events today — this is purely voluntary community work.", highlight: "purely voluntary" },
  { from: 3900, to: 4700, color: GD_ACCENT,  label: "WHAT IS AN AWS USER GROUP?",  text: "AWS User Groups are free, community-run meetups. Anyone can join, speak, or even start one in their city.", highlight: "Anyone can join" },
  { from: 4700, to: 5500, color: GD_GOLD,    label: "THE SCALE OF TODAY",          text: "53 simultaneous venues · 20+ countries · 4+ timezones · Remote supporters from even further afield.", highlight: "53 simultaneous venues" },
  { from: 5500, to: 6300, color: GD_VIOLET,  label: "AWS + COMMUNITY TOGETHER",    text: "This event brings together two worlds: the AWS Community volunteers, and AWS as a company. Both are essential.", highlight: "Both are essential" },
  { from: 6300, to: 7100, color: GD_ACCENT,  label: "STAY CONNECTED",             text: "After GameDay instructions, team codes will be distributed. The game starts in under 30 minutes — stay in the stream!", highlight: "stay in the stream" },
  { from: 7100, to: 8000, color: GD_ORANGE,  label: "REMINDER — MUTED GAMEPLAY",  text: "Stream goes MUTED when the game starts. Stay connected — we come back LIVE when the second timer ends.", highlight: "Stay connected" },
  { from: 8000, to: 8800, color: GD_PINK,    label: "COMING UP",                  text: "After Jerome & Anda: a very special surprise guest. Then Arnaud & Loïc explain the GameDay rules. Stay tuned!", highlight: "special surprise guest" },
  { from: 8800, to: 9300, color: GD_ACCENT,  label: "GAME STARTS SOON",           text: "We're almost at game time. Make sure your team is assembled and your AWS console is ready.", highlight: "your team is assembled" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: current speaker
// ─────────────────────────────────────────────────────────────────────────────
function getCurrentSpeaker(frame: number) {
  const active = CHAPTERS_V2.find((c) => frame >= c.startFrame && frame <= c.endFrame);
  if (!active?.speakers) return { current: null, next: null };
  const idx = CHAPTERS_V2.indexOf(active);
  let next: string | null = null;
  for (let i = idx + 1; i < CHAPTERS_V2.length; i++) {
    if (CHAPTERS_V2[i].speakers && CHAPTERS_V2[i].speakers !== active.speakers) {
      next = CHAPTERS_V2[i].speakers!;
      break;
    }
  }
  return { current: active.speakers, next };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 1 — WELCOME HERO (frames 0–210, fullscreen, nothing else visible)
// ─────────────────────────────────────────────────────────────────────────────
const WelcomeHero: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame >= P.HERO_OUT) return null;

  const fadeIn  = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [P.HERO_FADE_OUT, P.HERO_OUT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleSpring = spring({ frame, fps, config: springConfig.entry });
  const scale = interpolate(titleSpring, [0, 1], [0.88, 1]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity, zIndex: 60, pointerEvents: "none",
    }}>
      {/* Radial glow behind title */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 1000, height: 560,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(ellipse, ${GD_VIOLET}28 0%, transparent 68%)`,
        pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", transform: `scale(${scale})`, position: "relative" }}>
        <div style={{
          fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
          letterSpacing: 8, textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
          marginBottom: 20, opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        }}>
          Welcome to
        </div>

        <div style={{
          fontSize: 90, fontWeight: 900, color: "white", fontFamily: "'Inter', sans-serif",
          letterSpacing: -3, lineHeight: 1.0,
          textShadow: `0 0 100px ${GD_VIOLET}66, 0 0 200px ${GD_VIOLET}33`,
        }}>
          AWS Community
        </div>
        <div style={{
          fontSize: 90, fontWeight: 900, fontFamily: "'Inter', sans-serif",
          letterSpacing: -3, lineHeight: 1.05,
          background: `linear-gradient(135deg, ${GD_VIOLET} 0%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          GameDay Europe
        </div>

        {/* Divider line */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 16, marginTop: 28,
          opacity: interpolate(Math.max(0, frame - 20), [0, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${GD_ACCENT}88)` }} />
          <div style={{
            fontSize: TYPOGRAPHY.h6, fontWeight: 500, color: "rgba(255,255,255,0.65)",
            fontFamily: "'Inter', sans-serif", letterSpacing: 1,
          }}>
            The first edition — March 17, 2026
          </div>
          <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${GD_ACCENT}88, transparent)` }} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 2 — COUNTDOWN TIMER (top-right, appears at frame 60, always visible)
// ─────────────────────────────────────────────────────────────────────────────
const CountdownTimer: React.FC<{ frame: number; fps: number; gameCountdown: number; isDistributeCodes: boolean }> = ({
  frame, fps, gameCountdown, isDistributeCodes,
}) => {
  if (frame < P.COUNTDOWN_IN) return null;

  const entry = spring({ frame: frame - P.COUNTDOWN_IN, fps, config: springConfig.entry });
  const pulse = isDistributeCodes
    ? interpolate(frame % 40, [0, 20, 40], [1, 1.05, 1], { extrapolateRight: "clamp" })
    : 1;
  const glow = isDistributeCodes
    ? interpolate(frame % 60, [0, 30, 60], [0.4, 1.0, 0.4], { extrapolateRight: "clamp" })
    : 0;

  const color = isDistributeCodes ? GD_ORANGE : "white";
  const glowColor = isDistributeCodes ? GD_ORANGE : GD_VIOLET;

  return (
    <div style={{
      position: "absolute",
      top: L.COUNTDOWN_TOP, right: L.COUNTDOWN_RIGHT,
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [-10, 0])}px) scale(${pulse})`,
      zIndex: 70, textAlign: "right",
    }}>
      <GlassCard style={{
        padding: isDistributeCodes ? "18px 36px" : "12px 24px",
        borderTop: `2px solid ${glowColor}60`,
        boxShadow: isDistributeCodes ? `0 0 ${24 + glow * 20}px ${GD_ORANGE}${Math.round(glow * 60).toString(16).padStart(2, "0")}` : "none",
      }}>
        <div style={{
          fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: isDistributeCodes ? GD_ORANGE : GD_ACCENT,
          letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
          marginBottom: 4, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end",
        }}>
          <ClockIcon s={10} c={isDistributeCodes ? GD_ORANGE : GD_ACCENT} />
          {isDistributeCodes ? "GAME STARTS IN" : "GAME START IN"}
        </div>
        <div style={{
          fontSize: isDistributeCodes ? TYPOGRAPHY.timerSmall : 56,
          fontWeight: 900, color,
          fontFamily: "'Inter', monospace", letterSpacing: 3,
          textShadow: `0 0 ${isDistributeCodes ? 40 : 30}px ${glowColor}66`,
        }}>
          {formatTime(gameCountdown)}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 3 — EUROPE MAP BACKGROUND (frames 150–960, zooms toward Vienna)
// ─────────────────────────────────────────────────────────────────────────────
const EuropeMapBackground: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.MAP_IN || frame > P.MAP_OUT) return null;

  const opacity = interpolate(
    frame, [P.MAP_IN, P.MAP_IN + 60, P.MAP_OUT - 90, P.MAP_OUT],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Gentle zoom toward Vienna (~47%, 57% of map)
  const zoomProgress = spring({
    frame: frame - P.MAP_ZOOM_START,
    fps,
    config: { damping: 80, stiffness: 10, mass: 2, overshootClamping: true },
  });
  const scale = interpolate(zoomProgress, [0, 1], [1.0, 1.8], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Pan: shift map so Vienna stays near center during zoom
  const panX = interpolate(zoomProgress, [0, 1], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(zoomProgress, [0, 1], [0, 40],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden", zIndex: 1, opacity,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
        transformOrigin: "50% 55%",
        filter: "saturate(0.7) brightness(0.6)",
      }}>
        <Img src={GD_MAP} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Edge vignette so map never bleeds to screen boundary */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at center, transparent 30%, ${GD_DARK}aa 65%, ${GD_DARK} 85%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 4 — STATS COLUMN (frames 210–750, right side)
// ─────────────────────────────────────────────────────────────────────────────
const StatsColumn: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.STATS_IN || frame > P.STATS_OUT) return null;

  const globalOpacity = interpolate(
    frame, [P.STATS_IN, P.STATS_IN + 20, P.STATS_OUT - 40, P.STATS_OUT],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const stats = [
    { icon: <UsersIcon s={22} c={GD_ACCENT} />,  value: "53+", label: "User Groups", sub: "Competing simultaneously", color: GD_ACCENT },
    { icon: <GlobeIcon  s={22} c={GD_VIOLET} />, value: "20+", label: "Countries",   sub: "Iceland to Turkey",         color: GD_VIOLET },
    { icon: <ClockIcon  s={22} c={GD_PINK} />,   value: "4+",  label: "Timezones",   sub: "UTC−1 through UTC+3",       color: GD_PINK },
    { icon: <StarIcon   s={22} c={GD_GOLD} />,   value: "1st", label: "Edition",     sub: "History being made today",  color: GD_GOLD },
  ];

  return (
    <div style={{
      position: "absolute",
      top: 100, right: L.MARGIN,
      display: "flex", flexDirection: "column", gap: 14,
      opacity: globalOpacity, zIndex: 20,
    }}>
      {stats.map((s, i) => {
        const entry = spring({ frame: frame - P.STATS_IN - i * 18, fps, config: springConfig.entry });
        return (
          <div key={s.label} style={{
            opacity: entry,
            transform: `translateX(${interpolate(entry, [0, 1], [40, 0])}px)`,
            display: "flex", alignItems: "center", gap: 18,
            background: "rgba(12,8,32,0.7)", backdropFilter: "blur(16px)",
            border: `1px solid ${s.color}22`,
            borderRight: `4px solid ${s.color}`,
            borderRadius: 14, padding: "16px 24px",
            minWidth: 260,
          }}>
            <div style={{ flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{
                fontSize: 48, fontWeight: 900, color: s.color, lineHeight: 1,
                textShadow: `0 0 24px ${s.color}44`, fontFamily: "'Inter', sans-serif",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: TYPOGRAPHY.caption, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>
                {s.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 5 — VIENNA SPOTLIGHT CARD (frames 560–780, centered)
// ─────────────────────────────────────────────────────────────────────────────
const ViennaSpotlight: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.VIENNA_IN || frame > P.VIENNA_OUT) return null;

  const entry = spring({ frame: frame - P.VIENNA_IN, fps, config: springConfig.entry });
  const fade  = interpolate(frame, [P.VIENNA_OUT - 40, P.VIENNA_OUT], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(entry, [0, 1], [0, 1]) * fade;

  return (
    <div style={{
      position: "absolute",
      top: "50%", left: "50%",
      transform: `translate(-50%, -50%) translateY(${interpolate(entry, [0, 1], [20, 0])}px)`,
      opacity, zIndex: 25, width: 420,
    }}>
      <GlassCard style={{
        padding: "22px 32px",
        borderTop: `3px solid ${GD_PINK}`,
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <PinIcon s={16} c={GD_PINK} />
          <div style={{
            fontSize: TYPOGRAPHY.captionSmall, fontWeight: 700, color: GD_PINK,
            letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
          }}>
            Vienna, Austria
          </div>
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.h6, fontWeight: 700, color: "white",
          fontFamily: "'Inter', sans-serif", marginBottom: 8,
        }}>
          GameDay is also happening here
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.6)",
          fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
        }}>
          AWS &amp; Women's User Group Vienna<br />
          My co-organizers are hosting it in the room next door!
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 6 — STREAM HOST CARD — Linda (frames 660–1800)
// Full-width from 660, shrinks to compact at 900.
// Positioned at bottom just above progress bar.
// ─────────────────────────────────────────────────────────────────────────────
const StreamHostCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.HOST_IN || frame >= P.HOST_OUT) return null;

  const entry = spring({ frame: frame - P.HOST_IN, fps, config: springConfig.entry });
  const compact = spring({ frame: frame - P.HOST_COMPACT, fps, config: springConfig.entry });

  // Width: 1208 → 520 as it compacts
  const cardWidth = interpolate(compact, [0, 1], [1208, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const avatarSize = interpolate(compact, [0, 1], [72, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardPad = interpolate(compact, [0, 1], [20, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fullOp = interpolate(compact, [0, 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const compactOp = interpolate(compact, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Exit at P.HOST_OUT
  const exitOpacity = interpolate(frame, [P.HOST_OUT - 30, P.HOST_OUT], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      bottom: 80, left: L.MARGIN,
      width: cardWidth,
      opacity: entry * exitOpacity,
      transform: `translateY(${interpolate(entry, [0, 1], [30, 0])}px)`,
      zIndex: 30,
    }}>
      <GlassCard style={{
        padding: `${cardPad}px ${cardPad + 10}px`,
        borderLeft: `4px solid ${GD_VIOLET}`,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        {/* Avatar */}
        <Img
          src={staticFile("AWSCommunityGameDayEurope/faces/linda.jpg")}
          style={{
            width: avatarSize, height: avatarSize,
            borderRadius: "50%", objectFit: "cover",
            boxShadow: `0 0 16px ${GD_VIOLET}aa`, flexShrink: 0,
          }}
        />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: TYPOGRAPHY.overline, color: GD_ACCENT,
            letterSpacing: 3, textTransform: "uppercase" as const,
            marginBottom: 3, fontFamily: "'Inter', sans-serif", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <MicIcon s={10} c={GD_ACCENT} />
            Your Stream Host
          </div>
          <div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 800, color: "white", fontFamily: "'Inter', sans-serif" }}>
            Linda Mohamed
          </div>
          {fullOp > 0.01 && (
            <div style={{ opacity: fullOp }}>
              <div style={{
                fontSize: TYPOGRAPHY.captionSmall, color: "#94a3b8",
                fontFamily: "'Inter', sans-serif", lineHeight: 1.4, marginTop: 3,
              }}>
                AWS Community Hero · AWS &amp; Women's User Group Vienna · Förderverein AWS Community DACH
              </div>
              <div style={{
                fontSize: TYPOGRAPHY.label, color: "#cbd5e1",
                fontFamily: "'Inter', sans-serif", marginTop: 5,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <PinIcon s={10} c={GD_ACCENT} /> Vienna, Austria
              </div>
            </div>
          )}
          {compactOp > 0.01 && (
            <div style={{ opacity: compactOp }}>
              <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
                AWS Community Hero · AWS &amp; Women's UG Vienna
              </div>
            </div>
          )}
        </div>

        {/* UG Vienna logo */}
        <div style={{ flexShrink: 0 }}>
          {fullOp > 0.01 && (
            <div style={{
              opacity: fullOp, width: 160,
              background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ width: "100%", aspectRatio: "600/337", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Img src={UG_VIENNA_LOGO} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{
                padding: "4px 8px 6px", textAlign: "center",
                fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
                letterSpacing: 2, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif",
              }}>AWS UG Vienna</div>
            </div>
          )}
          {compactOp > 0.01 && (
            <div style={{ opacity: compactOp, width: 80, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: "100%", aspectRatio: "600/337", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Img src={UG_VIENNA_LOGO} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 7 — GREETING SPEECH BUBBLE (frames 780–1080, above host card)
// ─────────────────────────────────────────────────────────────────────────────
const GreetingBubble: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.BUBBLE_IN || frame >= P.BUBBLE_OUT) return null;

  const entry = spring({ frame: frame - P.BUBBLE_IN, fps, config: springConfig.entry });
  const fade  = interpolate(frame, [P.BUBBLE_OUT - 30, P.BUBBLE_OUT], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      bottom: 230,    // above StreamHostCard at bottom: 80 + ~90px card + 60px gap
      left: L.MARGIN,
      maxWidth: 680,
      opacity: entry * fade,
      transform: `translateY(${interpolate(entry, [0, 1], [14, 0])}px)`,
      zIndex: 32,
    }}>
      <GlassCard style={{
        padding: "20px 28px",
        border: `1px solid ${GD_VIOLET}55`,
        borderRadius: 20,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
        }}>
          <ChatIcon s={13} c={GD_ACCENT} />
          <div style={{
            fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
            letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif",
          }}>
            Linda Mohamed — Stream Host
          </div>
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.body, fontWeight: 500, color: "white",
          fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
        }}>
          &ldquo;Hello everybody and welcome to the first AWS Community GameDay Europe! Make sure your audio is on
          for the next 30 minutes — the GameDay instructions coming up are critical. If audio is not working,
          use the provided fallback video so you don't miss anything.&rdquo;
        </div>
      </GlassCard>
      {/* Speech bubble tail */}
      <div style={{
        marginLeft: 48, width: 0, height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderTop: "12px solid rgba(255,255,255,0.05)",
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 8 — INFO CARDS (frames 1100–9300, left side above host/organizer area)
// ─────────────────────────────────────────────────────────────────────────────
const InfoCardDisplay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.INFO_IN || frame > P.ORG_OUT) return null;

  const allCards = [...LINDA_CARDS, ...ORG_CARDS];
  const active = allCards.find((c) => frame >= c.from && frame <= c.to);
  if (!active) return null;

  const entry = spring({ frame: frame - active.from, fps, config: springConfig.entry });
  const fadeOut = interpolate(frame, [active.to - 20, active.to], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(entry, [0, 1], [0, 1]) * fadeOut;

  const renderText = () => {
    if (!active.highlight) return active.text;
    const idx = active.text.indexOf(active.highlight);
    if (idx === -1) return active.text;
    return (
      <>
        {active.text.slice(0, idx)}
        <span style={{ color: active.color, fontWeight: 800 }}>{active.highlight}</span>
        {active.text.slice(idx + active.highlight.length)}
      </>
    );
  };

  // Position: when host card visible, sit above it; otherwise sit lower
  const isOrgPhase = frame >= P.ORG_IN;
  const topPos = isOrgPhase ? 330 : 120;

  return (
    <div style={{
      position: "absolute",
      top: topPos, left: L.MARGIN,
      width: "52%",
      opacity,
      transform: `translateY(${interpolate(entry, [0, 1], [16, 0])}px)`,
      zIndex: 26,
    }}>
      <GlassCard style={{
        padding: "16px 24px",
        borderLeft: `4px solid ${active.color}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
        }}>
          <InfoIcon s={11} c={active.color} />
          <div style={{
            fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: active.color,
            letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif",
          }}>
            {active.label}
          </div>
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.body, fontWeight: 500, color: "white",
          fontFamily: "'Inter', sans-serif", lineHeight: 1.55,
        }}>
          {renderText()}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 9 — ORGANIZER SECTION (frames 1800–9300)
// ─────────────────────────────────────────────────────────────────────────────
const OrganizerSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.ORG_IN || frame > P.ORG_OUT) return null;

  const entry = spring({ frame: frame - P.ORG_IN, fps, config: springConfig.entry });
  const fadeOut = interpolate(frame, [P.ORG_OUT - 40, P.ORG_OUT], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(entry, [0, 1], [0, 1]) * fadeOut;

  const orgs = [
    { name: "Jerome Vandenberghe", face: "AWSCommunityGameDayEurope/faces/jerome.jpg", ug: "AWS UG Belgium", loc: "Brussels" },
    { name: "Anda Popescu",        face: "AWSCommunityGameDayEurope/faces/anda.jpg",   ug: "AWS UG Geneva",  loc: "Geneva" },
  ];

  return (
    <div style={{
      position: "absolute",
      top: 120, left: L.MARGIN,
      width: "52%",
      opacity,
      transform: `translateY(${interpolate(entry, [0, 1], [20, 0])}px)`,
      zIndex: 28,
    }}>
      <GlassCard style={{ padding: "20px 28px", borderLeft: `4px solid ${GD_VIOLET}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <ChatIcon s={12} c={GD_ACCENT} />
          <div style={{
            fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
            letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif",
          }}>
            Currently Speaking
          </div>
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.label, color: "rgba(255,255,255,0.5)",
          fontFamily: "'Inter', sans-serif", marginBottom: 18,
        }}>
          Why this Community GameDay Europe was created
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {orgs.map((o) => (
            <div key={o.name} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <Img
                src={staticFile(o.face)}
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 14px ${GD_VIOLET}`, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: TYPOGRAPHY.caption, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif" }}>{o.name}</div>
                <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>{o.ug}</div>
                <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <PinIcon s={9} c={GD_ACCENT} />{o.loc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 10 — SCHEDULE SIDEBAR (right side, from frame 900)
// ─────────────────────────────────────────────────────────────────────────────
const ScheduleSidebar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.SIDEBAR_IN) return null;

  const entry = spring({ frame: frame - P.SIDEBAR_IN, fps, config: springConfig.entry });
  const isCompact = frame >= P.HOST_COMPACT;
  const sidebarW = `${L.SIDEBAR_W_PCT}%`;

  return (
    <div style={{
      position: "absolute",
      top: 0, right: 0, bottom: 0,
      width: sidebarW,
      background: `linear-gradient(270deg, ${GD_DARK}f0 0%, ${GD_DARK}cc 75%, transparent 100%)`,
      transform: `translateX(${interpolate(entry, [0, 1], [100, 0])}%)`,
      padding: `40px 22px ${L.PROGRESS_H + 20}px 32px`,
      display: "flex", flexDirection: "column",
      zIndex: 22,
    }}>
      <div style={{
        fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
        letterSpacing: 3, textTransform: "uppercase" as const,
        marginBottom: 18, fontFamily: "'Inter', sans-serif",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <GameIcon s={11} c={GD_ACCENT} /> Schedule
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {SEGMENTS_V2.map((seg, i) => {
          const state = getCardState(frame, seg);
          const eSpring = spring({ frame: frame - staggeredEntry(P.SIDEBAR_IN, i, 18), fps, config: springConfig.entry });
          const borderColor = state === "active" ? GD_VIOLET : state === "completed" ? "#334155" : "#1e293b";
          const textColor   = state === "active" ? "white"    : state === "completed" ? "#64748b" : "#94a3b8";
          return (
            <div key={seg.label} style={{ opacity: eSpring, transform: `translateX(${(1 - eSpring) * 35}px)`, marginBottom: 9 }}>
              <div style={{
                background: `rgba(255,255,255,${state === "active" ? 0.1 : 0.03})`,
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: 10, padding: "9px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontSize: TYPOGRAPHY.caption, fontWeight: 700, color: textColor, fontFamily: "'Inter', sans-serif" }}>
                  {seg.label}
                </div>
                {state === "active"    && <div style={{ fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_VIOLET, letterSpacing: 2, textTransform: "uppercase" as const }}>LIVE</div>}
                {state === "completed" && <CheckIcon s={11} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 11 — SPEAKER INDICATOR (bottom-right, from frame 1080)
// ─────────────────────────────────────────────────────────────────────────────
const SpeakerIndicator: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P.SPEAKER_IN) return null;
  const { current, next } = getCurrentSpeaker(frame);
  if (!current) return null;

  const entry = spring({ frame: frame - P.SPEAKER_IN, fps, config: springConfig.entry });
  const pulse = interpolate(frame % 40, [0, 10, 20, 30, 40], [0.4, 1, 0.4, 0.8, 0.4], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      bottom: 84, right: L.MARGIN,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
      opacity: entry, zIndex: 40,
      transform: `translateY(${interpolate(entry, [0, 1], [8, 0])}px)`,
    }}>
      {next && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.4 }}>
          <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>NEXT</div>
          <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{next}</div>
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)",
        border: `1px solid ${GD_VIOLET}40`, borderRadius: 10,
        padding: "6px 14px",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: GD_ORANGE, opacity: 0.5 + pulse * 0.5,
          boxShadow: `0 0 ${5 + pulse * 4}px ${GD_ORANGE}`,
        }} />
        <MicIcon s={11} c={GD_ACCENT} />
        <div style={{ fontSize: TYPOGRAPHY.label, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif" }}>
          {current}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 12 — MIHALY SUPPORT VIDEO (frames 10800–12599, full-screen takeover)
// Must be rendered inside <Sequence from={P.SUPPORT_IN}> — see main composition.
// Without Sequence, Video's internal useCurrentFrame() returns the absolute frame
// (10800+) and tries to seek the video to second 360 of an 86-second file → black.
// ─────────────────────────────────────────────────────────────────────────────
const SupportVideoSection: React.FC = () => {
  const frame  = useCurrentFrame();   // relative: 0 when absoluteFrame = P.SUPPORT_IN
  const { fps } = useVideoConfig();
  const DURATION = P.SUPPORT_OUT - P.SUPPORT_IN; // 1799 frames

  const relSec = frame / fps;

  const fadeIn  = spring({ frame, fps, config: springConfig.entry });
  const fadeOut = interpolate(frame, [DURATION - 30, DURATION], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = fadeIn * fadeOut;

  const activeSub = SUBTITLES.find((s) => relSec >= s.s && relSec < s.e);
  const subFadeIn = activeSub
    ? spring({ frame: frame - Math.round(activeSub.s * fps), fps, config: springConfig.entry })
    : 0;

  return (
    <AbsoluteFill style={{ opacity, zIndex: 55 }}>
      {/* Dark overlay over everything else */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,4,20,0.88)" }} />

      {/* Top label bar */}
      <div style={{
        position: "absolute", top: 28, left: "50%",
        transform: "translateX(-50%)", zIndex: 57,
      }}>
        <GlassCard style={{
          padding: "10px 32px",
          borderTop: `3px solid ${GD_ACCENT}`,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <Img
            src={staticFile("AWSCommunityGameDayEurope/faces/mihaly.jpg")}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 10px ${GD_VIOLET}` }}
          />
          <div>
            <div style={{
              fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
              letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
            }}>
              Support Process
            </div>
            <div style={{ fontSize: TYPOGRAPHY.captionSmall, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>
              Mihaly · AWS User Group Budapest
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Video — centered, 16:9, with rounded corners */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%) translateY(-20px)",
        width: 880, height: 495,
        borderRadius: 18, overflow: "hidden",
        boxShadow: `0 0 80px ${GD_VIOLET}44, 0 30px 80px rgba(0,0,0,0.7)`,
        border: `1px solid ${GD_VIOLET}44`,
        zIndex: 56,
      }}>
        <Video
          src={SUPPORT_VIDEO}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Subtitle bar */}
      {activeSub && (
        <div style={{
          position: "absolute",
          bottom: 110, left: "50%",
          transform: "translateX(-50%)",
          maxWidth: 820,
          opacity: subFadeIn,
          zIndex: 57,
        }}>
          <div style={{
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
            borderRadius: 10, padding: "12px 24px", textAlign: "center",
          }}>
            <div style={{
              fontSize: TYPOGRAPHY.body, fontWeight: 600, color: "white",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.45,
              textShadow: "0 1px 8px rgba(0,0,0,0.9)",
            }}>
              {activeSub.t}
            </div>
          </div>
          <div style={{
            textAlign: "center", marginTop: 6,
            fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.25)",
            fontFamily: "'Inter', sans-serif",
          }}>
            * Placeholder subtitles — update MIHALY_SUBTITLES with verified transcript
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 13 — GAMEDAY LOGO PROGRESS BAR (always visible at bottom)
// ─────────────────────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const { name } = getPhaseInfo(frame, SEGMENTS_V2);
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  const milestones = [
    { label: "Game Start", pos: 0.056 },
    { label: "Gameplay ~2h", pos: 0.50 },
    { label: "Ceremony", pos: 0.89 },
  ];

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: L.PROGRESS_H, zIndex: 50 }}>
      <GlassCard style={{
        position: "absolute", inset: 0,
        borderRadius: 0, display: "flex", alignItems: "center", padding: "0 36px",
      }}>
        {/* Phase name */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{
            fontSize: TYPOGRAPHY.overline, fontWeight: 700, color: GD_ACCENT,
            letterSpacing: 2, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif", marginBottom: 3,
          }}>
            Current Phase
          </div>
          <div style={{
            fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: "white",
            fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {name}
          </div>
        </div>

        {/* Progress track */}
        <div style={{ flex: 1, position: "relative", height: 44, display: "flex", alignItems: "center" }}>
          {/* Track background */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            transform: "translateY(-50%)", height: 6,
            background: "rgba(255,255,255,0.08)", borderRadius: 3,
          }} />
          {/* Fill */}
          <div style={{
            position: "absolute", left: 0, top: "50%",
            transform: "translateY(-50%)",
            width: `${progress * 100}%`, height: 6,
            background: `linear-gradient(90deg, ${GD_VIOLET}, ${GD_PINK})`, borderRadius: 3,
          }} />
          {/* Milestones */}
          {milestones.map((m) => (
            <div key={m.label} style={{
              position: "absolute", left: `${m.pos * 100}%`, top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: progress >= m.pos ? GD_ACCENT : "rgba(255,255,255,0.2)",
                border: `2px solid ${progress >= m.pos ? GD_VIOLET : "rgba(255,255,255,0.1)"}`,
              }} />
              <div style={{
                position: "absolute", top: -18,
                fontSize: TYPOGRAPHY.overline, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", letterSpacing: 0.5,
              }}>
                {m.label}
              </div>
            </div>
          ))}
          {/* GameDay logo cursor */}
          <div style={{
            position: "absolute",
            left: `${progress * 100}%`,
            top: "50%",
            transform: "translate(-50%, -120%)",
            width: 30, height: 30, pointerEvents: "none",
          }}>
            <Img
              src={GAMEDAY_LOGO}
              style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(139,92,246,0.9))" }}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITION
// ─────────────────────────────────────────────────────────────────────────────
export const GameDayMainEventV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gameCountdown   = calculateCountdown(frame, STREAM_START, GAME_START, fps);
  const isDistributeCodes = frame >= 45000;
  const isSupportVideo  = frame >= P.SUPPORT_IN && frame <= P.SUPPORT_OUT + 30;

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>

      {/* ── Layer 0: Base background (always) ── */}
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />

      {/* ── Layer 1: Europe map (frames 150–960) ── */}
      <EuropeMapBackground frame={frame} fps={fps} />

      {/* ── Layer 2: Welcome hero (frames 0–210, fullscreen solo) ── */}
      <WelcomeHero frame={frame} fps={fps} />

      {/* ── Layer 3: Countdown timer (top-right, from frame 60) ── */}
      <CountdownTimer frame={frame} fps={fps} gameCountdown={gameCountdown} isDistributeCodes={isDistributeCodes} />

      {/* ── Layer 4: Stats column (right side, frames 210–750) ── */}
      {!isSupportVideo && <StatsColumn frame={frame} fps={fps} />}

      {/* ── Layer 5: Vienna spotlight card (centered, frames 560–780) ── */}
      {!isSupportVideo && <ViennaSpotlight frame={frame} fps={fps} />}

      {/* ── Layer 6: Stream host card — Linda (bottom strip, frames 660–1800) ── */}
      {!isSupportVideo && <StreamHostCard frame={frame} fps={fps} />}

      {/* ── Layer 7: Greeting bubble (above host card, frames 780–1080) ── */}
      {!isSupportVideo && <GreetingBubble frame={frame} fps={fps} />}

      {/* ── Layer 8: Schedule sidebar (right side, from frame 900) ── */}
      {!isSupportVideo && <ScheduleSidebar frame={frame} fps={fps} />}

      {/* ── Layer 9: Info cards (left side, frames 1100–9300) ── */}
      {!isSupportVideo && <InfoCardDisplay frame={frame} fps={fps} />}

      {/* ── Layer 10: Organizer section — Jerome & Anda (frames 1800–9300) ── */}
      {!isSupportVideo && <OrganizerSection frame={frame} fps={fps} />}

      {/* ── Layer 11: Speaker indicator (bottom-right, from frame 1080) ── */}
      {!isSupportVideo && <SpeakerIndicator frame={frame} fps={fps} />}

      {/* ── Layer 12: Audio badge (always) ── */}
      <AudioBadge muted={false} />

      {/* ── Layer 13: Mihaly support video (full-screen, frames 10800–12599) ── */}
      {/* Sequence resets useCurrentFrame() to 0 so Video seeks correctly */}
      <Sequence from={P.SUPPORT_IN} durationInFrames={P.SUPPORT_OUT - P.SUPPORT_IN + 1} layout="none">
        <SupportVideoSection />
      </Sequence>

      {/* ── Layer 14: Progress bar (always, bottom strip) ── */}
      <ProgressBar frame={frame} totalFrames={54000} />

      {/* ── Remotion Studio chapter markers ── */}
      {CHAPTERS_V2.map((seg) => (
        <Sequence
          key={seg.label}
          from={seg.startFrame}
          durationInFrames={seg.endFrame - seg.startFrame + 1}
          name={seg.speakers ? `${seg.label} (${seg.speakers})` : seg.label}
          layout="none"
        >
          <></>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
