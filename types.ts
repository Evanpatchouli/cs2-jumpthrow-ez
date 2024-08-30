import { Device, Stroke } from "node-interception";
import keys from "./core/key_codes.json" assert { type: "json" };
import mices from "./core/mouse_codes.json" assert { type: "json" };

export declare namespace App {
  type Input = string | null | undefined;
  interface JitingHandler {
    (stroke: Stroke, input: Input, toggleKey?: keyof typeof keys, switchDurationKey?: keyof typeof keys): void;
  }
  interface JumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }
  interface ForwardJumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }

  class State {
    /** 是否启用急停 */
    readonly useJiting: boolean;
    SET_JITING(value: boolean): void;
    /** 鼠标和键盘的默认按击时长 */
    readonly pressDuration: 40;
    /** 是否根据按键按下时长计算急停键程 */
    readonly useJTDurationCalc: boolean;
    calcJTDuration(start: DOMHighResTimeStamp): number;
    /** 是否启用急停键程计算 */
    SET_USE_JT_DURATION_CALC(value: boolean): void;
    readonly JTMinDuration: 20; // 急停最小按击时长
    /** 最大急停键程 */
    readonly JTMaxDuration: 100; // 急停最大按击时长
    readonly JTDurations: [40, 80, 100]; // 急停按击键盘时长（键程）
    readonly JTDurationIdx: number;
    /** 急停的键程短适用于低速移动急停，键程长适用于高速移动急停 */
    JTDuration<IDX extends number = 0 | 1 | 2>(idx?: IDX): State['JTDurations'][IDX];
    /** 切换急停键程 */
    switchJTDuration(): void;
  }
}
