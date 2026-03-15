import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ── All 57 participating user groups ──
const USER_GROUPS = [
  { flag: "🇪🇸", name: "AWS Barcelona User Group", city: "Barcelona, Spain", url: "https://www.meetup.com/Barcelona-Amazon-Web-Services-Meetup/" },
  { flag: "🇬🇧", name: "AWS Leeds User Group", city: "Leeds, United Kingdom", url: "https://www.meetup.com/aws-leeds-user-group/" },
  { flag: "🇫🇮", name: "AWS Meetup JKL", city: "Jyväskylä, Finland", url: "https://www.meetup.com/aws-meetup-jkl/" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Lausanne", city: "Lausanne, Switzerland", url: "https://www.meetup.com/aws-swiss-user-group-lausanne/" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Zürich", city: "Zürich, Switzerland", url: "https://www.meetup.com/aws-swiss-user-group-zurich/" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Geneva", city: "Geneva, Switzerland", url: "https://www.meetup.com/AWS-Swiss-User-Group-Geneva/" },
  { flag: "🇷🇴", name: "AWS Transylvania Cloud", city: "Cluj-Napoca, Romania", url: "https://www.meetup.com/transylvaniacloud/" },
  { flag: "🇵🇱", name: "AWS User Group 3City", city: "Gdansk, Poland", url: "https://www.meetup.com/aws-user-group-3city/" },
  { flag: "🇪🇸", name: "AWS UG Asturias", city: "Oviedo, Spain", url: "https://www.meetup.com/aws-user-group-asturias/" },
  { flag: "🇬🇷", name: "AWS User Group Athens", city: "Athens, Greece", url: "https://www.meetup.com/aws-user-group-athens/" },
  { flag: "🇧🇪", name: "AWS User Group Belgium", city: "Brussels, Belgium", url: "https://www.meetup.com/AWS-User-Group-Belgium/" },
  { flag: "🇩🇪", name: "AWS User Group Bonn", city: "Bonn, Germany", url: "https://www.meetup.com/aws-bonn/" },
  { flag: "🇭🇺", name: "AWS User Group Budapest", city: "Budapest, Hungary", url: "https://www.meetup.com/aws-user-group-hungary/" },
  { flag: "🇩🇪", name: "AWS User Group Cologne", city: "Köln, Germany", url: "https://www.meetup.com/aws-cologne/" },
  { flag: "🇮🇹", name: "AWS User Group Cuneo", city: "Cuneo, Italy", url: "https://www.meetup.com/aws-cuneo/" },
  { flag: "🇩🇪", name: "AWS User Group Dortmund", city: "Dortmund, Germany", url: "https://www.meetup.com/Dortmund-AWS-User-Group/" },
  { flag: "🇫🇮", name: "AWS User Group Finland", city: "Helsinki, Finland", url: "https://www.meetup.com/awsfin/" },
  { flag: "🇫🇷", name: "AWS UG France – Paris", city: "Paris, France", url: "https://www.meetup.com/French-AWS-UG/" },
  { flag: "🇪🇸", name: "AWS UG Galicia", city: "Santiago de Compostela, Spain", url: "https://www.meetup.com/aws-ug-galicia/" },
  { flag: "🇮🇹", name: "AWS User Group Genova", city: "Genova, Italy", url: "https://www.meetup.com/aws-user-group-genova/" },
  { flag: "🇩🇪", name: "AWS User Group Hannover", city: "Hannover, Germany", url: "https://www.meetup.com/AWS-Usergroup-Hannover/" },
  { flag: "🇳🇴", name: "AWS UG Innlandet", city: "Hamar, Norway", url: "https://www.meetup.com/aws-user-group-innlandet-norway/" },
  { flag: "🇹🇷", name: "AWS User Group Istanbul", city: "Istanbul, Turkey", url: "https://www.meetup.com/meetup-group-qxmdkdal/" },
  { flag: "🇺🇦", name: "AWS UG Ivano-Frankivsk", city: "Ivano-Frankivsk, Ukraine", url: "https://www.meetup.com/ivano-frankivsk-amazon-web-services-meetup-group/" },
  { flag: "🇫🇮", name: "AWS User Group Kuopio", city: "Kuopio, Finland", url: "https://www.meetup.com/aws-meetup-kuopio/" },
  { flag: "🇸🇮", name: "AWS UG Ljubljana", city: "Ljubljana, Slovenia", url: "https://www.meetup.com/AWS-User-Group-Ljubljana/" },
  { flag: "🇲🇰", name: "AWS UG Macedonia", city: "Skopje, Macedonia", url: "https://www.meetup.com/awsugmkd/" },
  { flag: "🇪🇸", name: "AWS User Group Malaga", city: "Malaga, Spain", url: "https://www.meetup.com/es-ES/aws-user-group-malaga/" },
  { flag: "🇲🇩", name: "AWS UG Moldova", city: "Chisinau, Moldova", url: "https://www.meetup.com/amazon-web-services-user-group-md/" },
  { flag: "🇲🇪", name: "AWS UG Montenegro", city: "Podgorica, Montenegro", url: "https://www.meetup.com/aws-ug-montenegro/" },
  { flag: "🇩🇪", name: "AWS User Group Munich", city: "München, Germany", url: "https://www.meetup.com/AWS-Munich/" },
  { flag: "🇩🇪", name: "AWS UG Münsterland", city: "Münster, Germany", url: "https://www.meetup.com/AWS-Usergroup-Munsterland/" },
  { flag: "🇮🇹", name: "AWS User Group Napoli", city: "Naples, Italy", url: "https://www.meetup.com/it-IT/aws-user-group-napoli/" },
  { flag: "🇩🇪", name: "AWS UG Nürnberg", city: "Nürnberg, Germany", url: "https://www.meetup.com/Nurnberg-AWS-User-Group/" },
  { flag: "🇳🇴", name: "AWS UG Oslo", city: "Oslo, Norway", url: "https://www.meetup.com/AWS-User-Group-Norway/" },
  { flag: "🇮🇹", name: "AWS User Group Pavia", city: "Pavia, Italy", url: "https://www.meetup.com/awsusergrouppavia/" },
  { flag: "🇮🇹", name: "AWS User Group Roma", city: "Roma, Italy", url: "https://www.meetup.com/Amazon-Web-Services-Rome/" },
  { flag: "🇮🇹", name: "AWS User Group Salerno", city: "Salerno, Italy", url: "https://www.meetup.com/aws-user-group-salerno/" },
  { flag: "🇧🇦", name: "AWS UG Sarajevo", city: "Sarajevo, Bosnia & Herzegovina", url: "https://www.meetup.com/AWS-User-Group-Sarajevo/" },
  { flag: "🇸🇪", name: "AWS UG Skåne", city: "Malmö, Sweden", url: "https://www.meetup.com/aws-user-group-skane/" },
  { flag: "🇫🇮", name: "AWS UG Tampere", city: "Tampere, Finland", url: "https://www.meetup.com/aws-user-group-tampere/" },
  { flag: "🇨🇭", name: "AWS UG Ticino", city: "Lugano, Switzerland", url: "https://www.meetup.com/aws-user-group-ticino/" },
  { flag: "🇷🇴", name: "AWS UG Timisoara", city: "Timisoara, Romania", url: "https://www.meetup.com/aws-timisoara" },
  { flag: "🇮🇹", name: "AWS UG Venezia", city: "Venice, Italy", url: "https://www.meetup.com/aws-user-group-venezia/" },
  { flag: "🇦🇹", name: "AWS User Group Vienna", city: "Vienna, Austria", url: "https://www.meetup.com/amazon-web-services-aws-vienna/" },
  { flag: "🇵🇱", name: "AWS UG Warsaw", city: "Warsaw, Poland", url: "https://www.meetup.com/pl-PL/aws-user-group-warsaw/" },
  { flag: "🇬🇧", name: "AWS UG West Midlands", city: "Birmingham, United Kingdom", url: "https://www.meetup.com/aws-user-group-west-midlands/" },
  { flag: "🇮🇹", name: "AWS Well-Architected UG Italy", city: "Milano, Italy", url: "https://www.meetup.com/the-cloud-house/" },
  { flag: "🇩🇪", name: "AWS Women's UG Munich", city: "Munich, Germany", url: "https://www.meetup.com/aws-womens-user-group-munich/" },
  { flag: "🇩🇪", name: "Berlin AWS User Group", city: "Berlin, Germany", url: "https://www.meetup.com/aws-berlin/" },
  { flag: "🇷🇴", name: "Bucharest AWS User Group", city: "Bucharest, Romania", url: "https://www.meetup.com/Bucharest-AWS-User-Group/" },
  { flag: "🇩🇪", name: "Dresden AWS User Group", city: "Dresden, Germany", url: "https://www.meetup.com/Dresden-AWS-User-Group" },
  { flag: "🇩🇪", name: "Frankfurt AWS User Group", city: "Frankfurt, Germany", url: "https://www.meetup.com/aws-frankfurt/" },
  { flag: "🇫🇷", name: "Grenoble AWS User Group", city: "Grenoble, France", url: "https://www.meetup.com/Grenoble-AWS-User-Group/" },
  { flag: "🇩🇪", name: "Leipzig AWS User Group", city: "Leipzig, Germany", url: "https://www.meetup.com/de/aws-leipzig/" },
  { flag: "🇫🇷", name: "Lille AWS User Group", city: "Lille, France", url: "https://www.meetup.com/Lille-AWS-Amazon-Web-Services-User-Group/" },
  { flag: "🇫🇷", name: "Poitiers AWS User Group", city: "Poitiers, France", url: "https://www.meetup.com/Poitiers-AWS-User-Group/" },
];

// Country counts for stats
const COUNTRIES = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));

// ── Background image for European GameDay ──
const BG_IMAGE = "AWSCommunityGameDayEurope/background_landscape_colour.png";

// ── GameDay color palette (from the banner) ──
const GD_DARK = "#0c0820";
const GD_PURPLE = "#6c3fa0";
const GD_VIOLET = "#8b5cf6";
const GD_INDIGO = "#4f46e5";
const GD_PINK = "#d946ef";
const GD_ACCENT = "#c084fc";

// ── Helpers ──
function useSpring(frame: number, fps: number, delay: number) {
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
}

function CountUp({ target, frame, startFrame, suffix = "" }: { target: number; frame: number; startFrame: number; suffix?: string }) {
  const progress = Math.min(1, Math.max(0, (frame - startFrame) / 60));
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = Math.round(eased * target);
  return <>{value}{suffix}</>;
}

// ── Scene 1: Hero Title (frames 0–150) ──
const HeroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSpring = useSpring(frame, fps, 5);
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const dateOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const statsOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const badgeSpring = useSpring(frame, fps, 70);

  // Unicorn glow pulse
  const glowPulse = interpolate(frame, [0, 60, 120], [0.3, 0.7, 0.3], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: GD_DARK }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.15 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.65)" }} />
      {/* Radial glow background */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 800, height: 800,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 40).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%",
      }} />

      {/* Geometric grid */}
      <AbsoluteFill style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="hexgrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c084fc" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexgrid)" />
        </svg>
      </AbsoluteFill>

      {/* aws badge top-left */}
      <div style={{
        position: "absolute", top: 28, left: 40,
        fontSize: 14, fontWeight: 700, color: "#94a3b8",
        fontFamily: "'Inter', sans-serif", letterSpacing: "2px",
        opacity: interpolate(frame, [0, 20], [0, 0.6], { extrapolateRight: "clamp" }),
      }}>
        aws
      </div>

      {/* Main title */}
      <div style={{
        position: "absolute", top: 120, left: 0, right: 0,
        textAlign: "center",
        transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
        opacity: titleSpring,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: GD_ACCENT,
          letterSpacing: "4px", textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif", marginBottom: 12,
        }}>
          COMMUNITY
        </div>
        <div style={{
          fontSize: 64, fontWeight: 900, letterSpacing: "-2px",
          fontFamily: "'Inter', sans-serif", lineHeight: 1,
          background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          GAMEDAY
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: "#ffffff",
          fontFamily: "'Inter', sans-serif", marginTop: 8,
          letterSpacing: "6px", opacity: subtitleOpacity,
        }}>
          EUROPE
        </div>
      </div>

      {/* Date */}
      <div style={{
        position: "absolute", top: 340, left: 0, right: 0,
        textAlign: "center", opacity: dateOpacity,
      }}>
        <span style={{
          fontSize: 22, fontWeight: 600, color: GD_PINK,
          fontFamily: "'Inter', sans-serif",
        }}>
          17 March 2026
        </span>
      </div>

      {/* Stats row */}
      <div style={{
        position: "absolute", top: 420, left: 80, right: 80,
        display: "flex", justifyContent: "center", gap: 80,
        opacity: statsOpacity,
      }}>
        {[
          { label: "User Groups", value: 57, suffix: "", start: 60, isCountUp: true },
          { label: "Countries", value: COUNTRIES.length, suffix: "+", start: 65, isCountUp: true },
          { label: "One Epic Day", value: 1, suffix: "", start: 70, isCountUp: false },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
              {stat.isCountUp ? (
                <CountUp target={stat.value} frame={frame} startFrame={stat.start} suffix={stat.suffix} />
              ) : (
                <>{stat.value}{stat.suffix}</>
              )}
            </div>
            <div style={{
              fontSize: 12, color: "#94a3b8", marginTop: 4,
              textTransform: "uppercase", letterSpacing: "2px",
              fontFamily: "'Inter', sans-serif",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Gradient badge */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeSpring,
        transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${GD_INDIGO}, ${GD_PINK})`,
          borderRadius: 12, padding: "10px 28px",
          fontSize: 14, fontWeight: 700, color: "#ffffff",
          fontFamily: "'Inter', sans-serif", letterSpacing: "1px",
        }}>
          🎮 Meet the Participating Communities
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Scrolling User Group Cards (frames 150–2550) ──
// Show 6 groups at a time in a 3×2 grid, each page visible for ~120 frames
const GROUPS_PER_PAGE = 6;
const PAGE_DURATION = 120; // frames per page
const TOTAL_PAGES = Math.ceil(USER_GROUPS.length / GROUPS_PER_PAGE);

const GroupsScrollScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Advance page 6 frames early so spring animation is already visible at the visual boundary
  const TRANSITION_LEAD = 6;
  const adjustedFrame = frame + TRANSITION_LEAD;
  const currentPage = Math.min(Math.floor(adjustedFrame / PAGE_DURATION), TOTAL_PAGES - 1);
  const pageFrame = adjustedFrame - currentPage * PAGE_DURATION;
  const startIdx = currentPage * GROUPS_PER_PAGE;
  const pageGroups = USER_GROUPS.slice(startIdx, startIdx + GROUPS_PER_PAGE);

  // Fade out cards near end of page for smoother transition
  const pageExit = interpolate(pageFrame, [PAGE_DURATION - 8, PAGE_DURATION], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Page counter
  const pageLabel = `${currentPage + 1} / ${TOTAL_PAGES}`;

  // Progress bar
  const progress = (currentPage + 1) / TOTAL_PAGES;

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.12 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.60)" }} />
      {/* Subtle grid */}
      <AbsoluteFill style={{ opacity: 0.02 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c084fc" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
      </AbsoluteFill>

      {/* Header bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: `linear-gradient(90deg, ${GD_PURPLE}40, ${GD_INDIGO}40)`,
        borderBottom: `1px solid ${GD_VIOLET}30`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: GD_ACCENT, letterSpacing: "2px" }}>
          🎮 AWS COMMUNITY GAMEDAY EUROPE
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          {pageLabel}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", top: 56, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.05)",
      }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${GD_INDIGO}, ${GD_PINK})`,
          transition: "width 0.3s ease",
        }} />
      </div>

      {/* 3×2 grid of group cards */}
      <div style={{
        position: "absolute", top: 80, left: 40, right: 40, bottom: 60,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 16,
      }}>
        {pageGroups.map((group, i) => {
          const cardSpring = spring({
            frame: pageFrame - i * 4,
            fps,
            config: { damping: 16, stiffness: 100 },
          });
          const slideDir = i % 2 === 0 ? -30 : 30;

          // Accent color cycling
          const colors = [GD_VIOLET, GD_INDIGO, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1"];
          const accentColor = colors[(startIdx + i) % colors.length];

          return (
            <div
              key={`${currentPage}-${i}`}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${accentColor}44`,
                borderRadius: 14,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                opacity: cardSpring * pageExit,
                transform: `translateY(${interpolate(cardSpring, [0, 1], [slideDir, 0])}px)`,
              }}
            >
              {/* Flag + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  fontSize: 32, lineHeight: 1,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}>
                  {group.flag}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: "#ffffff",
                  lineHeight: 1.2,
                }}>
                  {group.name}
                </div>
              </div>

              {/* City */}
              <div style={{
                fontSize: 12, color: "#94a3b8", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                📍 {group.city}
              </div>

              {/* Meetup link pill */}
              <div style={{
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                borderRadius: 8, padding: "5px 12px",
                fontSize: 10, color: accentColor,
                fontWeight: 600, letterSpacing: "0.5px",
                alignSelf: "flex-start",
              }}>
                meetup.com ↗
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: total count */}
      <div style={{
        position: "absolute", bottom: 16, left: 40, right: 40,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: "#475569" }}>
          57 User Groups · {COUNTRIES.length} Countries · 17 March 2026
        </div>
        <div style={{
          fontSize: 11, color: GD_ACCENT, fontWeight: 600,
        }}>
          Showing {startIdx + 1}–{Math.min(startIdx + GROUPS_PER_PAGE, USER_GROUPS.length)} of {USER_GROUPS.length}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Closing CTA (frames 2550–2700) ──
const ClosingScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSpring = useSpring(frame, fps, 5);
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const badgeSpring = useSpring(frame, fps, 40);
  const glowPulse = interpolate(frame, [0, 75, 150], [0.2, 0.6, 0.2], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.10 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.72)" }} />
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 900, height: 900,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PINK}${Math.round(glowPulse * 30).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
        borderRadius: "50%",
      }} />

      {/* Grid */}
      <AbsoluteFill style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid3" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c084fc" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid3)" />
        </svg>
      </AbsoluteFill>

      {/* Main message */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        opacity: titleSpring,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 600, color: GD_ACCENT,
          letterSpacing: "4px", textTransform: "uppercase", marginBottom: 16,
        }}>
          17 MARCH 2026
        </div>
        <div style={{
          fontSize: 56, fontWeight: 900, letterSpacing: "-2px",
          textAlign: "center", lineHeight: 1.1,
          background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          See You at GameDay!
        </div>
        <div style={{
          fontSize: 18, color: "#94a3b8", marginTop: 16,
          opacity: subtitleOpacity, textAlign: "center",
        }}>
          57 User Groups · {COUNTRIES.length} Countries · One Epic Competition
        </div>

        {/* CTA badge */}
        <div style={{
          marginTop: 40,
          opacity: badgeSpring,
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${GD_INDIGO}, ${GD_PINK})`,
            borderRadius: 14, padding: "14px 36px",
            fontSize: 16, fontWeight: 700, color: "#ffffff",
            letterSpacing: "1px",
          }}>
            🎮 Join Your Local User Group
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ──
// Scene 1: Hero (0–150)
// Scene 2: Groups scroll (150–2550) = 10 pages × 120 frames × ~2 extra
// Scene 3: Closing (last 150 frames)
const HERO_DURATION = 150;
const SCROLL_DURATION = TOTAL_PAGES * PAGE_DURATION; // 10 pages × 120 = 1200
const CLOSING_DURATION = 150;
export const TOTAL_DURATION = HERO_DURATION + SCROLL_DURATION + CLOSING_DURATION;

export const CommunityGamedayEurope: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: GD_DARK }}>
      <Sequence from={0} durationInFrames={HERO_DURATION}>
        <HeroScene frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={HERO_DURATION} durationInFrames={SCROLL_DURATION}>
        <GroupsScrollScene frame={frame - HERO_DURATION} fps={fps} />
      </Sequence>
      <Sequence from={HERO_DURATION + SCROLL_DURATION} durationInFrames={CLOSING_DURATION}>
        <ClosingScene frame={frame - HERO_DURATION - SCROLL_DURATION} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
