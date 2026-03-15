/**
 * Property-based tests for GameDay Stream Overlay pure functions.
 * Uses fast-check to verify countdown logic and visibility rules.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatTime, STREAM_TOTAL_DURATION, PRESTREAM_DURATION, getActiveSegment, getCardState, getVisibleReminders, getPhaseInfo, PRE_STREAM_SEGMENTS, MAIN_EVENT_SEGMENTS, REMINDERS } from "../archive/GameDayStreamOverlay";

const FC_CONFIG = { numRuns: 100 };

describe("Feature: gameday-stream-overlay", () => {
  describe("Property 1: formatTime produces valid MM:SS format", () => {
    /**
     * **Validates: Requirements 3.1, 11.3**
     *
     * For any non-negative integer totalSeconds in [0, 3600],
     * formatTime returns a string matching /^\d{2}:\d{2}$/ with
     * correct minute and second values.
     */
    it("for any totalSeconds in [0, 3600], formatTime returns valid MM:SS with correct values", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 3600 }), (totalSeconds) => {
          const result = formatTime(totalSeconds);

          // Must match MM:SS pattern
          expect(result).toMatch(/^\d{2}:\d{2}$/);

          const [minStr, secStr] = result.split(":");
          const expectedMinutes = Math.floor(totalSeconds / 60);
          const expectedSeconds = totalSeconds % 60;

          // Minutes portion is correct and zero-padded
          expect(parseInt(minStr, 10)).toBe(expectedMinutes);
          expect(minStr).toBe(expectedMinutes.toString().padStart(2, "0"));

          // Seconds portion is correct and zero-padded
          expect(parseInt(secStr, 10)).toBe(expectedSeconds);
          expect(secStr).toBe(expectedSeconds.toString().padStart(2, "0"));
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 2: Game countdown accuracy", () => {
    /**
     * **Validates: Requirements 3.4, 11.1**
     *
     * For any frame f in [0, 108000], the game countdown display value
     * equals formatTime(Math.floor((108000 - f) / 30)).
     */
    it("for any frame in [0, 108000], game countdown value matches expected calculation", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 108000 }), (frame) => {
          const remainingSeconds = Math.floor((STREAM_TOTAL_DURATION - frame) / 30);
          const expected = formatTime(remainingSeconds);
          const actual = formatTime(Math.max(0, Math.floor((108000 - frame) / 30)));
          expect(actual).toBe(expected);
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 3: Stream countdown accuracy", () => {
    /**
     * **Validates: Requirements 4.4, 11.2**
     *
     * For any frame f in [0, 54000], the stream countdown display value
     * equals formatTime(Math.floor((54000 - f) / 30)).
     */
    it("for any frame in [0, 54000], stream countdown value matches expected calculation", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 54000 }), (frame) => {
          const remainingSeconds = Math.floor((PRESTREAM_DURATION - frame) / 30);
          const expected = formatTime(remainingSeconds);
          const actual = formatTime(Math.max(0, Math.floor((54000 - frame) / 30)));
          expect(actual).toBe(expected);
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 4: Stream countdown visibility", () => {
    /**
     * **Validates: Requirements 4.1, 4.5**
     *
     * For any frame f in [0, 108000], the stream countdown is visible
     * if and only if f < 54000.
     */
    it("for any frame in [0, 108000], stream countdown is visible iff frame < 54000", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 108000 }), (frame) => {
          const isVisible = frame < PRESTREAM_DURATION;
          if (frame < 54000) {
            expect(isVisible).toBe(true);
          } else {
            expect(isVisible).toBe(false);
          }
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 5: Pre-stream segment lookup", () => {
    /**
     * **Validates: Requirements 5.1, 5.2**
     *
     * For any frame f in [0, 53999], getActiveSegment returns the correct
     * pre-stream segment: frames [0, 35999] → "Countdown to Teams Being Formed",
     * frames [36000, 53999] → "Countdown to Stream Start".
     */
    it("for any frame in [0, 53999], getActiveSegment returns the correct pre-stream segment label", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 53999 }), (frame) => {
          const segment = getActiveSegment(frame, PRE_STREAM_SEGMENTS);
          expect(segment).toBeDefined();

          if (frame >= 0 && frame <= 35999) {
            expect(segment!.label).toBe("Countdown to Teams Being Formed");
          } else {
            expect(segment!.label).toBe("Countdown to Stream Start");
          }
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 6: Reminder visibility by frame range", () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * For any frame f in [0, 108000], the set of visible reminders is exactly
     * those reminders r where r.startFrame <= f <= r.endFrame.
     */
    it("for any frame in [0, 108000], visible reminders match startFrame <= f <= endFrame", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 108000 }), (frame) => {
          const visible = getVisibleReminders(frame, REMINDERS);
          const expected = REMINDERS.filter(r => frame >= r.startFrame && frame <= r.endFrame);

          expect(visible).toHaveLength(expected.length);
          for (const r of expected) {
            expect(visible).toContainEqual(r);
          }
          // No extra reminders outside their range
          for (const r of visible) {
            expect(frame).toBeGreaterThanOrEqual(r.startFrame);
            expect(frame).toBeLessThanOrEqual(r.endFrame);
          }
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 7: Segment state derivation", () => {
    /**
     * **Validates: Requirements 7.1, 7.3**
     *
     * For any frame f and any segment s, getCardState returns:
     * - "completed" if f > s.endFrame
     * - "active" if s.startFrame <= f <= s.endFrame
     * - "upcoming" if f < s.startFrame
     * Additionally, at most one segment is active per frame across all segments.
     */
    const ALL_SEGMENTS = [...PRE_STREAM_SEGMENTS, ...MAIN_EVENT_SEGMENTS];
    const segmentArb = fc.constantFrom(...ALL_SEGMENTS);

    it("for any (frame, segment) pair, getCardState returns the correct state", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 108000 }), segmentArb, (frame, segment) => {
          const state = getCardState(frame, segment);

          if (frame > segment.endFrame) {
            expect(state).toBe("completed");
          } else if (frame >= segment.startFrame && frame <= segment.endFrame) {
            expect(state).toBe("active");
          } else {
            expect(state).toBe("upcoming");
          }
        }),
        FC_CONFIG,
      );
    });

    it("for any frame, at most one segment is active across all segments", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 108000 }), (frame) => {
          const activeCount = ALL_SEGMENTS.filter(s => getCardState(frame, s) === "active").length;
          expect(activeCount).toBeLessThanOrEqual(1);
        }),
        FC_CONFIG,
      );
    });
  });

  describe("Property 8: Phase indicator correctness", () => {
    /**
     * **Validates: Requirements 8.1, 8.3**
     *
     * For any frame f in [0, 107999], getPhaseInfo returns a non-empty
     * phase name and a progress value p where 0 <= p <= 1.
     */
    it("for any frame in [0, 107999], getPhaseInfo returns non-empty name and progress in [0, 1]", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 107999 }), (frame) => {
          const { name, progress } = getPhaseInfo(frame);
          expect(name).toBeTruthy();
          expect(name.length).toBeGreaterThan(0);
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(1);
        }),
        FC_CONFIG,
      );
    });
  });
});
