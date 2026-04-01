/**
 * BlogExplainer.tsx
 * 21 blog-explainer compositions for the AWS Community GameDay Europe 2026 blog post.
 * All compositions: 1280x720 @ 30fps, 900 frames (30 seconds).
 * Use staticFile('screenshots/...') for screenshots symlinked in public/.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BackgroundLayer } from "../../components/BackgroundLayer";
import { GlassCard } from "../../components/GlassCard";
import { HexGridOverlay } from "../../components/HexGridOverlay";
import {
  GD_ACCENT,
  GD_GOLD,
  GD_GREEN,
  GD_ORANGE,
  GD_PINK,
  GD_PURPLE,
  GD_RED,
  GD_VIOLET,
} from "../../design/colors";

// ─── Shared constants ─────────────────────────────────────────────────────────
const FRAMES = 900;
const FONT = "'Inter', 'Amazon Ember', sans-serif";

// ─── Shared animation hook ────────────────────────────────────────────────────
function useSlideIn(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 22, mass: 0.5, stiffness: 100 },
  });
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(enter, [0, 1], [40, 0]);
  const opacity = enter * fadeOut;
  return { enter, fadeOut, y, opacity };
}

// ─── Shared UI components ─────────────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; color?: string }> = ({
  text,
  color = GD_ACCENT,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: `${color}22`,
      border: `1px solid ${color}55`,
      borderRadius: 6,
      padding: "5px 14px",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2.5,
      color,
      fontFamily: FONT,
      textTransform: "uppercase" as const,
    }}
  >
    {text}
  </div>
);

const CodeLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: "'Fira Code', 'Courier New', monospace",
      fontSize: 16,
      color: GD_ACCENT,
      background: "rgba(0,0,0,0.4)",
      borderRadius: 6,
      padding: "10px 16px",
      border: `1px solid ${GD_PURPLE}44`,
      lineHeight: 1.6,
    }}
  >
    {children}
  </div>
);

const CheckItem: React.FC<{ label: string; sub: string; color?: string; delay: number }> = ({
  label,
  sub,
  color = GD_GREEN,
  delay,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const itemEnter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, mass: 0.5 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        opacity: itemEnter,
        transform: `translateX(${interpolate(itemEnter, [0, 1], [-30, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `${color}22`,
          border: `2px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{label}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", fontFamily: FONT, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

const ScreenshotFrame: React.FC<{
  src: string;
  label: string;
  sublabel?: string;
  enter: number;
  accentColor?: string;
}> = ({ src, label, sublabel, enter, accentColor = GD_PURPLE }) => (
  <div
    style={{
      position: "relative",
      opacity: enter,
      transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `2px solid ${accentColor}55`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)`,
        flex: 1,
        position: "relative",
        background: "#0c0820",
      }}
    >
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(12,8,32,0.92))",
          borderRadius: "0 0 10px 10px",
          padding: "32px 20px 16px",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: FONT, marginTop: 3 }}>{sublabel}</div>
        )}
      </div>
    </div>
  </div>
);

const RepoBox: React.FC<{
  title: string;
  subtitle: string;
  bullets: string[];
  color: string;
  enter: number;
}> = ({ title, subtitle, bullets, color, enter }) => (
  <GlassCard
    style={{
      flex: 1,
      opacity: enter,
      transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
      borderColor: `${color}44`,
      borderWidth: 1,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color, fontFamily: FONT, textTransform: "uppercase" as const }}>
        {subtitle}
      </div>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: FONT, marginBottom: 16 }}>{title}</div>
    {bullets.map((b, i) => (
      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, marginTop: 8, flexShrink: 0 }} />
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", fontFamily: FONT }}>{b}</div>
      </div>
    ))}
  </GlassCard>
);

// ─── COMPOSITION 01: Hero Intro ───────────────────────────────────────────────
export const Blog01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const labelEnter = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 20, mass: 0.5 } });
  const subEnter = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 20, mass: 0.5 } });
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.5} />
      <HexGridOverlay />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          opacity: fadeOut,
        }}
      >
        <div style={{ opacity: labelEnter, transform: `translateY(${interpolate(labelEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="AWS Community GameDay Europe 2026" color={GD_VIOLET} />
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 960,
            opacity: enter,
            transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
            textShadow: "0 4px 32px rgba(0,0,0,0.6)",
          }}
        >
          35 Compositions.
          <br />
          <span style={{ color: GD_ACCENT }}>29 Stream Inserts.</span>
          <br />
          One Open-Source System.
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: 700,
            opacity: subEnter,
            transform: `translateY(${interpolate(subEnter, [0, 1], [20, 0])}px)`,
          }}
        >
          Built in 80 hours. Alone. For every user group on the planet to fork and use.
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 8,
            opacity: subEnter,
          }}
        >
          {[
            { val: "80h", label: "build time" },
            { val: "35", label: "compositions" },
            { val: "29", label: "stream inserts" },
            { val: "1", label: "person" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: GD_GOLD }}>{val}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1, textTransform: "uppercase" as const }}>{label}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 02: Two-Repo Architecture ───────────────────────────────────
export const Blog02TwoRepos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const leftEnter = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, mass: 0.5 } });
  const rightEnter = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, mass: 0.5 } });
  const arrowEnter = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 20, mass: 0.5 } });
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "48px 60px", gap: 28, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Architecture" color={GD_VIOLET} />
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginTop: 12 }}>
            The two-repo design
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            GitHub Actions connects them at deploy time - no tight coupling
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "stretch", flex: 1 }}>
          <RepoBox
            title="stream-templates"
            subtitle="The Engine"
            color={GD_VIOLET}
            enter={leftEnter}
            bullets={[
              "35 Remotion compositions (pre-show, gameplay, closing, inserts)",
              "Vite-powered web player for the stream overlay",
              "GitHub Actions deploy workflow",
              "Base path auto-detected from GITHUB_REPOSITORY",
              "CC BY-NC-SA 4.0 - fork freely",
            ]}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
              opacity: arrowEnter,
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: GD_ACCENT, textAlign: "center", textTransform: "uppercase" as const, marginBottom: 4 }}>
              GitHub<br />Actions
            </div>
            <svg width="48" height="32" viewBox="0 0 48 32">
              <path d="M0 16 H40 M30 4 L48 16 L30 28" stroke={GD_ACCENT} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", maxWidth: 72 }}>pulls your config at build time</div>
          </div>
          <RepoBox
            title="community-event"
            subtitle="What You Edit"
            color={GD_ORANGE}
            enter={rightEnter}
            bullets={[
              "config/schedule.ts - your event date and phase times",
              "config/participants.ts - your user groups and Meetup logos",
              "config/sponsors.ts - your sponsors for the info loop",
              "config/closing.ts - winning teams after the game",
              "Fork this repo - you never touch the engine repo",
            ]}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 03: Remotion Studio ─────────────────────────────────────────
export const Blog03RemotionStudio: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const labelEnter = useSlideIn(12);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Remotion Studio" color={GD_VIOLET} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            35 compositions, all in one studio
          </div>
        </div>
        <div style={{ flex: 1, opacity: labelEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/studio/readme-remotion-studio.png")}
            label="Remotion Studio - browse all compositions, scrub frames, adjust props in real time"
            sublabel="All 35 compositions registered in Root.tsx - 1280x720 @ 30fps"
            enter={labelEnter.enter}
            accentColor={GD_VIOLET}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 04: Parameterized Props ─────────────────────────────────────
export const Blog04RemotionProps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const imgEnter = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 22, mass: 0.5 } });

  const fields = [
    { label: "minutesRemaining", value: "45", color: GD_GOLD, delay: 14 },
    { label: "teamName", value: '"Team Unicorn"', color: "#a8ff78", delay: 20 },
    { label: "questTitle", value: '"Quest 3 - S3 Glacier"', color: "#a8ff78", delay: 26 },
    { label: "leaderPosition", value: "2", color: GD_ORANGE, delay: 32 },
    { label: "message", value: '"Quest is now fixed!"', color: "#a8ff78", delay: 38 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "32px 52px", gap: 16, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Live Insert Props" color={GD_ACCENT} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            The stream host types values live - inserts react instantly
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Zod-validated schemas define what fields each insert accepts - no code changes, no recompile
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          {/* Left: screenshot of studio insert view */}
          <div style={{ flex: 1.1, opacity: imgEnter, transform: `scale(${interpolate(imgEnter, [0, 1], [0.94, 1])})` }}>
            <div style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${GD_VIOLET}44`, height: "100%", background: "#0c0820" }}>
              <Img
                src={staticFile("screenshots/studio/readme-remotion-studio-insert.png")}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
          </div>
          {/* Right: mock props panel showing values the stream host types */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <GlassCard style={{ borderColor: `${GD_ACCENT}33`, padding: "10px 16px", marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: GD_ACCENT, textTransform: "uppercase" as const }}>
                Stream host types these live
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Remotion Studio props panel - during the event
              </div>
            </GlassCard>
            {fields.map((f) => {
              const fEnter = spring({ frame: Math.max(0, frame - f.delay), fps, config: { damping: 20, mass: 0.5 } });
              return (
                <div
                  key={f.label}
                  style={{
                    opacity: fEnter,
                    transform: `translateX(${interpolate(fEnter, [0, 1], [24, 0])}px)`,
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: 8,
                    padding: "8px 14px",
                    border: `1px solid ${GD_PURPLE}33`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "rgba(255,255,255,0.45)", minWidth: 160 }}>{f.label}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: f.color, fontWeight: 700 }}>{f.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 05: GitHub Actions Workflow ─────────────────────────────────
export const Blog05ActionsWorkflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const steps = [
    { label: "Checkout stream-templates", sub: "uses: actions/checkout with TEMPLATE_REPO variable", color: GD_VIOLET, delay: 0 },
    { label: "Checkout community-event", sub: "checks out config/, faces/, logos/ into build context", color: GD_ORANGE, delay: 8 },
    { label: "Inject config into web player", sub: "copies schedule.ts - drives the auto-switcher", color: GD_ACCENT, delay: 16 },
    { label: "Build Vite web player", sub: "VITE_BASE_PATH set from REPO_NAME - auto-resolves on any fork", color: GD_GOLD, delay: 24 },
    { label: "Deploy to GitHub Pages", sub: "live at username.github.io/community-event/", color: GD_GREEN, delay: 32 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "40px 60px", gap: 20, opacity: fadeOut }}>
        <div
          style={{
            opacity: spring({ frame, fps, config: { damping: 20, mass: 0.5 } }),
          }}
        >
          <SectionLabel text="GitHub Actions" color={GD_GREEN} />
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            Push to main - the pipeline takes it from there
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            deploy.yml in the event repo - no secrets, just one variable
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
          {steps.map((step, i) => {
            const sEnter = spring({ frame: Math.max(0, frame - step.delay), fps, config: { damping: 20, mass: 0.5 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: sEnter,
                  transform: `translateX(${interpolate(sEnter, [0, 1], [-40, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `${step.color}22`,
                    border: `2px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 800,
                    color: step.color,
                  }}
                >
                  {i + 1}
                </div>
                <GlassCard style={{ flex: 1, padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{step.label}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{step.sub}</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.color, flexShrink: 0 }} />
                  </div>
                </GlassCard>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", left: 75, marginTop: 44 }}>
                    <div style={{ width: 2, height: 10, background: `${step.color}33`, marginLeft: 15 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 06: 3 Manual Setup Steps ────────────────────────────────────
export const Blog06SetupSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "52px 80px", gap: 32, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Setup" color={GD_GREEN} />
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            3 manual steps - then it's automatic
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            GitHub disables Actions and Pages on forks by default for security - you have to turn them on once
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center" }}>
          <CheckItem
            label="Enable GitHub Actions"
            sub="Settings tab on your fork - Actions - General - Allow all actions"
            color={GD_GREEN}
            delay={10}
          />
          <CheckItem
            label="Enable GitHub Pages"
            sub="Settings - Pages - Source: GitHub Actions - Save"
            color={GD_GREEN}
            delay={20}
          />
          <CheckItem
            label="Push to main (or trigger manually)"
            sub="After the first deploy, every push runs the pipeline automatically"
            color={GD_GREEN}
            delay={30}
          />
        </div>
        <div
          style={{
            opacity: spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 20, mass: 0.5 } }),
          }}
        >
          <GlassCard style={{ borderColor: `${GD_ORANGE}33`, padding: "14px 20px" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: GD_ORANGE, fontWeight: 700 }}>One variable, not a secret: </span>
              TEMPLATE_REPO in Settings - Secrets and variables - Actions - Variables tab. Points your event repo at your engine fork.
            </div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 07: TEMPLATE_REPO Variable ──────────────────────────────────
export const Blog07TemplateVar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const codeEnter = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 20, mass: 0.5 } });
  const noteEnter = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 20, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "52px 80px", gap: 24, opacity: fadeOut }}>
        <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Configuration" color={GD_ACCENT} />
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            TEMPLATE_REPO - the one variable that connects both repos
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            It is a variable, not a secret - no sensitive data, just a repo reference
          </div>
        </div>
        <div style={{ opacity: codeEnter, transform: `translateY(${interpolate(codeEnter, [0, 1], [20, 0])}px)`, display: "flex", flexDirection: "column", gap: 12 }}>
          <CodeLine>
            <span style={{ color: "rgba(255,255,255,0.4)" }}># In deploy.yml (community-event repo)</span>
            <br />
            <span style={{ color: GD_VIOLET }}>env</span>:
            <br />
            {"  "}<span style={{ color: GD_ACCENT }}>TEMPLATE_REPO</span>: <span style={{ color: GD_GOLD }}>${"${{ vars.TEMPLATE_REPO }}"}</span>
            <br />
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}># vars.TEMPLATE_REPO is set in:</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}># Settings - Secrets and variables - Actions - Variables tab</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}># Example value: your-org/community-gameday-europe-stream-templates</span>
          </CodeLine>
          <CodeLine>
            <span style={{ color: "rgba(255,255,255,0.4)" }}># Base path - auto-detects the repo name on any fork</span>
            <br />
            <span style={{ color: GD_ACCENT }}>REPO_NAME</span>="${"${GITHUB_REPOSITORY##*/}"}"
            <br />
            <span style={{ color: GD_ACCENT }}>VITE_BASE_PATH</span>="/<span style={{ color: GD_GOLD }}>${"${REPO_NAME}"}</span>/"
          </CodeLine>
        </div>
        <div style={{ opacity: noteEnter }}>
          <GlassCard style={{ borderColor: `${GD_GREEN}33`, padding: "14px 20px" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: GD_GREEN, fontWeight: 700 }}>Why this matters: </span>
              Any user group can fork stream-templates, customise it, then point their event repo at their own fork - zero dependency on the original.
            </div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 08: Schedule Auto-Switcher ──────────────────────────────────
export const Blog08AutoSwitcher: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });

  const phases = [
    { time: "09:00", label: "PreShow", desc: "InfoLoop - rotating participant cards", color: GD_ACCENT, delay: 8 },
    { time: "10:00", label: "MainEvent", desc: "Main event screen - countdown visible", color: GD_VIOLET, delay: 14 },
    { time: "10:30", label: "Gameplay", desc: "Gameplay HUD - scores updating", color: GD_GREEN, delay: 20 },
    { time: "13:45", label: "FinalCountdown", desc: "Countdown insert overlaid on gameplay", color: GD_ORANGE, delay: 26 },
    { time: "14:00", label: "Closing", desc: "Pre-rendered winners sequence plays", color: GD_GOLD, delay: 32 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "32px 52px", gap: 16, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Auto-Switcher" color={GD_VIOLET} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            The web player reads schedule.ts and switches on its own
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Intl.DateTimeFormat with Europe/Vienna handles timezone math - no manual action on event day
          </div>
        </div>
        {/* Timeline */}
        <div style={{ display: "flex", flex: 1, gap: 0, alignItems: "stretch" }}>
          {/* Time spine */}
          <div style={{ width: 2, background: `linear-gradient(to bottom, ${GD_VIOLET}88, ${GD_GOLD}88)`, marginRight: 0, borderRadius: 2 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingLeft: 0 }}>
            {phases.map((p) => {
              const pEnter = spring({ frame: Math.max(0, frame - p.delay), fps, config: { damping: 20, mass: 0.5 } });
              return (
                <div
                  key={p.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: pEnter,
                    transform: `translateX(${interpolate(pEnter, [0, 1], [-20, 0])}px)`,
                    flex: 1,
                  }}
                >
                  {/* Dot on spine */}
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: p.color, boxShadow: `0 0 10px ${p.color}`, flexShrink: 0, marginLeft: -7 }} />
                  {/* Time */}
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, fontWeight: 700, color: p.color, minWidth: 64 }}>{p.time}</div>
                  {/* Card */}
                  <GlassCard style={{ flex: 1, borderColor: `${p.color}33`, padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Fira Code', monospace" }}>{p.label}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{p.desc}</div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ opacity: spring({ frame: Math.max(0, frame - 38), fps, config: { damping: 20, mass: 0.5 } }) }}>
          <GlassCard style={{ borderColor: `${GD_ACCENT}22`, padding: "10px 16px" }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              <span style={{ color: GD_VIOLET }}>const</span> <span style={{ color: GD_ACCENT }}>current</span> = schedule.<span style={{ color: GD_GOLD }}>find</span>(s {"->"} <span style={{ color: GD_GREEN }}>now</span> {">="}  s.<span style={{ color: GD_ORANGE }}>start</span> {"&&"} <span style={{ color: GD_GREEN }}>now</span> {"<"} s.<span style={{ color: GD_ORANGE }}>end</span>);
            </div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 09: Pre-Show InfoLoop ───────────────────────────────────────
export const Blog09InfoLoop: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(12);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Pre-Show" color={GD_ORANGE} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            InfoLoop - rotating participant cards before the game starts
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Group logos loaded from Meetup CDN URLs in config/logos.ts - country flag emoji as fallback when no logo available
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/compositions/readme-infoloop.png")}
            label="InfoLoop pre-show - participant user groups, organizers, and schedule cycling automatically"
            sublabel="Logos from Meetup CDN - flag fallback when no logo is available"
            enter={imgEnter.enter}
            accentColor={GD_ORANGE}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 10: Config Files Deep Dive ──────────────────────────────────
export const Blog10ConfigFiles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });

  const configs = [
    { file: "config/schedule.ts", desc: "Timestamps for each composition phase (pre-show, main, gameplay, closing)", color: GD_VIOLET, delay: 0 },
    { file: "config/participants.ts", desc: "User group names, Meetup CDN logo URLs, country codes, attendee counts", color: GD_ORANGE, delay: 8 },
    { file: "config/sponsors.ts", desc: "Sponsor logos and tier assignments shown in InfoLoop", color: GD_GOLD, delay: 16 },
    { file: "config/teams.ts", desc: "Team names and logo assignments for the leaderboard", color: GD_ACCENT, delay: 24 },
    { file: "config/organizers.ts", desc: "Organizer names and face photo paths shown in closing", color: GD_GREEN, delay: 32 },
    { file: "config/closing.ts", desc: "PODIUM_TEAMS - ugName must match LOGO_MAP key exactly", color: GD_RED, delay: 40 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "40px 60px", gap: 20, opacity: fadeOut }}>
        <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Config Files" color={GD_ACCENT} />
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            All event data lives in the event repo
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Stream templates has no hardcoded event data - it reads everything from these files at build time
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, alignContent: "start" }}>
          {configs.map((c) => {
            const itemEnter = spring({ frame: Math.max(0, frame - c.delay), fps, config: { damping: 20, mass: 0.5 } });
            return (
              <div key={c.file} style={{ opacity: itemEnter, transform: `translateY(${interpolate(itemEnter, [0, 1], [20, 0])}px)` }}>
                <GlassCard style={{ height: "100%", borderColor: `${c.color}33` }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: c.color, marginBottom: 6 }}>{c.file}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{c.desc}</div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 11: Insert Overview Grid ────────────────────────────────────
export const Blog11InsertGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });

  const inserts = [
    { src: "screenshots/inserts/readme-insert-quests-live.png", label: "Quests Live", color: GD_GREEN },
    { src: "screenshots/inserts/readme-insert-halftime.png", label: "Halftime", color: GD_GOLD },
    { src: "screenshots/inserts/readme-insert-leaderboard.png", label: "Leaderboard", color: GD_VIOLET },
    { src: "screenshots/inserts/readme-insert-team-spotlight.png", label: "Team Spotlight", color: GD_ORANGE },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="29 Stream Inserts" color={GD_ACCENT} />
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            30-second overlays triggered at exact moments
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            11 scheduled (time-based) + 8+ reactive (response to live failures and events) - each exactly 900 frames
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, flex: 1 }}>
          {inserts.map((ins, i) => {
            const imgEnter = spring({ frame: Math.max(0, frame - i * 6), fps, config: { damping: 22, mass: 0.5 } });
            return (
              <div
                key={ins.src}
                style={{
                  opacity: imgEnter,
                  transform: `scale(${interpolate(imgEnter, [0, 1], [0.92, 1])})`,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1.5px solid ${ins.color}44`,
                  position: "relative",
                  background: "#0c0820",
                }}
              >
                <Img
                  src={staticFile(ins.src)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(12,8,32,0.85))",
                    padding: "20px 12px 8px",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: ins.color }}>{ins.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 12: Quest Broken ────────────────────────────────────────────
export const Blog12QuestBroken: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Reactive Insert" color={GD_RED} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Quest broken - triggered live during the event
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            When a quest environment failed mid-game, this insert went live within 90 seconds. Prepared in advance, triggered on the spot.
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/inserts/readme-insert-quest-broken.png")}
            label="QuestBroken insert - communicates the issue to all teams immediately"
            sublabel="99% was prepared ahead of time - the quest environment failure was unforeseeable"
            enter={imgEnter.enter}
            accentColor={GD_RED}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 13: Quest Fixed ─────────────────────────────────────────────
export const Blog13QuestFixed: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Reactive Insert" color={GD_GREEN} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Quest fixed - keeping teams informed in real time
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            As Werner Vogels says: everything fails, all the time. Having the inserts ready made recovery fast and transparent.
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/inserts/readme-insert-quest-fixed.png")}
            label="QuestFixed insert - confirms recovery and keeps all teams in sync"
            sublabel="Reactive inserts exist because GameDay environments fail - not because of improvisation"
            enter={imgEnter.enter}
            accentColor={GD_GREEN}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 14: Leaderboard Insert ──────────────────────────────────────
export const Blog14Leaderboard: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Live Commentary Insert" color={GD_GOLD} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Leaderboard - live standings pushed to the stream
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Team scores updated via the Remotion Studio props panel - no code changes needed mid-stream
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/inserts/readme-insert-leaderboard.png")}
            label="Leaderboard insert - current standings visible to all stream viewers"
            sublabel="Parameterized via Zod schema - team names and scores injected at trigger time"
            enter={imgEnter.enter}
            accentColor={GD_GOLD}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 15: Scheduled vs Reactive Inserts ───────────────────────────
export const Blog15ScheduledVsReactive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleEnter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const leftEnter = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, mass: 0.5 } });
  const rightEnter = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, mass: 0.5 } });

  const scheduled = ["QuestsLive", "HalfTime", "FinalCountdown", "GameExtended", "LeaderboardHidden", "ScoresCalculating", "BreakAnnouncement", "WelcomeBack", "FirstCompletion", "CloseRace", "ComebackAlert"];
  const reactive = ["QuestBroken", "QuestFixed", "QuestUpdate", "QuestHint", "StreamInterruption", "TechnicalIssue", "ScoreCorrection", "GamemastersUpdate"];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "40px 60px", gap: 20, opacity: fadeOut }}>
        <div style={{ opacity: titleEnter, transform: `translateY(${interpolate(titleEnter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="29 Inserts" color={GD_ACCENT} />
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Scheduled vs reactive - two different trigger modes
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          <GlassCard style={{ flex: 1, opacity: leftEnter, transform: `translateY(${interpolate(leftEnter, [0, 1], [30, 0])}px)`, borderColor: `${GD_VIOLET}33` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: GD_VIOLET, textTransform: "uppercase" as const, marginBottom: 8 }}>
              11 Scheduled
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              Triggered at specific timestamps in schedule.ts
            </div>
            {scheduled.map((name) => (
              <div key={name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: GD_VIOLET, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'Fira Code', monospace" }}>{name}</div>
              </div>
            ))}
          </GlassCard>
          <GlassCard style={{ flex: 1, opacity: rightEnter, transform: `translateY(${interpolate(rightEnter, [0, 1], [30, 0])}px)`, borderColor: `${GD_ORANGE}33` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: GD_ORANGE, textTransform: "uppercase" as const, marginBottom: 8 }}>
              8+ Reactive
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              Triggered manually by the stream host when something breaks
            </div>
            {reactive.map((name) => (
              <div key={name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: GD_ORANGE, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'Fira Code', monospace" }}>{name}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "10px 12px", background: `${GD_ORANGE}11`, borderRadius: 8, border: `1px solid ${GD_ORANGE}33` }}>
              <div style={{ fontSize: 12, color: GD_ORANGE, fontWeight: 700, marginBottom: 3 }}>Stream host enters values live</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Team name, quest title, and message are typed into the props panel at the moment of triggering - prepared inserts, live data
              </div>
            </div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 16: Winners Reveal ──────────────────────────────────────────
export const Blog16WinnersReveal: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Closing Sequence" color={GD_GOLD} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Winners reveal - the pre-rendered closing act
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            03A-ClosingPreRendered is rendered once and played back - hero intro, fast scroll through all teams, shuffle countdown
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/compositions/readme-winners-reveal-frame-3500.png")}
            label="Winners reveal - frame 3500 of the pre-rendered closing sequence"
            sublabel="Rendered once, played back live - no live React rendering overhead during the dramatic moment"
            enter={imgEnter.enter}
            accentColor={GD_GOLD}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 17: Winners Podium ──────────────────────────────────────────
export const Blog17WinnersPodium: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const imgEnter = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 22, mass: 0.5 } });
  const codeEnter = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 14, opacity: fadeOut }}>
        <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Podium" color={GD_GOLD} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            PODIUM_TEAMS - the one thing to update before the reveal
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flex: 1, alignItems: "flex-start" }}>
          <div
            style={{
              flex: 1.3,
              opacity: imgEnter,
              transform: `scale(${interpolate(imgEnter, [0, 1], [0.94, 1])})`,
              borderRadius: 10,
              overflow: "hidden",
              border: `2px solid ${GD_GOLD}44`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              background: "#0c0820",
              position: "relative",
            }}
          >
            <Img
              src={staticFile("screenshots/compositions/readme-winners-podium-frame-7258.png")}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, opacity: codeEnter, transform: `translateX(${interpolate(codeEnter, [0, 1], [30, 0])}px)` }}>
            <CodeLine>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{`// src/utils/closing.ts`}</span>
              <br />
              <span style={{ color: GD_VIOLET }}>export const</span> <span style={{ color: GD_ACCENT }}>PODIUM_TEAMS</span> = [
              <br />
              {"  "}&#123; <span style={{ color: GD_GOLD }}>ugName</span>: <span style={{ color: "#a8ff78" }}>"AWS UG Vienna"</span>,
              <br />
              {"    "}<span style={{ color: GD_GOLD }}>place</span>: <span style={{ color: GD_ORANGE }}>1</span> &#125;,
              <br />
              {"  "}&#123; <span style={{ color: GD_GOLD }}>ugName</span>: <span style={{ color: "#a8ff78" }}>"AWS UG Berlin"</span>,
              <br />
              {"    "}<span style={{ color: GD_GOLD }}>place</span>: <span style={{ color: GD_ORANGE }}>2</span> &#125;,
              <br />
              ];
            </CodeLine>
            <GlassCard style={{ borderColor: `${GD_RED}33`, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: GD_RED, fontWeight: 700, marginBottom: 4 }}>Critical</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                ugName must match the key in LOGO_MAP exactly - one typo and the logo won't load for the winning team
              </div>
            </GlassCard>
            <GlassCard style={{ borderColor: `${GD_GREEN}33`, padding: "12px 16px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: GD_GREEN, fontWeight: 700 }}>Flag fallback: </span>
                if no Meetup CDN logo URL is available, the country flag emoji renders instead
              </div>
            </GlassCard>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 18: Flag Fallback ───────────────────────────────────────────
export const Blog18FlagFallback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const codeEnter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 20, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "48px 80px", gap: 24, opacity: fadeOut }}>
        <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Logo System" color={GD_ORANGE} />
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            Meetup CDN logo - country flag when none available
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Not every user group has a Meetup logo. The fallback ensures every group is still represented.
          </div>
        </div>
        <div style={{ opacity: codeEnter, transform: `translateY(${interpolate(codeEnter, [0, 1], [20, 0])}px)`, display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeLine>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{`// config/logos.ts in the event repo`}</span>
            <br />
            <span style={{ color: GD_VIOLET }}>export const</span> <span style={{ color: GD_ACCENT }}>LOGO_MAP</span>: Record{"<"}string, string{">"} = &#123;
            <br />
            {"  "}<span style={{ color: "#a8ff78" }}>"AWS UG Vienna"</span>: <span style={{ color: GD_GOLD }}>"https://secure.meetupstatic.com/photos/event/..."</span>,
            <br />
            {"  "}<span style={{ color: "#a8ff78" }}>"AWS UG Berlin"</span>: <span style={{ color: GD_GOLD }}>"https://secure.meetupstatic.com/photos/event/..."</span>,
            <br />
            {"  "}<span style={{ color: "rgba(255,255,255,0.4)" }}>{`// groups without a Meetup logo → omit, flag renders instead`}</span>
            <br />
            &#125;;
          </CodeLine>
          <CodeLine>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{`// Rendering logic - flag emoji as fallback`}</span>
            <br />
            <span style={{ color: GD_VIOLET }}>const</span> logo = <span style={{ color: GD_ACCENT }}>LOGO_MAP</span>[ugName];
            <br />
            <span style={{ color: GD_VIOLET }}>return</span> logo
            <br />
            {"  "}? {"<"}<span style={{ color: GD_VIOLET }}>Img</span> src=&#123;logo&#125; /{">"}
            <br />
            {"  "}: {"<"}<span style={{ color: GD_VIOLET }}>span</span>{">"}<span style={{ color: GD_GOLD }}>&#123;countryFlag&#125;</span>{"<"}/span{">"};
          </CodeLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 19: Remotion Studio Insert View ─────────────────────────────
export const Blog19StudioInsert: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Remotion Studio" color={GD_VIOLET} />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Editing and previewing inserts before the stream
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            npx remotion studio - preview every insert, adjust text, scrub frame by frame, no build step needed
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/studio/readme-remotion-studio-insert.png")}
            label="Remotion Studio showing an insert composition - scrub to any frame, edit props live"
            sublabel="All 29 inserts visible in the left panel - 30fps playback, no video encoder needed"
            enter={imgEnter.enter}
            accentColor={GD_VIOLET}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 20: Closing / Thank You ─────────────────────────────────────
export const Blog20WinnersThankyou: React.FC = () => {
  const { enter, opacity, y } = useSlideIn(0);
  const imgEnter = useSlideIn(10);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.72} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "36px 60px", gap: 16, opacity }}>
        <div style={{ opacity: enter, transform: `translateY(${y}px)` }}>
          <SectionLabel text="Closing" color={GD_PINK } />
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 8 }}>
            Thank you screen - the final frame every attendee sees
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Organizer faces, sponsor logos, and the GitHub repo link - all pulled from event repo config at build time
          </div>
        </div>
        <div style={{ flex: 1, opacity: imgEnter.enter }}>
          <ScreenshotFrame
            src={staticFile("screenshots/compositions/readme-winners-thankyou-frame-8200.png")}
            label="Thank you screen at frame 8200 - closes the winners ceremony"
            sublabel="CC BY-NC-SA 4.0 - every user group can use, fork, and customise this for their own GameDay"
            enter={imgEnter.enter}
            accentColor={GD_PINK}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION 21: How I Made These Compositions ───────────────────────────
export const Blog21HowMadeThis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [FRAMES - 90, FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  const codeEnter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 20, mass: 0.5 } });
  const footerEnter = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 20, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundLayer darken={0.78} />
      <HexGridOverlay />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "40px 72px", gap: 20, opacity: fadeOut }}>
        <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)` }}>
          <SectionLabel text="Meta" color={GD_ACCENT} />
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            How I built the blog post visuals
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            These explainer cards are themselves Remotion compositions - the same framework that ran the stream
          </div>
        </div>
        <div style={{ opacity: codeEnter, transform: `translateY(${interpolate(codeEnter, [0, 1], [20, 0])}px)` }}>
          <CodeLine>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{`// Every composition follows the same pattern:`}</span>
            <br />
            <span style={{ color: GD_VIOLET }}>const</span> frame = <span style={{ color: GD_ACCENT }}>useCurrentFrame</span>();
            <br />
            <span style={{ color: GD_VIOLET }}>const</span> enter = <span style={{ color: GD_ACCENT }}>spring</span>(&#123; frame, fps, config: &#123; damping: 22 &#125; &#125;);
            <br />
            <span style={{ color: GD_VIOLET }}>const</span> fadeOut = <span style={{ color: GD_ACCENT }}>interpolate</span>(frame, [800, 900], [1, 0]);
            <br />
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{`// Screenshots live in public/screenshots/ (symlinked from /screenshots)`}</span>
            <br />
            {"<"}<span style={{ color: GD_VIOLET }}>Img</span> src=&#123;<span style={{ color: GD_ACCENT }}>staticFile</span>(<span style={{ color: "#a8ff78" }}>"screenshots/inserts/..."</span>)&#125; /{">"};
          </CodeLine>
        </div>
        <div style={{ display: "flex", gap: 16, opacity: footerEnter }}>
          {[
            { label: "900 frames each", sub: "30 seconds at 30fps", color: GD_VIOLET },
            { label: "staticFile()", sub: "screenshots via public/ symlink", color: GD_ACCENT },
            { label: "spring() + interpolate()", sub: "smooth entry and fade-out", color: GD_GOLD },
            { label: "BackgroundLayer + GlassCard", sub: "same components as the stream", color: GD_ORANGE },
          ].map(({ label, sub, color }) => (
            <GlassCard key={label} style={{ flex: 1, borderColor: `${color}33`, padding: "14px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{sub}</div>
            </GlassCard>
          ))}
        </div>
        <div style={{ opacity: footerEnter }}>
          <GlassCard style={{ borderColor: `${GD_PURPLE}44`, padding: "14px 20px" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              <span style={{ color: GD_ACCENT, fontWeight: 700 }}>Render command: </span>
              <span style={{ fontFamily: "'Fira Code', monospace", color: GD_GOLD }}>
                npx remotion render Blog-21-HowMadeThis out/blog-howmade.mp4
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}> - or export as PNG sequence for embedding in the blog</span>
            </div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
