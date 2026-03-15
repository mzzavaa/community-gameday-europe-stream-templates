/**
 * 04v2 – GameDayPreShowInfoV2 (Muted)
 *
 * 30-minute cinematic pre-show loop.
 * Copy of 04-GameDayStreamPreShowInfo-Muted, redesigned for:
 *   • Full-size UG spotlights with flag, city, country and context
 *   • Linda Mohamed intro (who she is, why she's hosting)
 *   • Anda & Jerome intro with real photos
 *   • What is the AWS Community / UG leaders explanation
 *   • How GameDay works step-by-step
 *   • Audio reminder slide at end of every cycle
 *   • Larger, more readable typography throughout
 */
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import {
  BackgroundLayer,
  HexGridOverlay,
  AudioBadge,
  GlassCard,
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  calculateCountdown,
  formatTime,
  STREAM_START,
  GAME_START,
  TYPOGRAPHY,
  springConfig,
} from "../shared/GameDayDesignSystem";
import { USER_GROUPS } from "../shared/userGroups";
import { ORGANIZERS, AWS_SUPPORTERS } from "../shared/organizers";

// ─── Constants ────────────────────────────────────────────────────────────────
const F = "'Amazon Ember', 'Inter', sans-serif";
const COMMUNITY_LOGO = staticFile(
  "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png"
);
const GAMEDAY_LOGO = staticFile(
  "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png"
);
const EUROPE_MAP = staticFile("AWSCommunityGameDayEurope/europe-map.png");

// Section durations (frames at 30 fps)
const S = 900; // 30 s — content slides
const U = 330; // 11 s — UG spotlight
const T = 20; // transition overlap

// ─── Global frame context (TransitionSeries resets useCurrentFrame per sequence) ─
const GlobalFrameCtx = createContext(0);

// ─── Deterministic UG shuffle ─────────────────────────────────────────────────
const SHUFFLED = [...USER_GROUPS].sort((a, b) => {
  const h = (s: string) =>
    s.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return h(a.name) - h(b.name);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useEntry(startFrame = 0, config = springConfig.entry) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config });
}

function usePulse(period = 60) {
  const frame = useCurrentFrame();
  return interpolate(frame % period, [0, period / 2, period], [0.94, 1, 0.94], {
    extrapolateRight: "clamp",
  });
}

// ─── Persistent top bar ───────────────────────────────────────────────────────
const TopBar: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        zIndex: 10,
        background: `linear-gradient(180deg, ${GD_DARK}f2, ${GD_DARK}bb)`,
        borderBottom: `1px solid ${GD_PURPLE}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        fontFamily: F,
      }}
    >
      {/* Logos */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 38 }} />
        <div
          style={{
            width: 1,
            height: 32,
            background: `${GD_PURPLE}55`,
          }}
        />
        <Img src={GAMEDAY_LOGO} style={{ height: 46 }} />
      </div>

      {/* Pre-Show badge */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: GD_ACCENT,
          textTransform: "uppercase",
          letterSpacing: 3,
          background: `${GD_PURPLE}22`,
          border: `1px solid ${GD_PURPLE}55`,
          borderRadius: 8,
          padding: "4px 14px",
        }}
      >
        🔴 Pre-Show Loop
      </div>

      {/* Countdowns */}
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              color: GD_PINK,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Stream In
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: GD_PINK,
              fontFamily: "monospace",
            }}
          >
            {formatTime(sc)}
          </div>
        </div>
        <div style={{ width: 1, height: 36, background: `${GD_PURPLE}44` }} />
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              color: GD_GOLD,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Game In
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: GD_GOLD,
              fontFamily: "monospace",
            }}
          >
            {formatTime(gc)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Slide wrapper ─────────────────────────────────────────────────────────────
const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ fontFamily: F, background: GD_DARK }}>
    <BackgroundLayer darken={0.72} />
    <HexGridOverlay />
    <AudioBadge muted />
    <TopBar />
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionHeading: React.FC<{
  icon?: string;
  label: string;
  color?: string;
}> = ({ icon, label, color = GD_ACCENT }) => {
  const o = useEntry(0);
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${interpolate(o, [0, 1], [16, 0])}px)`,
        fontSize: 14,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: 4,
        marginBottom: 28,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      {label}
    </div>
  );
};

// ─── Stagger helper ───────────────────────────────────────────────────────────
function useStagger(i: number, gap = 8) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - i * gap,
    fps,
    config: springConfig.entry,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Hero V2
// ═══════════════════════════════════════════════════════════════════════════════
const SlideHeroV2: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  const m = String(Math.floor(gc / 60)).padStart(2, "0");
  const s = String(gc % 60).padStart(2, "0");
  const pulse = usePulse(60);

  const logoEntry = useStagger(0, 1);
  const titleEntry = useStagger(4, 8);
  const timerEntry = useStagger(6, 8);
  const statsEntry = useStagger(10, 8);

  const stats = [
    { v: "57", l: "User Groups", c: GD_GOLD },
    { v: "20+", l: "Countries", c: GD_PINK },
    { v: "4+", l: "Timezones", c: GD_VIOLET },
    { v: "1st", l: "Edition Ever", c: GD_ORANGE },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Logos */}
      <div
        style={{
          opacity: logoEntry,
          transform: `scale(${interpolate(logoEntry, [0, 1], [0.88, 1])})`,
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 28,
        }}
      >
        <Img src={COMMUNITY_LOGO} style={{ height: 88 }} />
        <div
          style={{
            width: 1,
            height: 56,
            background: `linear-gradient(180deg, transparent, ${GD_VIOLET}, transparent)`,
          }}
        />
        <Img src={GAMEDAY_LOGO} style={{ height: 120 }} />
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleEntry,
          transform: `translateY(${interpolate(titleEntry, [0, 1], [24, 0])}px)`,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: GD_ACCENT,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          The First-Ever
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h2,
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1.05,
            background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 45%, ${GD_PINK} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AWS Community GameDay Europe
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.body,
            color: "rgba(255,255,255,0.5)",
            marginTop: 10,
            letterSpacing: 2,
          }}
        >
          Tuesday, March 17, 2026 · Starting 18:00 CET
        </div>
      </div>

      {/* Countdown */}
      <div
        style={{
          opacity: timerEntry,
          transform: `scale(${interpolate(timerEntry, [0, 1], [0.9, 1])} )`,
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: GD_GOLD,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 10,
          }}
        >
          🎮 Game Starts In
        </div>
        <div
          style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "center" }}
        >
          {[{ v: m, u: "MIN" }, { v: s, u: "SEC" }].map(({ v, u }, idx) => (
            <React.Fragment key={u}>
              {idx > 0 && (
                <div
                  style={{
                    fontSize: 52,
                    color: GD_GOLD,
                    opacity: 0.5,
                    paddingBottom: 14,
                    fontWeight: 300,
                  }}
                >
                  :
                </div>
              )}
              <div
                style={{
                  background: `linear-gradient(180deg, ${GD_PURPLE}44, ${GD_DARK}cc)`,
                  border: `1px solid ${GD_VIOLET}33`,
                  borderRadius: 16,
                  padding: "14px 28px",
                  textAlign: "center",
                  minWidth: 110,
                  transform: `scale(${pulse})`,
                  boxShadow: `0 0 ${24 * pulse}px ${GD_ORANGE}33`,
                }}
              >
                <div
                  style={{
                    fontSize: TYPOGRAPHY.timer,
                    fontWeight: 800,
                    color: GD_GOLD,
                    lineHeight: 1,
                    fontFamily: "monospace",
                    textShadow: `0 0 20px ${GD_ORANGE}55`,
                  }}
                >
                  {v}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: GD_ACCENT,
                    marginTop: 4,
                    letterSpacing: 2,
                  }}
                >
                  {u}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          opacity: statsEntry,
          transform: `translateY(${interpolate(statsEntry, [0, 1], [20, 0])}px)`,
          display: "flex",
          gap: 20,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.l}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${stat.c}22`,
              borderRadius: 14,
              padding: "14px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.h3,
                fontWeight: 900,
                color: stat.c,
                lineHeight: 1,
              }}
            >
              {stat.v}
            </div>
            <div
              style={{
                fontSize: 12,
                color: GD_ACCENT,
                marginTop: 6,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {stat.l}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — What's Happening Today
// ═══════════════════════════════════════════════════════════════════════════════
const SlideWhatsHappening: React.FC = () => {
  const cards = [
    {
      icon: "📡",
      title: "One Stream, 57 Cities",
      body: "Right now, AWS User Groups all over Europe are watching this exact same stream at their local venue. You are part of the first-ever pan-European AWS Community GameDay.",
      c: GD_VIOLET,
    },
    {
      icon: "🔇",
      title: "Why Is It Muted Right Now?",
      body: "This is the 30-minute pre-show loop that plays before the live stream begins at 18:00 CET. Use this time to test your audio — you'll need it for the live introductions!",
      c: GD_PINK,
    },
    {
      icon: "🎮",
      title: "The Competition",
      body: "At 18:30 CET all 57 groups start a 2-hour AWS cloud challenge simultaneously. The stream goes mute during gameplay. Your local organizer gives you team access codes.",
      c: GD_GOLD,
    },
    {
      icon: "🏆",
      title: "Stay for the Closing!",
      body: "At 20:30 CET the stream comes back live. Winners are revealed globally, together. Don't leave early — you'll want to see the results and celebrate with 57 cities.",
      c: GD_ORANGE,
    },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="📡" label="What's Happening Right Now" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          width: "100%",
          maxWidth: 1060,
        }}
      >
        {cards.map((card, i) => {
          const o = useStagger(i, 7);
          return (
            <div
              key={card.title}
              style={{
                opacity: o,
                transform: `translateY(${interpolate(o, [0, 1], [20, 0])}px)`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${card.c}28`,
                borderLeft: `3px solid ${card.c}`,
                borderRadius: 16,
                padding: "22px 26px",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{card.icon}</div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.h6,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.caption,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                }}
              >
                {card.body}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Meet Linda Mohamed
// ═══════════════════════════════════════════════════════════════════════════════
const SlideMeetLinda: React.FC = () => {
  const linda = ORGANIZERS.find((p) => p.name === "Linda")!;
  const photoEntry = useStagger(0, 1);
  const textEntry = useStagger(3, 8);
  const pointEntries = [
    useStagger(6, 8),
    useStagger(7, 8),
    useStagger(8, 8),
    useStagger(9, 8),
  ];

  const points = [
    "AWS Community Builder & AWS User Group Vienna leader",
    "Host of today's live stream and one of the key co-organizers behind this event",
    "Dedicated to connecting the AWS Community across Europe through collaborative events",
    "Will introduce you to Anda, Jerome, and the special guest — then the game begins!",
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="🎙️" label="Your Stream Host" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 52,
          width: "100%",
          maxWidth: 1060,
        }}
      >
        {/* Photo */}
        <div
          style={{
            opacity: photoEntry,
            transform: `scale(${interpolate(photoEntry, [0, 1], [0.88, 1])})`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              overflow: "hidden",
              border: `3px solid ${GD_VIOLET}66`,
              boxShadow: `0 0 48px ${GD_VIOLET}33`,
            }}
          >
            <Img
              src={staticFile(linda.face)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 13,
              color: GD_ACCENT,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {linda.flag} {linda.country}
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              opacity: textEntry,
              transform: `translateX(${interpolate(textEntry, [0, 1], [24, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: TYPOGRAPHY.h3,
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
              }}
            >
              Linda Mohamed
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.h6,
                color: GD_ACCENT,
                marginTop: 8,
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              AWS Community Builder · Stream Host & Co-Organizer
            </div>
          </div>
          {points.map((point, i) => (
            <div
              key={i}
              style={{
                opacity: pointEntries[i],
                transform: `translateX(${interpolate(pointEntries[i], [0, 1], [20, 0])}px)`,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 14,
                fontSize: TYPOGRAPHY.bodySmall,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  color: GD_GOLD,
                  flexShrink: 0,
                  marginTop: 2,
                  fontSize: 16,
                }}
              >
                ▸
              </span>
              <span>{point}</span>
            </div>
          ))}
          <div
            style={{
              opacity: pointEntries[3],
              marginTop: 8,
              background: `${GD_PURPLE}22`,
              border: `1px solid ${GD_PURPLE}44`,
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: TYPOGRAPHY.caption,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
            }}
          >
            💡 If you're wondering who this person is and why she's on your
            screen — Linda is the volunteer community organizer who is hosting
            today's global stream. She is not an AWS employee.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Meet Anda & Jerome
// ═══════════════════════════════════════════════════════════════════════════════
const SlideMeetAndaJerome: React.FC = () => {
  const jerome = ORGANIZERS.find((p) => p.name === "Jerome")!;
  const anda = ORGANIZERS.find((p) => p.name === "Anda")!;
  const headingEntry = useStagger(0, 1);
  const andaEntry = useStagger(3, 8);
  const jeromeEntry = useStagger(6, 8);

  const people = [
    {
      person: anda,
      entry: andaEntry,
      color: GD_PINK,
      desc: "AWS Community Builder and initiator of this GameDay. Anda had the original vision for a pan-European AWS community event and brought together organizers from across the continent to make it happen.",
    },
    {
      person: jerome,
      entry: jeromeEntry,
      color: GD_VIOLET,
      desc: "AWS User Group Belgium leader and co-founder of this initiative. Jerome co-architected the event structure, competition framework, and connected the network of 57 User Groups across 20+ countries.",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: headingEntry,
          transform: `translateY(${interpolate(headingEntry, [0, 1], [16, 0])}px)`,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: GD_ACCENT,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 6,
          }}
        >
          🏆 The People Behind This Event
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h4,
            fontWeight: 900,
            color: "white",
          }}
        >
          Meet Anda & Jerome
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.caption,
            color: "rgba(255,255,255,0.45)",
            marginTop: 6,
          }}
        >
          Organized entirely as volunteers — not employed by AWS
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 28,
          width: "100%",
          maxWidth: 1060,
        }}
      >
        {people.map(({ person, entry, color, desc }) => (
          <div
            key={person.name}
            style={{
              flex: 1,
              opacity: entry,
              transform: `translateY(${interpolate(entry, [0, 1], [24, 0])}px)`,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}33`,
              borderRadius: 20,
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${color}55`,
                boxShadow: `0 0 36px ${color}28`,
                marginBottom: 16,
              }}
            >
              <Img
                src={staticFile(person.face)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.h4,
                fontWeight: 900,
                color: "white",
              }}
            >
              {person.flag} {person.name}
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.caption,
                color,
                marginTop: 4,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {person.role}
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.bodySmall,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.65,
              }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          opacity: jeromeEntry,
          transform: `translateY(${interpolate(jeromeEntry, [0, 1], [14, 0])}px)`,
          marginTop: 18,
          fontSize: TYPOGRAPHY.caption,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
        }}
      >
        Linda will introduce Anda & Jerome live on stream — they will explain the
        GameDay concept in their own words.
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — What is the AWS Community?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAWSCommunity: React.FC = () => {
  const points = [
    {
      icon: "🤝",
      title: "Volunteers, not employees",
      body: "The AWS Community is made up of developers, architects, and cloud enthusiasts who are not employed by Amazon. They organize events, share knowledge, and build connections — purely out of passion.",
    },
    {
      icon: "🏙️",
      title: "Local User Groups",
      body: "AWS User Groups meet regularly in cities around the world. They share knowledge about AWS services, host technical talks, run workshops, and create local networks of cloud professionals.",
    },
    {
      icon: "🌍",
      title: "57 groups here today",
      body: "Every single group competing today is run by a volunteer leader. The person who organized today's event in your city did so entirely in their free time — just like Anda, Jerome, and Linda.",
    },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="☁️" label="About the AWS Community" />
      <div
        style={{
          display: "flex",
          gap: 20,
          width: "100%",
          maxWidth: 1060,
          marginBottom: 20,
        }}
      >
        {points.map((p, i) => {
          const o = useStagger(i, 8);
          return (
            <div
              key={p.title}
              style={{
                flex: 1,
                opacity: o,
                transform: `translateY(${interpolate(o, [0, 1], [20, 0])}px)`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${GD_VIOLET}28`,
                borderRadius: 18,
                padding: "24px 22px",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 14 }}>{p.icon}</div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.h6,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 10,
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.bodySmall,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                }}
              >
                {p.body}
              </div>
            </div>
          );
        })}
      </div>
      {/* Quote bar */}
      {(() => {
        const o = useStagger(4, 8);
        return (
          <div
            style={{
              opacity: o,
              transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`,
              width: "100%",
              maxWidth: 1060,
              background: `linear-gradient(90deg, ${GD_PURPLE}28, ${GD_VIOLET}18)`,
              border: `1px solid ${GD_VIOLET}33`,
              borderLeft: `4px solid ${GD_GOLD}`,
              borderRadius: 14,
              padding: "16px 24px",
              fontSize: TYPOGRAPHY.bodySmall,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
            }}
          >
            💛{" "}
            <strong style={{ color: GD_GOLD }}>
              A big thank you to every User Group leader
            </strong>{" "}
            who organized a local venue, invited people, and made today possible
            in their city. This event exists because of you.
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Schedule V2 (with CET times)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideScheduleV2: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);

  const phases = [
    {
      time: "17:30 CET",
      label: "Pre-Show Loop",
      desc: "This muted loop plays while teams arrive. Test your audio!",
      color: GD_ACCENT,
      audio: false,
      countdown: null,
    },
    {
      time: "18:00 CET",
      label: "Live Stream Begins",
      desc: "Welcome, Linda · Anda & Jerome · Special guest · Instructions",
      color: GD_PINK,
      audio: true,
      countdown: sc,
    },
    {
      time: "18:30 CET",
      label: "GameDay Starts!",
      desc: "2 hours of competitive AWS challenges — stream is muted",
      color: GD_GOLD,
      audio: false,
      countdown: gc,
      highlight: true,
    },
    {
      time: "20:30 CET",
      label: "Closing Ceremony",
      desc: "Winners revealed globally — audio returns!",
      color: GD_ORANGE,
      audio: true,
      countdown: null,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="🗓️" label="Today's Schedule (CET)" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 860,
        }}
      >
        {phases.map((ph, i) => {
          const o = useStagger(i, 8);
          return (
            <div
              key={ph.label}
              style={{
                opacity: o,
                transform: `translateX(${interpolate(o, [0, 1], [28, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 24px",
                borderRadius: 16,
                background: ph.highlight
                  ? `${GD_GOLD}0a`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${ph.color}${ph.highlight ? "33" : "22"}`,
                borderLeft: `4px solid ${ph.color}`,
              }}
            >
              <div style={{ flexShrink: 0, textAlign: "center", width: 96 }}>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.h5,
                    fontWeight: 800,
                    color: ph.color,
                    fontFamily: "monospace",
                    lineHeight: 1,
                  }}
                >
                  {ph.time}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: ph.audio ? "#4ade80" : "#f87171",
                    marginTop: 4,
                    fontWeight: 700,
                  }}
                >
                  {ph.audio ? "🔊 Audio" : "🔇 Muted"}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.h6,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {ph.label}
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.caption,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 3,
                  }}
                >
                  {ph.desc}
                </div>
              </div>
              {ph.countdown != null && (
                <div
                  style={{
                    flexShrink: 0,
                    fontFamily: "monospace",
                    fontSize: TYPOGRAPHY.h5,
                    fontWeight: 700,
                    color: ph.color,
                    textAlign: "right",
                    minWidth: 90,
                  }}
                >
                  {formatTime(ph.countdown)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {(() => {
        const o = useStagger(5, 8);
        return (
          <div
            style={{
              opacity: o,
              marginTop: 16,
              fontSize: TYPOGRAPHY.caption,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: 1,
            }}
          >
            All times CET · Stream broadcast simultaneously to all 57 User
            Groups across Europe
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — How GameDay Works (step-by-step)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideHowItWorks: React.FC = () => {
  const steps = [
    {
      n: "1",
      icon: "👥",
      title: "Form your team",
      body: "Gather your team at your local venue before the stream. Your organizer will tell you the team size.",
    },
    {
      n: "2",
      icon: "📋",
      title: "Watch the instructions",
      body: "At 18:00 the live stream explains the rules. Pay attention — the gamemasters will cover everything.",
    },
    {
      n: "3",
      icon: "🔑",
      title: "Get your team code",
      body: "At 18:30 your local UG leader distributes AWS access codes. This is your entry into the challenge.",
    },
    {
      n: "4",
      icon: "⚡",
      title: "Compete for 2 hours",
      body: "Complete AWS challenges, earn points, and try to be the best team across 57 cities in Europe.",
    },
    {
      n: "5",
      icon: "🏆",
      title: "Watch the closing at 20:30",
      body: "The stream comes back live. Global winners are revealed. Stay in the stream and celebrate!",
    },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="🎮" label="How GameDay Works" />
      <div
        style={{
          display: "flex",
          gap: 14,
          width: "100%",
          maxWidth: 1060,
        }}
      >
        {steps.map((step, i) => {
          const o = useStagger(i, 7);
          return (
            <div
              key={step.n}
              style={{
                flex: 1,
                opacity: o,
                transform: `translateY(${interpolate(o, [0, 1], [22, 0])}px)`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${GD_VIOLET}28`,
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GD_PURPLE}, ${GD_VIOLET})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 10,
                  flexShrink: 0,
                }}
              >
                {step.n}
              </div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{step.icon}</div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.bodySmall,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.caption,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.55,
                }}
              >
                {step.body}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — All Organizers V2
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAllOrganizersV2: React.FC = () => (
  <AbsoluteFill
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <SectionHeading icon="👥" label="The Team Behind This Event" />

    {/* Community organizers */}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        maxWidth: 1060,
        marginBottom: 20,
      }}
    >
      {ORGANIZERS.map((p, i) => {
        const o = useStagger(i, 5);
        return (
          <div
            key={p.name}
            style={{
              opacity: o,
              transform: `translateY(${interpolate(o, [0, 1], [16, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${GD_PURPLE}33`,
              borderRadius: 14,
              padding: "12px 16px",
              minWidth: 230,
            }}
          >
            <Img
              src={staticFile(p.face)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.bodySmall,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {p.flag} {p.name}
              </div>
              <div
                style={{ fontSize: 13, color: GD_ACCENT, marginTop: 2 }}
              >
                {p.role}
              </div>
              <div
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
              >
                {p.country}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* AWS supporters */}
    {(() => {
      const o = useStagger(ORGANIZERS.length, 5);
      return (
        <div
          style={{
            opacity: o,
            fontSize: 13,
            fontWeight: 700,
            color: GD_ORANGE,
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 12,
          }}
        >
          AWS Support & Gamemasters
        </div>
      );
    })()}
    <div
      style={{
        display: "flex",
        gap: 14,
        justifyContent: "center",
        flexWrap: "wrap",
        maxWidth: 1060,
      }}
    >
      {AWS_SUPPORTERS.map((p, i) => {
        const o = useStagger(ORGANIZERS.length + 1 + i, 5);
        return (
          <div
            key={p.name}
            style={{
              opacity: o,
              transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${GD_ORANGE}28`,
              borderRadius: 14,
              padding: "12px 16px",
              minWidth: 230,
            }}
          >
            <Img
              src={staticFile(p.face)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.bodySmall,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {p.flag} {p.name}
              </div>
              <div
                style={{ fontSize: 13, color: GD_ORANGE, marginTop: 2 }}
              >
                {p.role}
              </div>
              <div
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
              >
                {p.country}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — Get Ready
// ═══════════════════════════════════════════════════════════════════════════════
const SlideGetReady: React.FC = () => {
  const items = [
    { icon: "👥", text: "Form your team locally before the stream starts" },
    { icon: "🪑", text: "Be seated with audio ready 5 minutes before 18:00 CET" },
    { icon: "📺", text: "Watch the live stream carefully — the rules are explained live" },
    { icon: "🔑", text: "Your UG leader will hand out team codes at 18:30" },
    { icon: "⏱️", text: "Gameplay runs for 2 hours — stream is muted during this time" },
    { icon: "🏁", text: "Stay in the stream! Audio returns at 20:30 for the winners" },
    { icon: "🎉", text: "After the ceremony your local UG continues with their own schedule" },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading icon="✅" label="Get Ready — Your Checklist" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 780,
          width: "100%",
        }}
      >
        {items.map((item, i) => {
          const o = useStagger(i, 6);
          return (
            <div
              key={i}
              style={{
                opacity: o,
                transform: `translateX(${interpolate(o, [0, 1], [22, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 18px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 12,
                fontSize: TYPOGRAPHY.body,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ lineHeight: 1.4 }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Audio Check (urgent, full-screen)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAudioCheck: React.FC = () => {
  const pulse = usePulse(48);
  const o = useEntry(0);
  const items = [
    {
      icon: "✅",
      text: "Make sure your venue audio is connected to this stream",
      c: "#4ade80",
    },
    {
      icon: "🎧",
      text: "The live stream at 18:00 CET requires audio — test NOW",
      c: "#4ade80",
    },
    {
      icon: "📱",
      text: "If audio fails, use the backup video link your organizer provided",
      c: GD_GOLD,
    },
    {
      icon: "🔇",
      text: "Important: stream is muted again during gameplay (18:30–20:30)",
      c: GD_ACCENT,
    },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: o,
          transform: `scale(${interpolate(o, [0, 1], [0.9, 1])})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 88,
            lineHeight: 1,
            transform: `scale(${pulse})`,
          }}
        >
          🔊
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h2,
            fontWeight: 900,
            color: GD_GOLD,
            letterSpacing: -1,
            marginTop: 12,
            transform: `scale(${pulse})`,
            textShadow: `0 0 40px ${GD_ORANGE}66`,
          }}
        >
          AUDIO CHECK
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h5,
            color: "white",
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          Can you hear this stream?
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 680,
        }}
      >
        {items.map((item, i) => {
          const io = useStagger(2 + i, 7);
          return (
            <div
              key={i}
              style={{
                opacity: io,
                transform: `translateX(${interpolate(io, [0, 1], [16, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: TYPOGRAPHY.bodySmall,
                  color: item.c,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — UG Spotlight V2 (cinematic full-screen)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideUGSpotlightV2: React.FC<{ index: number }> = ({ index }) => {
  const g = SHUFFLED[index % SHUFFLED.length];
  const flagEntry = useEntry(0, springConfig.emphasis);
  const nameEntry = useStagger(4, 8);
  const detailsEntry = useStagger(6, 8);
  const pulse = usePulse(90);
  const totalGroups = USER_GROUPS.length;
  const displayNum = (index % totalGroups) + 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* "Competing Today" badge */}
      <div
        style={{
          opacity: flagEntry,
          fontSize: 12,
          fontWeight: 700,
          color: GD_ACCENT,
          textTransform: "uppercase",
          letterSpacing: 5,
          marginBottom: 16,
        }}
      >
        ★ Competing Today ★
      </div>

      {/* Flag — full size */}
      <div
        style={{
          opacity: flagEntry,
          transform: `scale(${interpolate(flagEntry, [0, 1], [0.7, 1]) * pulse})`,
          fontSize: 130,
          lineHeight: 1,
          marginBottom: 20,
          filter: `drop-shadow(0 8px 32px rgba(0,0,0,0.5))`,
        }}
      >
        {g.flag}
      </div>

      {/* Group name */}
      <div
        style={{
          opacity: nameEntry,
          transform: `translateY(${interpolate(nameEntry, [0, 1], [24, 0])}px)`,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: TYPOGRAPHY.h2,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.05,
            maxWidth: 900,
            background: `linear-gradient(135deg, #ffffff, ${GD_ACCENT})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {g.name}
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.h5,
            color: GD_ACCENT,
            marginTop: 8,
            fontWeight: 500,
          }}
        >
          {g.city}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          opacity: detailsEntry,
          transform: `translateY(${interpolate(detailsEntry, [0, 1], [16, 0])}px)`,
          display: "flex",
          gap: 16,
          marginTop: 12,
        }}
      >
        {[
          {
            label: "Group",
            value: `${displayNum} of ${totalGroups}`,
            c: GD_VIOLET,
          },
          { label: "Location", value: g.city, c: GD_PINK },
          { label: "Event", value: "GameDay Europe 2026", c: GD_GOLD },
          { label: "Status", value: "COMPETING", c: "#4ade80" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${stat.c}33`,
              borderRadius: 12,
              padding: "10px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: GD_ACCENT,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: TYPOGRAPHY.bodySmall,
                fontWeight: 700,
                color: stat.c,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Stats V2
// ═══════════════════════════════════════════════════════════════════════════════
const SlideStatsV2: React.FC = () => {
  const stats = [
    { v: "57", l: "User Groups", c: GD_GOLD, sub: "Cities across Europe" },
    { v: "20+", l: "Countries", c: GD_PINK, sub: "From Iceland to Turkey" },
    { v: "4+", l: "Timezones", c: GD_VIOLET, sub: "UTC-1 through UTC+3" },
    { v: "1st", l: "Edition", c: GD_ORANGE, sub: "History being made today" },
  ];
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SectionHeading label="Community GameDay Europe — By The Numbers" />
      <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
        {stats.map((s, i) => {
          const o = useStagger(i, 8);
          return (
            <div
              key={s.l}
              style={{
                opacity: o,
                transform: `scale(${interpolate(o, [0, 1], [0.82, 1])})`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${s.c}28`,
                borderRadius: 20,
                padding: "32px 40px",
                textAlign: "center",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: TYPOGRAPHY.stat,
                  fontWeight: 900,
                  color: s.c,
                  lineHeight: 1,
                  textShadow: `0 0 30px ${s.c}44`,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.h6,
                  fontWeight: 700,
                  color: "white",
                  marginTop: 8,
                }}
              >
                {s.l}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.caption,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 4,
                }}
              >
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>
      {/* Map */}
      {(() => {
        const o = useStagger(5, 8);
        return (
          <div
            style={{
              opacity: o,
              transform: `translateY(${interpolate(o, [0, 1], [20, 0])}px)`,
              maxWidth: 680,
            }}
          >
            <Img
              src={EUROPE_MAP}
              style={{
                width: "100%",
                opacity: 0.55,
                borderRadius: 12,
                filter: `hue-rotate(230deg) saturate(1.4)`,
              }}
            />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD THE SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════
type Section = {
  key: string;
  name: string;
  dur: number;
  el: React.ReactNode;
};

function buildSections(): Section[] {
  const out: Section[] = [];
  let ugIdx = 0;
  let cycleId = 0;

  const nextUGs = (count: number) => {
    for (let i = 0; i < count; i++) {
      const idx = ugIdx % SHUFFLED.length;
      out.push({
        key: `ug-${ugIdx}`,
        name: `UG Spotlight: ${SHUFFLED[idx].name}`,
        dur: U,
        el: (
          <Wrap>
            <SlideUGSpotlightV2 index={ugIdx} />
          </Wrap>
        ),
      });
      ugIdx++;
    }
  };

  const push = (key: string, name: string, el: React.ReactNode) =>
    out.push({ key: `${key}-${cycleId}`, name, dur: S, el: <Wrap>{el}</Wrap> });

  // ── Cycle 1 ──────────────────────────────────────────────────────────────
  cycleId = 1;
  push("hero", "Hero + Countdown", <SlideHeroV2 />);
  nextUGs(4);
  push("whats-happening", "What's Happening?", <SlideWhatsHappening />);
  nextUGs(4);
  push("meet-linda", "Meet Linda Mohamed", <SlideMeetLinda />);
  nextUGs(4);
  push("meet-anda-jerome", "Meet Anda & Jerome", <SlideMeetAndaJerome />);
  nextUGs(4);
  push("aws-community", "What is the AWS Community?", <SlideAWSCommunity />);
  nextUGs(4);
  push("schedule", "Schedule (CET)", <SlideScheduleV2 />);
  nextUGs(4);
  push("how-it-works", "How GameDay Works", <SlideHowItWorks />);
  nextUGs(4);
  push("all-organizers", "The Team", <SlideAllOrganizersV2 />);
  nextUGs(4);
  push("stats", "Stats", <SlideStatsV2 />);
  nextUGs(4);
  push("get-ready", "Get Ready", <SlideGetReady />);
  nextUGs(3);
  push("audio-check", "🔊 Audio Check!", <SlideAudioCheck />);

  // ── Cycle 2 ──────────────────────────────────────────────────────────────
  cycleId = 2;
  push("hero", "Hero + Countdown", <SlideHeroV2 />);
  nextUGs(4);
  push("whats-happening", "What's Happening?", <SlideWhatsHappening />);
  nextUGs(4);
  push("meet-linda", "Meet Linda Mohamed", <SlideMeetLinda />);
  nextUGs(4);
  push("meet-anda-jerome", "Meet Anda & Jerome", <SlideMeetAndaJerome />);
  nextUGs(4);
  push("aws-community", "What is the AWS Community?", <SlideAWSCommunity />);
  nextUGs(4);
  push("schedule", "Schedule (CET)", <SlideScheduleV2 />);
  nextUGs(4);
  push("how-it-works", "How GameDay Works", <SlideHowItWorks />);
  nextUGs(4);
  push("all-organizers", "The Team", <SlideAllOrganizersV2 />);
  nextUGs(4);
  push("stats", "Stats", <SlideStatsV2 />);
  nextUGs(3);
  push("get-ready", "Get Ready", <SlideGetReady />);
  push("audio-check", "🔊 Audio Check!", <SlideAudioCheck />);
  push("hero-end", "Hero (End)", <SlideHeroV2 />);

  return out;
}

// ─── Alternating transitions ──────────────────────────────────────────────────
const TRANSITIONS = [
  () => fade(),
  () => slide({ direction: "from-left" }),
  () => fade(),
  () => slide({ direction: "from-bottom" }),
  () => fade(),
  () => slide({ direction: "from-right" }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export const GameDayPreShowInfoV2: React.FC = () => {
  const frame = useCurrentFrame();
  const sections = buildSections();

  return (
    <GlobalFrameCtx.Provider value={frame}>
      <TransitionSeries>
        {sections.map((s, i) => {
          const items: React.ReactNode[] = [];
          if (i > 0) {
            items.push(
              <TransitionSeries.Transition
                key={`t-${s.key}`}
                presentation={TRANSITIONS[i % TRANSITIONS.length]()}
                timing={linearTiming({ durationInFrames: T })}
              />
            );
          }
          items.push(
            <TransitionSeries.Sequence
              key={s.key}
              durationInFrames={s.dur}
              name={s.name}
            >
              {s.el}
            </TransitionSeries.Sequence>
          );
          return items;
        })}
      </TransitionSeries>
    </GlobalFrameCtx.Provider>
  );
};
