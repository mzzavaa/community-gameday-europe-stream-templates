import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundLayer,
  HexGridOverlay,
  AudioBadge,
  formatTime,
  getPhaseInfo,
  staggeredEntry,
  springConfig,
  GD_DARK,
  GD_VIOLET,
  GD_ACCENT,
  GD_GOLD,
  type ScheduleSegment,
  type CardState,
} from "./shared/GameDayDesignSystem";

// ── Closing Segments (detailed chapters) ──
// Total: 54000 frames = 30 min at 30fps (20:30–21:00 CET)
//
// Global winners announced via slides (not on camera).
// Local UG leaders handle their own award ceremonies.
// Stream ends with music at 21:00.
export const CLOSING_SEGMENTS: ScheduleSegment[] = [
  { label: "Results Reveal", startFrame: 0, endFrame: 5399 },           // 3 min
  { label: "Global Winner Announcement", startFrame: 5400, endFrame: 12599 },  // 4 min
  { label: "Local Winner Ceremonies", startFrame: 12600, endFrame: 23399 },    // 6 min
  { label: "Community Highlights", startFrame: 23400, endFrame: 30599 },       // 4 min
  { label: "Organizer Shoutouts", startFrame: 30600, endFrame: 37799 },        // 4 min
  { label: "Sponsor Thanks", startFrame: 37800, endFrame: 41399 },             // 2 min
  { label: "Thank You & Wrap-Up", startFrame: 41400, endFrame: 53999 },        // 7 min (ends with music)
];

// ── Podium Data ──

interface TeamData {
  name: string;
  flag: string;
  city: string;
  score: number;
  logoUrl: string | null;
}

const LOGO_MAP: Record<string, string> = {
  "AWS User Group Vienna":
    "https://awscommunitydach.notion.site/image/attachment%3A7f5dcfa0-c808-411f-85e7-b8b2283e2c5a%3AAWS_Vienna_-_Vienna_Austria.jpg?table=block&id=3090df17-987f-80a9-a26b-de59a394b30a&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Berlin AWS User Group":
    "https://awscommunitydach.notion.site/image/attachment%3A70c06203-3c89-4f2b-9695-d85640023ca4%3ABerlin_AWS_User_Group_-_Berlin_Germany.jpg?table=block&id=3090df17-987f-8057-9354-fb9723d73f03&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group France- Paris":
    "https://awscommunitydach.notion.site/image/attachment%3A440eff7c-bf83-4ea8-891f-92ff06f4d21c%3AParis_AWS_User_Group_-_Paris_France.jpg?table=block&id=3090df17-987f-80ed-a3a8-dbcef6dccad2&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Finland":
    "https://awscommunitydach.notion.site/image/attachment%3Af0afbb70-a7cd-447b-b7e0-e15236dd1f9d%3AAWS_User_Group_Finland_-_Helsinki_Finland.png?table=block&id=3090df17-987f-8060-94cd-d7e2d581c4b9&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Roma":
    "https://awscommunitydach.notion.site/image/attachment%3A3dc7bd7a-82eb-4c40-9fd8-15fd273eb535%3AAWS_User_Group_Roma_-_Rome_Italy.jpg?table=block&id=3090df17-987f-8052-bba4-f2aa19fd9a50&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Warsaw":
    "https://awscommunitydach.notion.site/image/attachment%3A58635b85-fd99-4dd8-a0da-1913d3a98ef3%3AAWS_User_Group_Warsaw_-_Warsaw_Poland.jpg?table=block&id=3090df17-987f-801c-bfe4-ee51e920bdfa&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
};

const PODIUM_TEAMS: TeamData[] = [
  { name: "AWS User Group Vienna", flag: "🇦🇹", city: "Vienna, Austria", score: 4850, logoUrl: LOGO_MAP["AWS User Group Vienna"] },
  { name: "Berlin AWS User Group", flag: "🇩🇪", city: "Berlin, Germany", score: 4720, logoUrl: LOGO_MAP["Berlin AWS User Group"] },
  { name: "AWS User Group France- Paris", flag: "🇫🇷", city: "Paris, France", score: 4580, logoUrl: LOGO_MAP["AWS User Group France- Paris"] },
  { name: "AWS User Group Finland", flag: "🇫🇮", city: "Helsinki, Finland", score: 4410, logoUrl: LOGO_MAP["AWS User Group Finland"] },
  { name: "AWS User Group Roma", flag: "🇮🇹", city: "Roma, Italy", score: 4250, logoUrl: LOGO_MAP["AWS User Group Roma"] },
  { name: "AWS User Group Warsaw", flag: "🇵🇱", city: "Warsaw, Poland", score: 4090, logoUrl: LOGO_MAP["AWS User Group Warsaw"] },
];

// ── TeamCard Sub-Component ──
interface TeamCardProps {
  team: TeamData;
  rank: number;
  frame: number;
  fps: number;
  revealFrame: number;
  size: "large" | "small";
}

const getBorderColor = (rank: number): string => {
  if (rank === 1) return GD_GOLD;
  if (rank === 2) return "rgba(192,192,192,0.6)";
  if (rank === 3) return "rgba(205,127,50,0.5)";
  return "rgba(255,255,255,0.1)";
};

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  rank,
  frame,
  fps,
  revealFrame,
  size,
}) => {
  const progress = spring({
    frame: Math.max(0, frame - revealFrame),
    fps,
    config: springConfig.entry,
    durationInFrames: 90,
  });

  const opacity = frame < revealFrame ? 0 : progress;
  const translateY = frame < revealFrame ? 30 : interpolate(progress, [0, 1], [30, 0]);

  const isLarge = size === "large";
  const width = isLarge ? (rank === 1 ? 180 : 160) : 140;
  const height = isLarge ? (rank === 1 ? 220 : 190) : 120;
  const logoSize = isLarge ? 48 : 32;

  return (
    <div
      style={{
        width,
        height,
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        border: `2px solid ${getBorderColor(rank)}`,
        borderRadius: 16,
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isLarge ? 6 : 3,
        padding: isLarge ? 12 : 8,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: isLarge ? 28 : 20,
          fontWeight: 900,
          color: rank === 1 ? GD_GOLD : "#fff",
        }}
      >
        {rank}
      </div>
      {team.logoUrl ? (
        <Img
          src={team.logoUrl}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div style={{ fontSize: isLarge ? 32 : 24 }}>{team.flag}</div>
      )}
      <div
        style={{
          fontSize: isLarge ? 9 : 8,
          fontWeight: 700,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
        }}
      >
        TEAM
      </div>
      <div
        style={{
          fontSize: isLarge ? 11 : 9,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: width - 16,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {team.name}
      </div>
      <div
        style={{
          fontSize: isLarge ? 16 : 12,
          fontWeight: 900,
          color: GD_GOLD,
        }}
      >
        {team.score}
      </div>
    </div>
  );
};

// ── ClosingPodium Container Component ──
const ClosingPodium: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Hidden after Winner Announcement segment (Req 7.2)
  if (frame >= 12600) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "58%",
        maxWidth: 742,
        height: "100%",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* Podium Header */}
      <div
        style={{
          color: GD_GOLD,
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 6,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 20,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        🏆 PODIUM 🏆
      </div>

      {/* Top 3 Podium Row: 2nd (left), 1st (center), 3rd (right) */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <TeamCard
          team={PODIUM_TEAMS[1]}
          rank={2}
          frame={frame}
          fps={fps}
          revealFrame={1200}
          size="large"
        />
        <TeamCard
          team={PODIUM_TEAMS[0]}
          rank={1}
          frame={frame}
          fps={fps}
          revealFrame={1500}
          size="large"
        />
        <TeamCard
          team={PODIUM_TEAMS[2]}
          rank={3}
          frame={frame}
          fps={fps}
          revealFrame={900}
          size="large"
        />
      </div>

      {/* Ranks 4–6 Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <TeamCard
          team={PODIUM_TEAMS[3]}
          rank={4}
          frame={frame}
          fps={fps}
          revealFrame={600}
          size="small"
        />
        <TeamCard
          team={PODIUM_TEAMS[4]}
          rank={5}
          frame={frame}
          fps={fps}
          revealFrame={300}
          size="small"
        />
        <TeamCard
          team={PODIUM_TEAMS[5]}
          rank={6}
          frame={frame}
          fps={fps}
          revealFrame={0}
          size="small"
        />
      </div>
    </div>
  );
};

// ── ScheduleCard Sub-Component ──
const ScheduleCard: React.FC<{
  segment: ScheduleSegment;
  state: CardState;
  frame: number;
  fps: number;
  index: number;
}> = ({ segment, state, frame, fps, index }) => {
  const enterFrame = staggeredEntry(0, index, 20);
  const enterSpring = spring({
    frame: frame - enterFrame,
    fps,
    config: springConfig.entry,
  });

  const borderColor =
    state === "active" ? GD_GOLD : state === "completed" ? "#334155" : "#1e293b";
  const bgOpacity = state === "active" ? 0.12 : 0.04;
  const textColor =
    state === "active" ? "white" : state === "completed" ? "#64748b" : "#94a3b8";

  return (
    <div
      style={{
        opacity: enterSpring,
        transform: `translateX(${(1 - enterSpring) * 40}px)`,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          background: `rgba(255,255,255,${bgOpacity})`,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow:
            state === "active"
              ? `0 0 20px ${GD_GOLD}30, inset 0 0 12px ${GD_VIOLET}10`
              : "none",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: textColor,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {segment.label}
        </div>
        {state === "active" && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: GD_GOLD,
              textTransform: "uppercase",
              letterSpacing: 2,
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
            fontSize: 14,
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
            fontSize: 22,
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
            background: `linear-gradient(90deg, ${GD_GOLD}, ${GD_VIOLET})`,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};


// ── Closing Ceremony Composition ──
export const GameDayClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── "Thank You" segment starts at frame 41400 ──
  const isThankYou = frame >= 41400;

  // ── Segment transition spring (GD_GOLD / GD_VIOLET flash on segment change) ──
  const segmentTransitionFlash = (() => {
    const segmentStarts = CLOSING_SEGMENTS.map((s) => s.startFrame);
    for (const start of segmentStarts) {
      if (frame >= start && frame < start + 60) {
        return interpolate(frame - start, [0, 15, 60], [0, 0.5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      }
    }
    return 0;
  })();

  // ── Thank You message entry ──
  const thankYouEntry = isThankYou
    ? spring({
        frame: frame - 41400,
        fps,
        config: springConfig.entry,
      })
    : 0;

  // ── Fade-to-dark in final 90 frames (53910–53999) ──
  const fadeToDark = interpolate(frame, [53910, 53999], [0, 1], {
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
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />

      {/* Layer 1.5: Closing Podium (z10 — above background, below overlays) */}
      <ClosingPodium frame={frame} fps={fps} />

      {/* Layer 2: Audio Badge */}
      <AudioBadge muted={false} />

      {/* Layer 3: Segment Transition Flash */}
      {segmentTransitionFlash > 0 && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, ${GD_GOLD}${Math.round(segmentTransitionFlash * 160).toString(16).padStart(2, "0")}, ${GD_VIOLET}${Math.round(segmentTransitionFlash * 160).toString(16).padStart(2, "0")})`,
            zIndex: 200,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Layer 6: Phase Marker */}
      <PhaseMarker frame={frame} segments={CLOSING_SEGMENTS} />

      {/* Layer 7: "Thank You" Message (frame 21600+) */}
      {isThankYou && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "65%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            opacity: thankYouEntry,
            transform: `scale(${0.9 + thankYouEntry * 0.1})`,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: GD_GOLD,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            AWS Community GameDay Europe
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "white",
              textAlign: "center",
              lineHeight: 1.1,
              textShadow: `0 0 60px ${GD_GOLD}40, 0 0 120px ${GD_VIOLET}20`,
            }}
          >
            Thank You
          </div>
          <div
            style={{
              fontSize: 20,
              color: GD_ACCENT,
              marginTop: 20,
              textAlign: "center",
              maxWidth: 500,
              lineHeight: 1.5,
            }}
          >
            See you at the next GameDay!
          </div>
        </div>
      )}

      {/* Layer 8: Fade-to-dark overlay (frames 26910–26999) */}
      <AbsoluteFill
        style={{
          background: "black",
          opacity: fadeToDark,
          zIndex: 300,
          pointerEvents: "none",
        }}
      />

      {/* ── Timeline Sequences (Remotion Studio chapter markers) ── */}
      {CLOSING_SEGMENTS.map((seg) => (
        <Sequence
          key={seg.label}
          from={seg.startFrame}
          durationInFrames={seg.endFrame - seg.startFrame + 1}
          name={seg.label}
          layout="none"
        >
          <></>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
