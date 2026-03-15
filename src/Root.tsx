import React from "react";
import { Composition } from "remotion";
import { GameDayPreShow } from "../compositions/00-GameDayStreamPreShow-Muted";
import { GameDayMainEvent } from "../compositions/01-GameDayStreamMainEvent-Audio";
import { GameDayGameplay } from "../compositions/02-GameDayStreamGameplay-Muted";
import {
  GameDayClosingCountdown,
} from "../compositions/03a-ClosingFixed";
import { GameDayClosingWinners } from "../compositions/03b-ClosingWinners";
import { OrganizersMarketingVideo } from "../compositions/OrganizersMarketingVideo";
import { GameDayPreShowInfo } from "../compositions/04-GameDayStreamPreShowInfo-Muted";
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 0. Pre-Show (Muted): 10-min loop — web player handles looping */}
      <Composition
        id="GameDayPreShow"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 0 }}
      />

      {/* 1. Main Event (Audio): 30 min live introductions */}
      <Composition
        id="GameDayMainEvent"
        component={GameDayMainEvent}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 2. Gameplay (Muted): 2h muted overlay */}
      <Composition
        id="GameDayGameplay"
        component={GameDayGameplay}
        durationInFrames={216000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3. Closing Countdown (Part A): HeroIntro + FastScroll + Shuffle + Winners Teaser — pre-rendered */}
      <Composition
        id="GameDayClosingCountdown"
        component={GameDayClosingCountdown}
        durationInFrames={4200}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3a. Closing Winners (Part B): Shuffle + Reveal/Podium + ThankYou — updated live during stream */}
      <Composition
        id="GameDayClosingWinners"
        component={GameDayClosingWinners}
        durationInFrames={9000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 4. Organizers Marketing Video: standalone 15s social media clip */}
      <Composition
        id="OrganizersMarketingVideo"
        component={OrganizersMarketingVideo}
        durationInFrames={640}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 5. Pre-Show Info Loop (Muted): 30 min with rotating content sections */}
      <Composition
        id="GameDayPreShowInfo"
        component={GameDayPreShowInfo}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

    </>
  );
};
