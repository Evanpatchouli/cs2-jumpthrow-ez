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

  class State {
    /** 是否启用急停 */
    useJiting: boolean;
    SET_JITING(value: boolean): void;
    listening: boolean;
    /**
     * SET_LISTENING
     */
    SET_LISTENING(value: boolean): void;
    /** 所有手动激活的键*/
    private keyState: {
      [key: string]: {
        active: boolean;
        firstActive: number;
      };
    };
    getKeyState(key: string): State['keyState'][string];
    setActiveKey(key: string): void;
    removeActiveKey(key: string): void;
    /** 询问某键是否处于激活状态 */
    isKeyActive(key: string): boolean;
    /** 鼠标和键盘的默认按击时长 */
    pressDuration: 40;
    JTDurations: [50, 80, 100]; // 急停按击键盘时长（键程）
    JTDurationIdx: number;
    /** 急停的键程短适用于低速移动急停，键程长适用于高速移动急停 */
    JTDuration<IDX extends number = 0 | 1 | 2>(idx?: IDX): State['JTDurations'][IDX];
    /** 切换急停键程 */
    switchJTDuration(): void;
  }
  /**
 * 计算两个 performance.now() 之间以毫秒为单位的时间差
 * @returns {number} 时间差（毫秒）
 */
  interface getMSDistance {
    (start: DOMHighResTimeStamp, end: DOMHighResTimeStamp, toFix?: number): number;
  }
}
