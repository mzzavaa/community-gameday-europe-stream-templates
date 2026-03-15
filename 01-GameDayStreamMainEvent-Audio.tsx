import React from "react";
import {
  AbsoluteFill,
  Img,
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
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  TYPOGRAPHY,
  ScheduleSegment,
  CardState,
} from "./shared/GameDayDesignSystem";

// ── UG Vienna Logo URL ──
const UG_VIENNA_LOGO =
  "https://awscommunitydach.notion.site/image/attachment%3A7f5dcfa0-c808-411f-85e7-b8b2283e2c5a%3AAWS_Vienna_-_Vienna_Austria.jpg?table=block&id=3090df17-987f-80a9-a26b-de59a394b30a&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2";

// ── Europe Map ──
const GD_MAP = staticFile("AWSCommunityGameDayEurope/europe-map.png");

// ── Sidebar Schedule (6 high-level segments matching actual event schedule) ──
// 18:00–18:30 = 30 min = 54000 frames at 30fps
//
// Sidebar display order (matches visual layout, not strict chronological):
//   18:00–18:06  Community Intro (6 min = 10800 frames)
//   18:06–18:07  Support Process (1 min = 1800 frames)
//   18:07–18:13  Special Guest (6 min = 10800 frames) — not revealed in sidebar
//   18:13–18:14  AWS Gamemasters Intro (1 min = 1800 frames) — no names shown
//   18:14–18:25  GameDay Instructions (11 min = 19800 frames)
//   18:25–18:30  Distribute Codes (5 min = 9000 frames)
//
export const MAIN_EVENT_SEGMENTS: ScheduleSegment[] = [
  { label: "Community Intro", startFrame: 0, endFrame: 10799, speakers: "Jerome & Anda" },
  { label: "Support Process", startFrame: 10800, endFrame: 12599 },
  { label: "Special Guest", startFrame: 12600, endFrame: 23399 },
  { label: "AWS Gamemasters Intro", startFrame: 23400, endFrame: 25199 },
  { label: "GameDay Instructions", startFrame: 25200, endFrame: 44999, speakers: "Arnaud & Loïc" },
  { label: "Distribute Codes", startFrame: 45000, endFrame: 53999 },
];

// ── Detailed chapter markers (for Remotion Studio timeline only) ──
// These map to the actual event flow for precise scrubbing in Studio
const TIMELINE_CHAPTERS: ScheduleSegment[] = [
  // Community Intro (18:00–18:06, 6 min)
  { label: "Linda — Welcome & Intro", startFrame: 0, endFrame: 1799, speakers: "Linda Mohamed" },
  { label: "Jerome & Anda — Community GameDay", startFrame: 1800, endFrame: 9299, speakers: "Jerome & Anda" },
  { label: "Linda — Transition", startFrame: 9300, endFrame: 10799, speakers: "Linda Mohamed" },
  // Support Process (18:06–18:07, 1 min)
  { label: "Support Process Video", startFrame: 10800, endFrame: 12599 },
  // Special Guest (18:07–18:13, 6 min)
  { label: "Linda Introduces Special Guest", startFrame: 12600, endFrame: 14399, speakers: "Linda Mohamed" },
  { label: "Special Guest", startFrame: 14400, endFrame: 23399 },
  // AWS Gamemasters Intro (18:13–18:14, 1 min)
  { label: "AWS Gamemasters Intro", startFrame: 23400, endFrame: 25199 },
  // GameDay Instructions (18:14–18:25, 11 min)
  { label: "GameDay Rules & Scoring", startFrame: 25200, endFrame: 32399, speakers: "Arnaud & Loïc" },
  { label: "Challenge Walkthrough", startFrame: 32400, endFrame: 39599, speakers: "Arnaud & Loïc" },
  { label: "Tips & Best Practices", startFrame: 39600, endFrame: 44999, speakers: "Arnaud & Loïc" },
  // Distribute Codes (18:25–18:30, 5 min)
  { label: "Distribute Team Codes", startFrame: 45000, endFrame: 49499 },
  { label: "Final Prep & Go!", startFrame: 49500, endFrame: 53999 },
];


// ── Layout Constants ──
const LAYOUT = {
  MARGIN: 36,
  SIDEBAR_WIDTH_FULL: "42%",
  SIDEBAR_WIDTH_COMPACT: "28%",
  SIDEBAR_ENTRY_FRAME: 900,
  SIDEBAR_COMPACT_FRAME: 1800,
  GREETING_END_FRAME: 239,
  INFO_CARDS_START_FRAME: 240,
  INFO_CARDS_END_FRAME: 1799,
  ORGANIZER_START_FRAME: 1800,
  ORGANIZER_END_FRAME: 9000,
  PHASE_TIMELINE_HEIGHT: 80,
  LABEL_FONT_SIZE: TYPOGRAPHY.captionSmall,
};

// ── Speaker Face Mapping ──
const SPEAKER_FACES: Record<string, string> = {
  "Linda Mohamed": "AWSCommunityGameDayEurope/faces/linda.jpg",
  "Jerome": "AWSCommunityGameDayEurope/faces/jerome.jpg",
  "Anda": "AWSCommunityGameDayEurope/faces/anda.jpg",
};

// ── Phase Timeline Milestones ──
const PHASE_MILESTONES = [
  { label: "Game Start", position: 0.056 },
  { label: "Gameplay ~2h", position: 0.5 },
  { label: "Ceremony", position: 0.89 },
];

// ── Current Speaker Helper ──
function getCurrentSpeaker(
  frame: number,
  chapters: ScheduleSegment[]
): {
  current: { name: string; face: string } | null;
  next: { name: string; face: string } | null;
} {
  // Find the active chapter based on the current frame
  const activeChapter = chapters.find(
    (ch) => frame >= ch.startFrame && frame <= ch.endFrame
  );

  if (!activeChapter || !activeChapter.speakers) {
    return { current: null, next: null };
  }

  const currentName = activeChapter.speakers;
  const currentFace = SPEAKER_FACES[currentName] ?? "";

  // Find the next chapter with a different speaker
  const activeIndex = chapters.indexOf(activeChapter);
  let nextSpeaker: { name: string; face: string } | null = null;

  for (let i = activeIndex + 1; i < chapters.length; i++) {
    const ch = chapters[i];
    if (ch.speakers && ch.speakers !== currentName) {
      nextSpeaker = {
        name: ch.speakers,
        face: SPEAKER_FACES[ch.speakers] ?? "",
      };
      break;
    }
  }

  return {
    current: { name: currentName, face: currentFace },
    next: nextSpeaker,
  };
}

// ── Timed info cards that appear as the host speaks ──
// These reinforce key points from the moderation for attendees who may have bad audio
interface InfoCard {
  text: string;
  startFrame: number;
  endFrame: number;
  borderColor: string;
  label?: string;
  highlight?: { text: string; color: string };
  organizers?: Array<{
    name: string;
    face: string;
    ug: string;
    location: string;
    flag?: string;
  }>;
}

const INTRO_INFO_CARDS: InfoCard[] = [
  {
    text: "53+ AWS User Groups across 20+ countries competing simultaneously",
    startFrame: 240,
    endFrame: 539,
    borderColor: GD_ACCENT,
    label: "FIRST AWS COMMUNITY GAMEDAY EUROPE",
  },
  {
    text: "The countdown at the top shows 30 minutes until game start — keep an eye on it",
    startFrame: 540,
    endFrame: 779,
    borderColor: GD_VIOLET,
    label: "COUNTDOWN TO GAME START",
  },
  {
    text: "Connect your audio now — if it's not working, use the provided fallback video so you don't miss the GameDay instructions",
    startFrame: 780,
    endFrame: 1019,
    borderColor: GD_ORANGE,
    label: "AUDIO CHECK",
    highlight: { text: "Connect your audio now", color: GD_ORANGE },
  },
  {
    text: "This stream will be muted during gameplay — we'll be back when the timer runs out to celebrate the global winners together",
    startFrame: 1020,
    endFrame: 1349,
    borderColor: GD_PINK,
    label: "IMPORTANT",
    highlight: { text: "muted during gameplay", color: GD_PINK },
  },
  {
    text: "Everything behind this event was organized by volunteers — people who are not employed by AWS, just like every User Group leader in the 53 participating cities",
    startFrame: 1350,
    endFrame: 1559,
    borderColor: GD_PINK,
    label: "ORGANIZED BY THE COMMUNITY",
    highlight: { text: "not employed by AWS", color: GD_ACCENT },
  },
  {
    text: "The two most important people behind this initiative — they will walk you through the GameDay details",
    startFrame: 1560,
    endFrame: 1799,
    borderColor: GD_VIOLET,
    label: "MEET THE ORGANIZERS",
    organizers: [
      { name: "Jerome", face: "AWSCommunityGameDayEurope/faces/jerome.jpg", ug: "AWS User Group Belgium", location: "Brussels", flag: "🇧🇪" },
      { name: "Anda", face: "AWSCommunityGameDayEurope/faces/anda.jpg", ug: "AWS User Group Geneva", location: "Geneva", flag: "🇨🇭" },
    ],
  },
];

// ── InfoCardDisplay Sub-Component ──
const InfoCardDisplay: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  // No cards during greeting phase (frames 0–239)
  if (frame < LAYOUT.INFO_CARDS_START_FRAME || frame > LAYOUT.INFO_CARDS_END_FRAME) return null;

  // Find the active card for the current frame
  const activeCard = INTRO_INFO_CARDS.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );
  if (!activeCard) return null;

  // Spring-animated entry using DesignSystem springConfig.entry
  const cardIn = spring({
    frame: frame - activeCard.startFrame,
    fps,
    config: springConfig.entry,
  });

  // Fade-out exit with ≥ 20 frames of transition
  const fadeOutFrames = 25;
  const cardOut = interpolate(
    frame,
    [activeCard.endFrame - fadeOutFrames, activeCard.endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = cardIn * cardOut;

  // Helper to render text with highlight support
  const renderCardText = (card: InfoCard) => {
    if (!card.highlight) {
      return card.text;
    }

    const { text: highlightText } = card.highlight;
    const idx = card.text.indexOf(highlightText);
    if (idx === -1) {
      return card.text;
    }

    const before = card.text.slice(0, idx);
    const after = card.text.slice(idx + highlightText.length);

    return (
      <>
        {before}
        <span style={{ color: card.borderColor, fontWeight: 700 }}>
          {highlightText}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: LAYOUT.MARGIN,
        width: "50%",
        opacity,
        transform: `translateY(${(1 - cardIn) * 25}px)`,
      }}
    >
      <GlassCard
        style={{
          padding: "20px 32px",
          borderLeft: `4px solid ${activeCard.borderColor}`,
        }}
      >
        {activeCard.label && (
          <div
            style={{
              fontSize: LAYOUT.LABEL_FONT_SIZE,
              fontWeight: 700,
              color: activeCard.borderColor,
              letterSpacing: 3,
              textTransform: "uppercase" as const,
              marginBottom: 8,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {activeCard.label}
          </div>
        )}
        <div
          style={{
            fontSize: TYPOGRAPHY.body,
            fontWeight: 500,
            color: "white",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.5,
          }}
        >
          {renderCardText(activeCard)}
        </div>
        {activeCard.organizers && (
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {activeCard.organizers.map((org) => (
              <div
                key={org.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Img
                  src={staticFile(org.face)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: `0 0 12px ${GD_VIOLET}`,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.caption,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {org.name}
                  </div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.labelSmall,
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {org.ug}
                  </div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.labelSmall,
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Inter', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {org.flag} 📍 {org.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

// ── Stream Host Card Sub-Component (compact, positioned top-left below countdown) ──
const StreamHostCard: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const cardEntry = spring({
    frame: frame - staggeredEntry(0, 0),
    fps,
    config: springConfig.entry,
  });
  const nameEntry = spring({
    frame: frame - staggeredEntry(0, 1, 25),
    fps,
    config: springConfig.entry,
  });
  const titleEntry = spring({
    frame: frame - staggeredEntry(0, 2, 25),
    fps,
    config: springConfig.entry,
  });

  // Transition from full-width to compact at frame 240
  const compactProgress = spring({
    frame: frame - LAYOUT.INFO_CARDS_START_FRAME,
    fps,
    config: springConfig.entry,
  });

  // Interpolated values for smooth transition
  const cardWidth = interpolate(compactProgress, [0, 1], [1208, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const avatarSize = interpolate(compactProgress, [0, 1], [80, 64], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardPaddingV = interpolate(compactProgress, [0, 1], [24, 16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardPaddingH = interpolate(compactProgress, [0, 1], [28, 24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Full-width mode: show full title, location, and large UG cover
  // Compact mode: show short title and small UG logo
  const fullWidthOpacity = interpolate(compactProgress, [0, 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const compactOpacity = interpolate(compactProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: LAYOUT.MARGIN,
        width: cardWidth,
        opacity: cardEntry,
        transform: `translateY(${interpolate(cardEntry, [0, 1], [20, 0])}px)`,
      }}
    >
      <GlassCard
        style={{
          padding: `${cardPaddingV}px ${cardPaddingH}px`,
          borderLeft: `4px solid ${GD_VIOLET}`,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Avatar */}
        <Img
          src={staticFile("AWSCommunityGameDayEurope/faces/linda.jpg")}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: "50%",
            boxShadow: `0 0 14px 3px ${GD_VIOLET}88`,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        {/* Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: LAYOUT.LABEL_FONT_SIZE,
              color: GD_ACCENT,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 3,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
            }}
          >
            Your Stream Host
          </div>
          <div
            style={{
              opacity: nameEntry,
              transform: `translateX(${interpolate(nameEntry, [0, 1], [15, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.h6,
                fontWeight: 800,
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Linda Mohamed
            </div>
          </div>

          {/* Full-width: full title + location */}
          {fullWidthOpacity > 0 && (
            <div
              style={{
                opacity: titleEntry * fullWidthOpacity,
                transform: `translateX(${interpolate(titleEntry, [0, 1], [15, 0])}px)`,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  fontSize: TYPOGRAPHY.captionSmall,
                  color: "#94a3b8",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.4,
                }}
              >
                AWS Community Hero · AWS &amp; Women's User Group Vienna · Förderverein AWS Community DACH
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.label,
                  color: "#cbd5e1",
                  fontFamily: "'Inter', sans-serif",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width={12} height={14} viewBox="0 0 12 16" fill={GD_ACCENT}>
                  <path d="M6 0C2.7 0 0 2.7 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5S4.6 3.5 6 3.5 8.5 4.6 8.5 6 7.4 8.5 6 8.5z" />
                </svg>
                🇦🇹 Vienna, Austria
              </div>
            </div>
          )}

          {/* Compact: short title */}
          {compactOpacity > 0 && (
            <div
              style={{
                opacity: compactOpacity,
                marginTop: 2,
              }}
            >
              <div
                style={{
                  fontSize: TYPOGRAPHY.labelSmall,
                  color: "#94a3b8",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                AWS Community Hero · AWS &amp; Women's UG Vienna
              </div>
            </div>
          )}
        </div>

        {/* Right side: UG Vienna Logo */}
        <div style={{ flexShrink: 0 }}>
          {/* Full-width: V4 CardCover style — large logo with label */}
          {fullWidthOpacity > 0 && (
            <div style={{ opacity: fullWidthOpacity }}>
              <div
                style={{
                  width: 200,
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "600 / 337",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                  }}
                >
                  <Img
                    src={UG_VIENNA_LOGO}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
                <div
                  style={{
                    padding: "6px 12px 8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.overline,
                      fontWeight: 700,
                      color: GD_ACCENT,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    AWS UG Vienna
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact: small logo */}
          {compactOpacity > 0 && (
            <div style={{ opacity: compactOpacity }}>
              <div
                style={{
                  width: 100,
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "600 / 337",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Img
                    src={UG_VIENNA_LOGO}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

// ── SpeakerBubbleGreeting Sub-Component (chat bubble above StreamHostCard, frames 0–239) ──
const SpeakerBubbleGreeting: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  // Only render during greeting phase
  if (frame > 280) return null;

  // Entry animation
  const entrySpring = spring({
    frame,
    fps,
    config: springConfig.entry,
  });

  // Exit fade starting around frame 220 so it's fully gone by ~260
  const exitSpring = spring({
    frame: frame - 220,
    fps,
    config: springConfig.exit,
  });
  const exitOpacity = interpolate(exitSpring, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = entrySpring * exitOpacity;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 310,
        left: LAYOUT.MARGIN,
        maxWidth: 520,
        opacity,
        transform: `translateY(${interpolate(entrySpring, [0, 1], [15, 0])}px)`,
      }}
    >
      <GlassCard
        style={{
          padding: "18px 26px",
          border: `1px solid ${GD_VIOLET}40`,
          borderRadius: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: TYPOGRAPHY.bodySmall,
            fontWeight: 500,
            color: "white",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.55,
          }}
        >
          &ldquo;Hello everyone! I will guide you through the stream today! Make sure you have your audio turned on for the next 30 minutes&rdquo;
        </div>
      </GlassCard>
      {/* Speech bubble tail pointing down toward host card */}
      <div
        style={{
          position: "relative",
          left: 48,
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: `12px solid rgba(255,255,255,0.06)`,
        }}
      />
    </div>
  );
};

// ── SpeakerBubbles Sub-Component (current + next speaker, visible throughout composition) ──
const SpeakerBubbles: React.FC<{
  frame: number;
  fps: number;
  segments: ScheduleSegment[];
  chapters: ScheduleSegment[];
}> = ({ frame, fps, chapters }) => {
  const { current, next } = getCurrentSpeaker(frame, chapters);

  const entrySpring = spring({
    frame,
    fps,
    config: springConfig.entry,
  });

  // Pulsing speaking indicator (cycles every 40 frames)
  const pulse = interpolate(frame % 40, [0, 10, 20, 30, 40], [0.4, 1, 0.4, 0.8, 0.4], {
    extrapolateRight: "clamp",
  });

  const hasCurrent = current !== null;

  if (!hasCurrent) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 86,
        right: 36,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        opacity: entrySpring,
        transform: `translateY(${interpolate(entrySpring, [0, 1], [10, 0])}px)`,
        zIndex: 40,
      }}
    >
      {/* Next speaker (above current, smaller, dimmed) */}
      {next && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.5,
            padding: "0 4px",
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.overline,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
            }}
          >
            Next
          </div>
          <div
            style={{
              fontSize: TYPOGRAPHY.overline,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {next.name}
          </div>
        </div>
      )}

      {/* Current speaker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${GD_VIOLET}40`,
          borderRadius: 10,
          padding: "6px 14px",
        }}
      >
        {/* Pulsing speaking indicator */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: GD_ORANGE,
            boxShadow: `0 0 ${6 + pulse * 4}px ${GD_ORANGE}`,
            opacity: 0.5 + pulse * 0.5,
          }}
        />
        <div
          style={{
            fontSize: TYPOGRAPHY.label,
            fontWeight: 700,
            color: "white",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 0.5,
          }}
        >
          {current.name}
        </div>
      </div>
    </div>
  );
};

// ── ScheduleCard Sub-Component (matching original overlay style) ──
const ScheduleCard: React.FC<{
  segment: ScheduleSegment;
  state: CardState;
  frame: number;
  fps: number;
  index: number;
  compact?: boolean;
}> = ({ segment, state, frame, fps, index, compact = false }) => {
  const enterFrame = staggeredEntry(0, index, 20);
  const enterSpring = spring({
    frame: frame - enterFrame,
    fps,
    config: springConfig.entry,
  });

  const borderColor =
    state === "active" ? GD_VIOLET : state === "completed" ? "#334155" : "#1e293b";
  const bgOpacity = state === "active" ? 0.12 : 0.04;
  const textColor =
    state === "active" ? "white" : state === "completed" ? "#64748b" : "#94a3b8";

  return (
    <div
      style={{
        opacity: enterSpring,
        transform: `translateX(${(1 - enterSpring) * 40}px)`,
        marginBottom: compact ? 8 : 12,
      }}
    >
      <div
        style={{
          background: `rgba(255,255,255,${bgOpacity})`,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: compact ? 10 : 14,
          padding: compact ? "10px 14px" : "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: compact ? TYPOGRAPHY.caption : TYPOGRAPHY.h6,
              fontWeight: 700,
              color: textColor,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {segment.label}
          </div>

        </div>
        {state === "active" && (
          <div
            style={{
              fontSize: compact ? TYPOGRAPHY.overline : TYPOGRAPHY.label,
              fontWeight: 700,
              color: GD_VIOLET,
              textTransform: "uppercase",
              letterSpacing: compact ? 1.5 : 2,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            LIVE
          </div>
        )}
        {state === "completed" && (
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5l4 4L13 1" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

// ── PhaseMarker Sub-Component ──
const PhaseMarker: React.FC<{
  frame: number;
  segments: ScheduleSegment[];
}> = ({ frame, segments }) => {
  const { name, progress } = getPhaseInfo(frame, segments);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 36,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: TYPOGRAPHY.captionSmall,
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
            marginBottom: 6,
          }}
        >
          Current Phase
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h6,
            fontWeight: 700,
            color: "white",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          width: 280,
          height: 6,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${GD_VIOLET}, ${GD_PINK})`,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};

// ── PhaseTimeline Sub-Component (replaces PhaseMarker) ──
const PhaseTimeline: React.FC<{
  frame: number;
  segments: ScheduleSegment[];
  totalFrames: number;
}> = ({ frame, segments, totalFrames }) => {
  const { name } = getPhaseInfo(frame, segments);
  const overallProgress = Math.min(1, Math.max(0, frame / totalFrames));

  // Bar dimensions (right portion of the timeline)
  const barLeftOffset = 320; // space for the phase label on the left
  const barRightPadding = 36;
  const barWidth = 1280 - barLeftOffset - barRightPadding;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: LAYOUT.PHASE_TIMELINE_HEIGHT,
      }}
    >
      <GlassCard
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: LAYOUT.PHASE_TIMELINE_HEIGHT,
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 36px",
        }}
      >
        {/* Left side: Current Phase label */}
        <div style={{ width: barLeftOffset - 36, flexShrink: 0 }}>
          <div
            style={{
              fontSize: TYPOGRAPHY.labelSmall,
              fontWeight: 700,
              color: GD_ACCENT,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              marginBottom: 4,
            }}
          >
            Current Phase
          </div>
          <div
            style={{
              fontSize: TYPOGRAPHY.bodySmall,
              fontWeight: 700,
              color: "white",
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>
        </div>

        {/* Right side: Progress bar with milestones and snail */}
        <div
          style={{
            flex: 1,
            position: "relative",
            height: 40,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Track background */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 3,
            }}
          />

          {/* Filled progress */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: `${overallProgress * 100}%`,
              height: 6,
              background: `linear-gradient(90deg, ${GD_VIOLET}, ${GD_PINK})`,
              borderRadius: 3,
            }}
          />

          {/* Milestone markers */}
          {PHASE_MILESTONES.map((milestone) => (
            <div
              key={milestone.label}
              style={{
                position: "absolute",
                left: `${milestone.position * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Marker dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    overallProgress >= milestone.position
                      ? GD_ACCENT
                      : "rgba(255,255,255,0.25)",
                  border: `2px solid ${
                    overallProgress >= milestone.position
                      ? GD_VIOLET
                      : "rgba(255,255,255,0.15)"
                  }`,
                }}
              />
              {/* Milestone label */}
              <div
                style={{
                  position: "absolute",
                  top: -18,
                  fontSize: TYPOGRAPHY.overline,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap",
                  letterSpacing: 0.5,
                }}
              >
                {milestone.label}
              </div>
            </div>
          ))}

          {/* Snail mascot moving along the bar */}
          <div
            style={{
              position: "absolute",
              left: `${overallProgress * 100}%`,
              top: "50%",
              transform: "translate(-50%, -100%)",
              fontSize: TYPOGRAPHY.body,
              lineHeight: 1,
              transition: "left 0.1s linear",
            }}
          >
            🐌
          </div>
        </div>
      </GlassCard>
    </div>
  );
};


// ── OrganizerSection Sub-Component (Jerome & Anda, frames 1800–9000) ──
const OrganizerSection: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  // Not visible outside the organizer window
  if (frame < LAYOUT.ORGANIZER_START_FRAME - 10 || frame > LAYOUT.ORGANIZER_END_FRAME + 60) return null;

  // Spring entry at frame 1800
  const entrySpring = spring({
    frame: frame - LAYOUT.ORGANIZER_START_FRAME,
    fps,
    config: springConfig.entry,
  });

  // Spring exit at frame 9000
  const exitSpring = spring({
    frame: frame - LAYOUT.ORGANIZER_END_FRAME,
    fps,
    config: springConfig.exit,
  });
  const exitOpacity = interpolate(exitSpring, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = entrySpring * exitOpacity;
  if (opacity <= 0) return null;

  const organizers = [
    {
      name: "Jerome",
      face: "AWSCommunityGameDayEurope/faces/jerome.jpg",
      ug: "AWS User Group Belgium",
      location: "Brussels",
      flag: "🇧🇪",
    },
    {
      name: "Anda",
      face: "AWSCommunityGameDayEurope/faces/anda.jpg",
      ug: "AWS User Group Geneva",
      location: "Geneva",
      flag: "🇨🇭",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 260,
        left: LAYOUT.MARGIN,
        width: "50%",
        opacity,
        transform: `translateY(${interpolate(entrySpring, [0, 1], [20, 0])}px)`,
        zIndex: 30,
      }}
    >
      <GlassCard
        style={{
          padding: "20px 28px",
          borderLeft: `4px solid ${GD_VIOLET}`,
        }}
      >
        {/* Currently Speaking label */}
        <div
          style={{
            fontSize: LAYOUT.LABEL_FONT_SIZE,
            fontWeight: 700,
            color: GD_ACCENT,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            marginBottom: 6,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Currently Speaking
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.label,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Inter', sans-serif",
            marginBottom: 16,
          }}
        >
          Why this Community GameDay exists
        </div>

        {/* Two OrganizerCards side by side */}
        <div style={{ display: "flex", gap: 20 }}>
          {organizers.map((org) => (
            <div
              key={org.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <Img
                src={staticFile(org.face)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: `0 0 12px ${GD_VIOLET}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.caption,
                    fontWeight: 700,
                    color: "white",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {org.name}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.labelSmall,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {org.ug}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.labelSmall,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {org.flag}{" "}
                  <svg width={10} height={12} viewBox="0 0 12 16" fill={GD_ACCENT}>
                    <path d="M6 0C2.7 0 0 2.7 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5S4.6 3.5 6 3.5 8.5 4.6 8.5 6 7.4 8.5 6 8.5z" />
                  </svg>{" "}
                  {org.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};



// ── Main Event Composition ──
export const GameDayMainEvent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Game-start countdown (shows 30:00 at frame 0) ──
  const gameCountdown = calculateCountdown(frame, STREAM_START, GAME_START, fps);

  // ── Active segment detection ──
  const isDistributeCodes = frame >= 45000;

  // ── Sidebar slide-in (delayed to 30s = frame 900, while host is still introducing agenda) ──
  const sidebarEntry = spring({
    frame: frame - LAYOUT.SIDEBAR_ENTRY_FRAME,
    fps,
    config: springConfig.entry,
  });

  // ── Sidebar compact mode (42% → 28% at frame 1800) ──
  const sidebarCompactProgress = spring({
    frame: frame - LAYOUT.SIDEBAR_COMPACT_FRAME,
    fps,
    config: springConfig.entry,
  });
  const isCompact = frame >= LAYOUT.SIDEBAR_COMPACT_FRAME;
  const sidebarWidth = interpolate(sidebarCompactProgress, [0, 1], [42, 28]);
  const sidebarWidthStr = `${sidebarWidth}%`;

  // ── Countdown timer entry ──
  const timerEntry = spring({
    frame: frame - staggeredEntry(0, 1),
    fps,
    config: springConfig.entry,
  });

  // ── Distribute Codes pulsing countdown ──
  const distributeCodesPulse = isDistributeCodes
    ? interpolate(frame % 40, [0, 20, 40], [1, 1.06, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  const distributeCodesGlow = isDistributeCodes
    ? interpolate(frame % 60, [0, 30, 60], [0.4, 1, 0.4], {
        extrapolateRight: "clamp",
      })
    : 0;

  // ── Map background fade (visible during first ~12000 frames, fades at edges) ──
  const mapOpacity = interpolate(frame, [0, 60, 10800, 12000], [0, 0.3, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Inter', sans-serif",
        background: GD_DARK,
      }}
    >
      {/* Layer 1: Background */}
      <BackgroundLayer darken={0.7} />
      <HexGridOverlay />

      {/* Layer 1b: Europe Map with full edge fade (vignette) — oversized container, no borderRadius */}
      {mapOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 1080,
            height: 600,
            transform: "translate(-50%, -45%)",
            opacity: mapOpacity,
            filter: "saturate(0.5) brightness(0.7)",
          }}
        >
          <Img
            src={GD_MAP}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Radial vignette — fades all edges to full transparency before container boundary */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `radial-gradient(ellipse at center, transparent 20%, ${GD_DARK}99 55%, ${GD_DARK} 75%)`,
            }}
          />
        </div>
      )}

      {/* Layer 2: Audio Badge */}
      <AudioBadge muted={false} />

      {/* Layer 4: Game-Start Countdown — centered when distributing codes */}
      {isDistributeCodes && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: `translateX(-50%) scale(${distributeCodesPulse})`,
            zIndex: 50,
            opacity: timerEntry,
          }}
        >
          <GlassCard
            style={{
              padding: "20px 48px",
              borderTop: `3px solid ${GD_ORANGE}60`,
              boxShadow: `0 0 ${30 + distributeCodesGlow * 20}px ${GD_ORANGE}${Math.round(distributeCodesGlow * 80).toString(16).padStart(2, "0")}`,
            }}
          >
            <div
              style={{
                fontSize: LAYOUT.LABEL_FONT_SIZE,
                fontWeight: 700,
                color: GD_ORANGE,
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              Game Starts In
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.timerSmall,
                fontWeight: 900,
                color: GD_ORANGE,
                fontFamily: "'Inter', monospace",
                letterSpacing: 4,
                textAlign: "center",
                textShadow: `0 0 40px ${GD_ORANGE}80`,
              }}
            >
              {formatTime(gameCountdown)}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Layer 5a: Countdown timer — separate element, top-left (matching original overlay) */}
      {!isDistributeCodes && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 36,
            zIndex: 50,
            opacity: timerEntry,
            transform: `translateY(${interpolate(timerEntry, [0, 1], [15, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: LAYOUT.LABEL_FONT_SIZE,
              fontWeight: 700,
              color: GD_ACCENT,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              marginBottom: 8,
            }}
          >
            GameDay Countdown
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: "white",
              fontFamily: "'Inter', monospace",
              letterSpacing: 4,
              textShadow: `0 0 60px ${GD_VIOLET}80, 0 0 120px ${GD_VIOLET}40`,
            }}
          >
            {formatTime(gameCountdown)}
          </div>
        </div>
      )}

      {/* Layer 5a-2: SpeakerBubbles — current + next speaker, visible throughout */}
      <SpeakerBubbles
        frame={frame}
        fps={fps}
        segments={MAIN_EVENT_SEGMENTS}
        chapters={TIMELINE_CHAPTERS}
      />

      {/* Layer 5b: SpeakerBubbleGreeting — chat bubble above StreamHostCard, frames 0–239 */}
      <SpeakerBubbleGreeting frame={frame} fps={fps} />

      {/* Layer 5c: Stream Host Card (Linda) — visible during first 60 seconds */}
      {frame < 1800 && <StreamHostCard frame={frame} fps={fps} />}

      {/* Layer 6: Info cards — key points from moderation displayed on screen */}
      <InfoCardDisplay frame={frame} fps={fps} />

      {/* Layer 6b: Schedule Sidebar (right side, matching original overlay) — schedule only */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: sidebarWidthStr,
          background: `linear-gradient(270deg, ${GD_DARK}f5 0%, ${GD_DARK}cc 80%, transparent 100%)`,
          transform: `translateX(${(1 - sidebarEntry) * 100}%)`,
          padding: isCompact ? "28px 24px 28px 36px" : "40px 36px 40px 50px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: isCompact ? TYPOGRAPHY.label : LAYOUT.LABEL_FONT_SIZE,
            fontWeight: 700,
            color: GD_ACCENT,
            letterSpacing: isCompact ? 2 : 3,
            textTransform: "uppercase",
            marginBottom: isCompact ? 14 : 20,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Schedule Until Game Start
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {MAIN_EVENT_SEGMENTS.map((seg, i) => (
            <ScheduleCard
              key={seg.label}
              segment={seg}
              state={getCardState(frame, seg)}
              frame={frame}
              fps={fps}
              index={i}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      {/* Layer 7: OrganizerSection — Jerome & Anda, frames 1800–9000 */}
      <OrganizerSection frame={frame} fps={fps} />

      {/* Layer 7: Phase Timeline (replaces PhaseMarker) */}
      <PhaseTimeline frame={frame} segments={MAIN_EVENT_SEGMENTS} totalFrames={54000} />

      {/* ── Timeline Sequences (layout="none" = Remotion Studio chapter markers only) ── */}
      {TIMELINE_CHAPTERS.map((seg) => (
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
