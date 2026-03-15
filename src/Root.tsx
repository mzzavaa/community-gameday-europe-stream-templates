import React from "react";
import { Composition } from "remotion";
import { GameDayPreShow } from "../1-GameDayStreamPreShow";
import { GameDayMainEvent } from "../2-GameDayStreamMainEvent";
import { GameDayGameplay } from "../3-GameDayStreamGameplay";
import { GameDayClosing } from "../4-GameDayStreamClosing";
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Pre-Show: 10-min loop (play 3× for 30 min total) */}
      <Composition
        id="GameDayPreShow"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 0 }}
      />
      <Composition
        id="GameDayPreShow-Loop2"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 1 }}
      />
      <Composition
        id="GameDayPreShow-Loop3"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 2 }}
      />

      {/* 2. Main Event: 30 min live introductions */}
      <Composition
        id="GameDayMainEvent"
        component={GameDayMainEvent}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3. Gameplay: 2h muted overlay */}
      <Composition
        id="GameDayGameplay"
        component={GameDayGameplay}
        durationInFrames={216000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 4. Closing Ceremony: 30 min */}
      <Composition
        id="GameDayClosing"
        component={GameDayClosing}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

    </>
  );
};
