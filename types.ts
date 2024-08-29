import { Device, Stroke } from "node-interception";
import keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };

export declare namespace App {
  type Input = string | null | undefined;
  interface StrokeHandler {
    (device: Device, stroke: Stroke): void;
  }
  interface JitingHandler {
    (stroke: Stroke, input: Input, toggleKey?: keyof typeof keys, switchDurationKey?: keyof typeof keys): void;
  }
  interface JumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }
  interface ForwardJumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }
  interface ClickKey {
    (device: Device, key: keyof typeof keys): Promise<void>;
  }
  interface PressKey {
    (device: Device, key: keyof typeof keys, duration: number): Promise<void>;
  }
  interface MiceClick {
    (device: Device, key: keyof typeof mices): Promise<void>;
  }
  interface MicePress {
    (device: Device, key: keyof typeof mices, duration: number): Promise<void>;
  }
  interface UseKey {
    (
      key: keyof typeof keys | keyof typeof mices,
      pressDuration?: number | null,
      mode?: "down" | "up" | "clickOrPress"
    ): Promise<void>;
  }
}
