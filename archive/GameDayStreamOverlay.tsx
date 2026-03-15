import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  Sequence,
} from "remotion";
import React from "react";

// ── Background & Colors (matching GameDay V4 design) ──
const BG_IMAGE = staticFile("AWSCommunityGameDayEurope/background_landscape_colour.png");
const GD_DARK = "#0c0820";
const GD_PURPLE = "#6c3fa0";
const GD_VIOLET = "#8b5cf6";
const GD_PINK = "#d946ef";
const GD_ACCENT = "#c084fc";
const GD_ORANGE = "#f97316";
const GD_GOLD = "#fbbf24";
const GD_MAP = staticFile("AWSCommunityGameDayEurope/europe-map.png");

// ── UG Logo URLs (from V4 LOGO_MAP) ──
const UG_BELGIUM_LOGO = "https://awscommunitydach.notion.site/image/attachment%3Aa2bebf97-0c45-43d1-bc06-f05186e7711b%3AAWS_User_Group_Belgium_-_Brussels_Belgium.jpg?table=block&id=3090df17-987f-8051-8049-de5a1b58677b&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2";
const UG_GENEVA_LOGO = "https://awscommunitydach.notion.site/image/attachment%3Ab00df73a-3fce-4ab6-9160-f26c286ddc57%3AAWS_Swiss_User_Group_Geneva_-_Geneva_Switzerland.jpg?table=block&id=3090df17-987f-805d-9d4b-d332f0de2d65&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2";

// ── Timing constants (30fps) ──
const FPS = 30;
const MIN = 60 * FPS; // 1800 frames per minute

// Phase durations in minutes → frames
export const PRESTREAM_DURATION = 30 * MIN;       // 17:30–18:00 (54000 frames)
const COMMUNITY_INTRO_DURATION = 6 * MIN;  // 18:00–18:06 (10800 frames)
const SUPPORT_DURATION = 1 * MIN;          // 18:06–18:07 (1800 frames)
const SPECIAL_GUEST_DURATION = 5 * MIN;    // 18:07–18:12 (9000 frames)
const GAMEMASTERS_DURATION = 1 * MIN;      // 18:12–18:13 (1800 frames)
const INSTRUCTIONS_DURATION = 12 * MIN;    // 18:13–18:25 (21600 frames)
const DISTRIBUTE_CODES_DURATION = 5 * MIN; // 18:25–18:30 (9000 frames)

export const STREAM_TOTAL_DURATION =
  PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION +
  GAMEMASTERS_DURATION + SPECIAL_GUEST_DURATION + INSTRUCTIONS_DURATION +
  DISTRIBUTE_CODES_DURATION; // 108000 frames = 60 min

// ── Data Models ──
export interface ScheduleSegment {
  label: string;
  startFrame: number;
  endFrame: number;
  speakers?: string;
}

export interface Reminder {
  text: string;
  startFrame: number;
  endFrame: number;
}

export type CardState = "active" | "upcoming" | "completed";

export const PRE_STREAM_SEGMENTS: ScheduleSegment[] = [
  { label: "Countdown to Teams Being Formed", startFrame: 0, endFrame: 35999 },
  { label: "Countdown to Stream Start", startFrame: 36000, endFrame: 53999 },
];

export const MAIN_EVENT_SEGMENTS: ScheduleSegment[] = [
  { label: "Community Intro", startFrame: 54000, endFrame: 64799, speakers: "Jerome & Anda" },
  { label: "Support Process", startFrame: 64800, endFrame: 66599 },
  { label: "Special Guest Appearance", startFrame: 66600, endFrame: 75599 },
  { label: "AWS Gamemasters Intro", startFrame: 75600, endFrame: 77399, speakers: "Arnaud & Loïc" },
  { label: "GameDay Instructions", startFrame: 77400, endFrame: 98999, speakers: "Arnaud & Loïc" },
  { label: "Distribute Codes", startFrame: 99000, endFrame: 107999 },
];

export const REMINDERS: Reminder[] = [
  { text: "Audio Test - Check your audio setup now", startFrame: 43500, endFrame: 45000 },
  { text: "Turn on audio - Stream starting", startFrame: 52200, endFrame: 53999 },
];

// ── Helpers ──
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function getCardState(frame: number, segment: ScheduleSegment): CardState {
  if (frame > segment.endFrame) return "completed";
  if (frame >= segment.startFrame && frame <= segment.endFrame) return "active";
  return "upcoming";
}

export function getActiveSegment(frame: number, segments: ScheduleSegment[]): ScheduleSegment | undefined {
  return segments.find(s => frame >= s.startFrame && frame <= s.endFrame);
}

export function getVisibleReminders(frame: number, reminders: Reminder[]): Reminder[] {
  return reminders.filter(r => frame >= r.startFrame && frame <= r.endFrame);
}

export function getPhaseInfo(frame: number): { name: string; progress: number } {
  const ALL_SEGMENTS = [...PRE_STREAM_SEGMENTS, ...MAIN_EVENT_SEGMENTS];
  const seg = ALL_SEGMENTS.find(s => frame >= s.startFrame && frame <= s.endFrame);
  if (!seg) {
    const last = ALL_SEGMENTS[ALL_SEGMENTS.length - 1];
    return { name: last.label, progress: 1 };
  }
  const progress = (frame - seg.startFrame) / (seg.endFrame - seg.startFrame + 1);
  return { name: seg.label, progress: Math.min(1, Math.max(0, progress)) };
}

// ── Background Layer (V4 style: full image + semi-transparent overlay) ──
const BackgroundLayer: React.FC<{ darken?: number }> = ({ darken = 0.65 }) => (
  <>
    <Img src={BG_IMAGE} style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      objectFit: "cover",
    }} />
    <div style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      background: `rgba(12,8,32,${darken})`,
    }} />
  </>
);

// ── Hex Grid Overlay ──
const HexGridOverlay: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.04 }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexGrid" width="60" height="52" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke={GD_PURPLE} strokeWidth={0.5} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexGrid)" />
    </svg>
  </AbsoluteFill>
);


// ── Glassmorphism Card (bigger padding, bolder) ──
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div style={{
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
    ...style,
  }}>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════
// INTRO SCENE — First 60 seconds (frames 0–1799)
// Rich visual intro with V4 assets, supporting Linda's moderation
// ══════════════════════════════════════════════════════════════

const INTRO_STATS = [
  { label: "User Groups", value: 53, suffix: "+" },
  { label: "Countries", value: 20, suffix: "+" },
  { label: "Timezones", value: 4, suffix: "+" },
];

const CountUp: React.FC<{ target: number; frame: number; startFrame: number; suffix?: string }> = ({ target, frame, startFrame, suffix }) => {
  const progress = interpolate(frame - startFrame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <>{Math.round(progress * target)}{suffix || ""}</>;
};

const IntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Phase 1: Logo + Title (frames 0–90, ~3s)
  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(frame, [0, 30], [0.7, 1], { extrapolateRight: "clamp" });
  const titleSpring = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 100 } });

  // Phase 2: Stats fly in big & centered (frames 90–180), then shrink to upper-left (frames 180–210)
  const statsIn = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: "clamp" });
  // Animate from center to upper-left corner
  const statsMove = interpolate(frame, [180, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsFontSize = interpolate(statsMove, [0, 1], [64, 28]);
  const statsLabelSize = interpolate(statsMove, [0, 1], [16, 10]);
  const statsGap = interpolate(statsMove, [0, 1], [100, 24]);
  const statsTop = interpolate(statsMove, [0, 1], [400, 18]);
  const statsLeft = interpolate(statsMove, [0, 1], [640, 30]); // 640 = center of 1280
  const statsTranslateX = interpolate(statsMove, [0, 1], [-50, 0]); // centered → left-aligned

  // Phase 3: "Welcome" text (frames 210–450, ~8s)
  const welcomeOpacity = interpolate(frame, [210, 240], [0, 1], { extrapolateRight: "clamp" });
  const welcomeExit = interpolate(frame, [440, 470], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 4: Audio check reminder (frames 450–660, ~7s)
  const audioCheckIn = spring({ frame: frame - 450, fps, config: { damping: 14, stiffness: 100 } });
  const audioCheckExit = interpolate(frame, [640, 670], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 5: Community message (frames 660–1050, ~13s)
  const communityIn = spring({ frame: frame - 660, fps, config: { damping: 14, stiffness: 100 } });
  const communityExit = interpolate(frame, [1030, 1060], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 6: "Organized by the Community" (frames 1050–1400, ~12s)
  const organizedIn = spring({ frame: frame - 1050, fps, config: { damping: 14, stiffness: 100 } });
  const organizedExit = interpolate(frame, [1380, 1410], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // "Supported by AWS" box pops up 40 frames after organized card (in Phase 6)
  const awsBoxIn = spring({ frame: frame - 1090, fps, config: { damping: 14, stiffness: 100 } });

  // Phase 7: Introducing Anda & Jerome (frames 1400–1799, ~13s)
  const introIn = spring({ frame: frame - 1400, fps, config: { damping: 14, stiffness: 100 } });

  // Glow pulse behind logo
  const glowPulse = interpolate(frame % 120, [0, 60, 120], [0.3, 0.7, 0.3], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 900, height: 900,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 35).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%",
      }} />

      {/* GameDay Logo */}
      <div style={{
        position: "absolute", top: 40, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: logoOpacity,
        transform: `scale(${logoScale})`,
      }}>
        <Img
          src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")}
          style={{ height: 70 }}
        />
      </div>

      {/* Community Europe Logo + Title */}
      <div style={{
        position: "absolute", top: 130, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: titleSpring,
        transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
      }}>
        <Img
          src={staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png")}
          style={{ height: 130 }}
        />
        <div style={{
          fontSize: 48, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif", marginTop: 10,
          background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          GAMEDAY
        </div>
        {/* First Edition removed */}
      </div>

      {/* Europe Map — fades in with stats, stays visible throughout intro */}
      {frame >= 90 && frame < 1400 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 900, height: 500,
          transform: "translate(-50%, -45%)",
          opacity: interpolate(frame, [90, 130, 1350, 1400], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          borderRadius: 24,
          overflow: "hidden",
          filter: "saturate(0.5) brightness(0.7)",
        }}>
          <Img src={GD_MAP} style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            background: `radial-gradient(ellipse at center, transparent 20%, ${GD_DARK}dd 80%)`,
          }} />
        </div>
      )}

      {/* Stats: 53+ User Groups · 20+ Countries · 53 Cities */}
      <div style={{
        position: "absolute", top: statsTop, left: statsLeft,
        display: "flex", gap: statsGap, alignItems: "baseline",
        opacity: statsIn,
        transform: `translateX(${statsTranslateX}%)`,
      }}>
        {INTRO_STATS.map((stat, i) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: statsFontSize, fontWeight: 800, color: "#ffffff",
              fontFamily: "'Inter', sans-serif",
            }}>
              <CountUp target={stat.value} frame={frame} startFrame={95 + i * 8} suffix={stat.suffix} />
            </div>
            <div style={{
              fontSize: statsLabelSize, color: "#94a3b8", marginTop: statsMove > 0.5 ? 2 : 6,
              textTransform: "uppercase", letterSpacing: statsMove > 0.5 ? 1.5 : 3,
              fontFamily: "'Inter', sans-serif",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Phase 3: Your Host — Linda, AWS Hero */}
      {frame >= 210 && frame < 470 && (
        <div style={{
          position: "absolute", bottom: 60, left: 60, right: 60,
          opacity: welcomeOpacity * welcomeExit,
        }}>
          <GlassCard style={{
            padding: "24px 40px",
            borderLeft: `4px solid ${GD_VIOLET}`,
            display: "flex", alignItems: "center", gap: 28,
          }}>
            <Img
              src={staticFile("AWSCommunityGameDayEurope/faces/linda.jpg")}
              style={{
                width: 90, height: 90, borderRadius: "50%",
                boxShadow: `0 0 18px 4px ${GD_VIOLET}88`,
                objectFit: "cover", flexShrink: 0,
              }}
            />
            <div>
              <div style={{
                fontSize: 14, color: GD_ACCENT, letterSpacing: 3,
                textTransform: "uppercase", marginBottom: 6,
                fontFamily: "'Inter', sans-serif",
              }}>
                Your Host
              </div>
              <div style={{
                fontSize: 32, fontWeight: 800, color: "white",
                fontFamily: "'Inter', sans-serif",
              }}>
                Linda Mohamed
              </div>
              <div style={{
                fontSize: 16, color: "#94a3b8", marginTop: 4,
                fontFamily: "'Inter', sans-serif",
              }}>
                AWS Hero
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Phase 4: Welcome + What is GameDay — Linda (host) explains */}
      {frame >= 450 && frame < 670 && (
        <div style={{
          position: "absolute", bottom: 60, left: 60, right: 60,
          opacity: audioCheckIn * audioCheckExit,
          transform: `translateY(${(1 - audioCheckIn) * 30}px)`,
        }}>
          <GlassCard style={{
            padding: "24px 40px",
            borderLeft: `4px solid ${GD_ACCENT}`,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 600, color: "white",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>
              Welcome to the first AWS Community GameDay Europe -
              a collaborative challenge where teams compete to solve real AWS scenarios
            </div>
          </GlassCard>
        </div>
      )}

      {/* Phase 5: Scale of the event — Linda (host) shares the numbers */}
      {frame >= 660 && frame < 1060 && (
        <div style={{
          position: "absolute", bottom: 60, left: 60, right: 60,
          opacity: communityIn * communityExit,
          transform: `translateY(${(1 - communityIn) * 30}px)`,
        }}>
          <GlassCard style={{
            padding: "24px 40px",
            borderLeft: `4px solid ${GD_ACCENT}`,
          }}>
            <div style={{
              fontSize: 24, fontWeight: 500, color: "white",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>
              53 User Groups across 20 countries are playing simultaneously.
              The stream will be <span style={{ color: GD_GOLD, fontWeight: 700 }}>muted during gameplay</span> -
              we'll be back when the timer runs out to celebrate the winners.
            </div>
          </GlassCard>
        </div>
      )}

      {/* Phase 6: Community organized + Supported by AWS — Linda (host) highlights the volunteer effort */}
      {frame >= 1050 && frame < 1410 && (
        <div style={{
          position: "absolute", bottom: 30, left: 60, right: 60,
          display: "flex", flexDirection: "column", gap: 12,
          opacity: organizedIn * organizedExit,
          transform: `translateY(${(1 - organizedIn) * 30}px)`,
        }}>
          <GlassCard style={{
            padding: "24px 40px",
            borderLeft: `4px solid ${GD_PINK}`,
          }}>
            <div style={{
              fontSize: 14, color: GD_PINK, letterSpacing: 3,
              textTransform: "uppercase", marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
            }}>
              Organized by the Community
            </div>
            <div style={{
              fontSize: 22, fontWeight: 500, color: "white",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>
              Everything behind this event was organized by volunteers -
              people who are <span style={{ color: GD_ACCENT, fontWeight: 700 }}>not employed by AWS</span>,
              just like every User Group leader in the 53 participating cities.
            </div>
          </GlassCard>

          {/* "Supported by AWS" box - pops up below */}
          <div style={{
            opacity: awsBoxIn,
            transform: `translateY(${(1 - awsBoxIn) * 40}px)`,
          }}>
            <GlassCard style={{
              padding: "24px 40px",
              borderLeft: `4px solid ${GD_ORANGE}`,
              background: `linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(255,255,255,0.04) 100%)`,
            }}>
              <div style={{
                fontSize: 14, color: GD_ORANGE, letterSpacing: 3,
                textTransform: "uppercase", marginBottom: 10,
                fontFamily: "'Inter', sans-serif",
              }}>
                Supported by AWS
              </div>
              <div style={{
                fontSize: 22, fontWeight: 500, color: "white",
                fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
              }}>
                Running on <span style={{ color: GD_ORANGE, fontWeight: 700 }}>AWS GameDay environments</span> -
                with amazing AWS people in the orga team who went above and beyond,
                and AWS supporters at all locations - on-site or remote.
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Phase 7: Linda (host) introduces Jerome & Anda - co-organizers doing the Community Intro */}
      {frame >= 1400 && (
        <div style={{
          position: "absolute", bottom: 10, left: 30, right: 30,
          opacity: introIn,
          transform: `translateY(${(1 - introIn) * 30}px)`,
        }}>
          {/* Title outside the box */}
          <div style={{
            fontSize: 20, fontWeight: 700, color: GD_ACCENT, letterSpacing: 4,
            textTransform: "uppercase", marginBottom: 12,
            fontFamily: "'Inter', sans-serif", textAlign: "center",
          }}>
            Meet the Organizers
          </div>
          <GlassCard style={{
            padding: "28px 32px",
            borderLeft: `4px solid ${GD_VIOLET}`,
            background: `linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-evenly", alignItems: "center",
            }}>
              {/* UG Belgium card (left of Jerome) */}
              <div style={{
                width: 260,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "100%", aspectRatio: "600 / 337",
                  overflow: "hidden", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "transparent",
                }}>
                  <Img src={UG_BELGIUM_LOGO} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "8px 12px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>🇧🇪</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>AWS User Group Belgium</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginLeft: 23, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
                    📍 Brussels
                  </div>
                </div>
              </div>

              {/* Jerome */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Img
                  src={staticFile("AWSCommunityGameDayEurope/faces/jerome.jpg")}
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    boxShadow: `0 0 22px 5px ${GD_VIOLET}88`,
                    objectFit: "cover",
                  }}
                />
                <div style={{
                  fontSize: 30, fontWeight: 800, color: "white",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Jerome
                </div>
                <div style={{
                  fontSize: 14, color: "#94a3b8",
                  fontFamily: "'Inter', sans-serif", textAlign: "center",
                }}>
                  AWS Community Builder
                  <br />GameDay Organizer
                </div>
              </div>

              <div style={{
                width: 2, height: 160, background: `linear-gradient(180deg, transparent, ${GD_VIOLET}, transparent)`,
                flexShrink: 0,
              }} />

              {/* Anda */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <Img
                  src={staticFile("AWSCommunityGameDayEurope/faces/anda.jpg")}
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    boxShadow: `0 0 22px 5px ${GD_VIOLET}88`,
                    objectFit: "cover",
                  }}
                />
                <div style={{
                  fontSize: 30, fontWeight: 800, color: "white",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Anda
                </div>
                <div style={{
                  fontSize: 14, color: "#94a3b8",
                  fontFamily: "'Inter', sans-serif", textAlign: "center",
                }}>
                  AWS Community Builder
                  <br />GameDay Organizer
                </div>
              </div>

              {/* UG Geneva card (right of Anda) */}
              <div style={{
                width: 260,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                flexShrink: 0,
              }}>
                <div style={{
                  width: "100%", aspectRatio: "600 / 337",
                  overflow: "hidden", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "transparent",
                }}>
                  <Img src={UG_GENEVA_LOGO} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "8px 12px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>🇨🇭</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>AWS User Group Geneva</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginLeft: 23, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
                    📍 Geneva
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════
// GAME COUNTDOWN — Main 60-min countdown (top-center, BIG)
// ══════════════════════════════════════════════════════════════
const GameCountdown: React.FC<{ frame: number; fps: number; compact?: boolean }> = ({ frame, fps, compact }) => {
  const remaining = Math.max(0, Math.floor((STREAM_TOTAL_DURATION - frame) / FPS));
  const time = formatTime(remaining);
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.02, 1], { extrapolateRight: "clamp" });

  if (compact) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: GD_ACCENT, letterSpacing: 3,
          textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 4,
        }}>
          GameDay
        </div>
        <div style={{
          fontSize: 48, fontWeight: 900, color: "white",
          fontFamily: "'Inter', monospace", letterSpacing: 4,
          textShadow: `0 0 30px ${GD_PURPLE}80`,
        }}>
          {time}
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", transform: `scale(${pulse})` }}>
      <div style={{
        fontSize: 20, fontWeight: 700, color: GD_ACCENT, letterSpacing: 4,
        textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 8,
      }}>
        GameDay Countdown
      </div>
      <div style={{
        fontSize: 110, fontWeight: 900, color: "white",
        fontFamily: "'Inter', monospace", letterSpacing: 6,
        textShadow: `0 0 60px ${GD_PURPLE}80, 0 0 120px ${GD_PURPLE}40`,
      }}>
        {time}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STREAM COUNTDOWN — 30-min pre-stream countdown
// ══════════════════════════════════════════════════════════════
const StreamCountdown: React.FC<{ frame: number; fps: number; compact?: boolean }> = ({ frame, fps, compact }) => {
  const remaining = Math.max(0, Math.floor((PRESTREAM_DURATION - frame) / FPS));
  const time = formatTime(remaining);

  if (compact) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: GD_PINK, letterSpacing: 2,
          textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 2,
        }}>
          Stream
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800, color: GD_PINK,
          fontFamily: "'Inter', monospace", letterSpacing: 3,
        }}>
          {time}
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 18, fontWeight: 700, color: GD_PINK, letterSpacing: 3,
        textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 6,
      }}>
        Stream Starts In
      </div>
      <div style={{
        fontSize: 76, fontWeight: 800, color: GD_PINK,
        fontFamily: "'Inter', monospace", letterSpacing: 5,
        textShadow: `0 0 40px ${GD_PINK}60`,
      }}>
        {time}
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// SCHEDULE CARD — Individual schedule item (bigger text)
// ══════════════════════════════════════════════════════════════
const ScheduleCard: React.FC<{
  segment: ScheduleSegment;
  state: CardState;
  frame: number;
  fps: number;
  index: number;
}> = ({ segment, state, frame, fps, index }) => {
  const enterSpring = spring({ frame: frame - segment.startFrame + 20 * index, fps, config: { damping: 14, stiffness: 80 } });

  const borderColor = state === "active" ? GD_VIOLET : state === "completed" ? "#334155" : "#1e293b";
  const bgOpacity = state === "active" ? 0.12 : 0.04;
  const textColor = state === "active" ? "white" : state === "completed" ? "#64748b" : "#94a3b8";

  return (
    <div style={{
      opacity: enterSpring,
      transform: `translateX(${(1 - enterSpring) * 40}px)`,
      marginBottom: 12,
    }}>
      <div style={{
        background: `rgba(255,255,255,${bgOpacity})`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 14,
        padding: "16px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 22, fontWeight: 700, color: textColor,
            fontFamily: "'Inter', sans-serif",
          }}>
            {segment.label}
          </div>
          {segment.speakers && (
            <div style={{
              fontSize: 16, color: state === "active" ? GD_ACCENT : "#475569",
              fontFamily: "'Inter', sans-serif", marginTop: 4,
            }}>
              {segment.speakers}
            </div>
          )}
        </div>
        {state === "active" && (
          <div style={{
            fontSize: 13, fontWeight: 700, color: GD_VIOLET,
            textTransform: "uppercase", letterSpacing: 2,
            fontFamily: "'Inter', sans-serif",
          }}>
            LIVE
          </div>
        )}
        {state === "completed" && (
          <div style={{ fontSize: 18, color: "#334155" }}>✓</div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// PRE-STREAM SCHEDULE — Centered schedule during pre-stream
// ══════════════════════════════════════════════════════════════
const PreStreamSchedule: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
      width: 680, opacity: fadeIn,
    }}>
      <div style={{
        fontSize: 16, fontWeight: 700, color: GD_ACCENT, letterSpacing: 3,
        textTransform: "uppercase", marginBottom: 16,
        fontFamily: "'Inter', sans-serif", textAlign: "center",
      }}>
        Coming Up
      </div>
      {MAIN_EVENT_SEGMENTS.map((seg, i) => (
        <ScheduleCard key={seg.label} segment={seg} state={getCardState(frame, seg)} frame={frame} fps={fps} index={i} />
      ))}
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// REMINDER BANNER — Animated banners (bigger text)
// ══════════════════════════════════════════════════════════════
const ReminderBanner: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const visible = getVisibleReminders(frame, REMINDERS);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((r) => {
        const progress = interpolate(frame, [r.startFrame, r.startFrame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const exit = interpolate(frame, [r.endFrame - 20, r.endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const pulse = interpolate(frame % 40, [0, 20, 40], [1, 1.02, 1], { extrapolateRight: "clamp" });

        return (
          <div key={r.text} style={{
            position: "absolute", top: 20, left: 0, right: 0,
            display: "flex", justifyContent: "center",
            opacity: progress * exit,
            transform: `scale(${pulse})`,
            zIndex: 100,
          }}>
            <div style={{
              background: `linear-gradient(90deg, ${GD_ORANGE}dd, ${GD_GOLD}dd)`,
              borderRadius: 16, padding: "14px 40px",
              boxShadow: `0 8px 32px ${GD_ORANGE}40`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                fontSize: 16, fontWeight: 800, color: GD_DARK, letterSpacing: 2,
                textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
              }}>
                ⚠
              </div>
              <div style={{
                fontSize: 24, fontWeight: 700, color: GD_DARK,
                fontFamily: "'Inter', sans-serif",
              }}>
                {r.text}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ══════════════════════════════════════════════════════════════
// SCHEDULE SIDEBAR — Right side during main event (bigger)
// ══════════════════════════════════════════════════════════════
const ScheduleSidebar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const slideIn = spring({ frame: frame - PRESTREAM_DURATION, fps, config: { damping: 16, stiffness: 80 } });

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: "42%",
      background: `linear-gradient(270deg, ${GD_DARK}f5 0%, ${GD_DARK}cc 80%, transparent 100%)`,
      transform: `translateX(${(1 - slideIn) * 100}%)`,
      padding: "40px 36px 40px 50px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        fontSize: 16, fontWeight: 700, color: GD_ACCENT, letterSpacing: 3,
        textTransform: "uppercase", marginBottom: 20,
        fontFamily: "'Inter', sans-serif",
      }}>
        Schedule
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {MAIN_EVENT_SEGMENTS.map((seg, i) => (
          <ScheduleCard key={seg.label} segment={seg} state={getCardState(frame, seg)} frame={frame} fps={fps} index={i} />
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// PHASE INDICATOR — Bottom-left phase progress (bigger)
// ══════════════════════════════════════════════════════════════
const PhaseIndicator: React.FC<{ frame: number }> = ({ frame }) => {
  const { name, progress } = getPhaseInfo(frame);

  return (
    <div style={{
      position: "absolute", bottom: 28, left: 36,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "#64748b", letterSpacing: 2,
          textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginBottom: 6,
        }}>
          Current Phase
        </div>
        <div style={{
          fontSize: 22, fontWeight: 700, color: "white",
          fontFamily: "'Inter', sans-serif",
        }}>
          {name}
        </div>
      </div>
      <div style={{
        width: 280, height: 6, background: "rgba(255,255,255,0.08)",
        borderRadius: 3, overflow: "hidden",
      }}>
        <div style={{
          width: `${progress * 100}%`, height: "100%",
          background: `linear-gradient(90deg, ${GD_VIOLET}, ${GD_PINK})`,
          borderRadius: 3,
        }} />
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// NEXT UP INDICATOR — Shows upcoming stage small
// ══════════════════════════════════════════════════════════════
export function getNextSegment(frame: number, segments: ScheduleSegment[]): ScheduleSegment | undefined {
  const activeIdx = segments.findIndex(s => frame >= s.startFrame && frame <= s.endFrame);
  if (activeIdx >= 0 && activeIdx < segments.length - 1) return segments[activeIdx + 1];
  return undefined;
}

const NextUpIndicator: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const allSegments = [...PRE_STREAM_SEGMENTS, ...MAIN_EVENT_SEGMENTS];
  const next = getNextSegment(frame, allSegments);
  if (!next) return null;

  const pulse = interpolate(frame % 90, [0, 45, 90], [0.7, 1, 0.7], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", bottom: 28, right: 36,
      opacity: pulse,
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "10px 18px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: GD_PINK, letterSpacing: 2,
          textTransform: "uppercase", fontFamily: "'Inter', sans-serif",
        }}>
          Next Up
        </div>
        <div style={{
          width: 1, height: 16, background: "rgba(255,255,255,0.15)",
        }} />
        <div style={{
          fontSize: 16, fontWeight: 600, color: "white",
          fontFamily: "'Inter', sans-serif",
        }}>
          {next.label}
        </div>
        {next.speakers && (
          <div style={{
            fontSize: 12, color: "#94a3b8",
            fontFamily: "'Inter', sans-serif",
          }}>
            ({next.speakers})
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STREAM START TRANSITION — Flash at frame 54000
// ══════════════════════════════════════════════════════════════
const StreamStartTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - PRESTREAM_DURATION;
  if (localFrame < -10 || localFrame > 30) return null;

  const flash = interpolate(localFrame, [-10, 0, 5, 30], [0, 0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: `rgba(255,255,255,${flash * 0.8})`,
      zIndex: 200,
      pointerEvents: "none",
    }} />
  );
};

// ══════════════════════════════════════════════════════════════
// ROOT COMPONENT — GameDayStreamOverlay
// ══════════════════════════════════════════════════════════════
export const GameDayStreamOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isPreStream = frame < PRESTREAM_DURATION;
  const isIntro = frame < 1800; // First 60 seconds

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: "'Inter', sans-serif" }}>
      {/* Background */}
      <BackgroundLayer darken={isPreStream ? 0.60 : 0.70} />
      <HexGridOverlay />

      {/* ── PRE-STREAM: Intro (0–1800) ── */}
      <Sequence from={0} durationInFrames={1800} name="Intro Script" layout="none">
        {isIntro && <IntroScene frame={frame} fps={fps} />}
        {isIntro && (
          <div style={{
            position: "absolute", top: 20, right: 24,
            display: "flex", flexDirection: "column", gap: 12,
            zIndex: 50,
          }}>
            <GlassCard style={{ padding: "12px 20px" }}>
              <GameCountdown frame={frame} fps={fps} compact />
            </GlassCard>
            <GlassCard style={{ padding: "10px 18px" }}>
              <StreamCountdown frame={frame} fps={fps} compact />
            </GlassCard>
          </div>
        )}
      </Sequence>

      {/* ── PRE-STREAM: Countdown + Schedule (1800–54000) ── */}
      <Sequence from={1800} durationInFrames={PRESTREAM_DURATION - 1800} name="Pre-Stream Countdown" layout="none">
        {isPreStream && !isIntro && (
          <>
            <div style={{
              position: "absolute", top: 40, left: 0, right: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            }}>
              <GameCountdown frame={frame} fps={fps} />
              <StreamCountdown frame={frame} fps={fps} />
            </div>
            <PreStreamSchedule frame={frame} fps={fps} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      {/* Reminder banners span entire pre-stream */}
      {isPreStream && <ReminderBanner frame={frame} fps={fps} />}

      {/* ── MAIN EVENT SEQUENCES ── */}
      <Sequence from={PRESTREAM_DURATION} durationInFrames={COMMUNITY_INTRO_DURATION} name="Community Intro" layout="none">
        {!isPreStream && frame < PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      <Sequence from={PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION} durationInFrames={SUPPORT_DURATION} name="Support Process" layout="none">
        {!isPreStream && frame >= PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION && frame < PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      <Sequence from={PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION} durationInFrames={SPECIAL_GUEST_DURATION} name="Special Guest" layout="none">
        {!isPreStream && frame >= PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION && frame < PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      <Sequence from={PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION} durationInFrames={GAMEMASTERS_DURATION} name="Gamemasters Intro" layout="none">
        {!isPreStream && frame >= PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION && frame < PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      <Sequence from={PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION} durationInFrames={INSTRUCTIONS_DURATION} name="Instructions & Rules" layout="none">
        {!isPreStream && frame >= PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION && frame < PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION + INSTRUCTIONS_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      <Sequence from={PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION + INSTRUCTIONS_DURATION} durationInFrames={DISTRIBUTE_CODES_DURATION} name="Distribute Codes" layout="none">
        {!isPreStream && frame >= PRESTREAM_DURATION + COMMUNITY_INTRO_DURATION + SUPPORT_DURATION + SPECIAL_GUEST_DURATION + GAMEMASTERS_DURATION + INSTRUCTIONS_DURATION && (
          <>
            <div style={{ position: "absolute", top: 30, left: 36 }}>
              <GameCountdown frame={frame} fps={fps} />
            </div>
            <ScheduleSidebar frame={frame} fps={fps} />
            <PhaseIndicator frame={frame} />
            <NextUpIndicator frame={frame} fps={fps} />
          </>
        )}
      </Sequence>

      {/* Stream start flash transition */}
      <StreamStartTransition frame={frame} />
    </AbsoluteFill>
  );
};
