import { Device, Stroke } from "node-interception";
import Keys from "./key_codes.json" assert { type: "json" };
import mices from "./mouse_codes.json" assert { type: "json" };

export declare namespace Core {
  export class State {
    readonly listening: boolean;
    /**
     * SET_LISTENING
     */
    SET_LISTENING(value: boolean): void;
    /** 所有键的状态*/
    private keyState: {
      [key: string]: {
        active: boolean;
        firstActive: number;
      };
    };
    getKeyState(key: string): State['keyState'][string];
    setActiveKey(key: string): void;
    removeActiveKey(key: string): void;
    /**
     * 先判断是否已经激活，否则不操作
     */
    clearActiveKey(key: string): void;
    /** 询问某键是否处于激活状态 */
    isKeyActive(key: string): boolean;
    /** 询问某些键是否处于激活状态，可用于判断组合键 */
    areKeysActive(keys: string[]): boolean;
    noneKeysActive(keys: string[]): boolean;
    someKeysActive(keys: string[]): boolean;
    onListen: () => void;
    offListen: () => void;
  }

  export function subscribe(
    keys: (keyof typeof Keys)[],
    handler: () => any
  ): void;

  export function listen(
    listened: 'keyboard' | 'mouse' | 'all',
    handler: {
      before: typeof StrokeHandler,
      after: typeof StrokeHandler,
    },
  ): Promise<void>;

  type Input = string | null | undefined;

  function StrokeHandler(
    stroke: Stroke,
    input: Input,
    key: keyof typeof Keys,
    device: Device
  ): Promise<void>;

  interface ClickKey {
    (device: Device, key: keyof typeof Keys): Promise<void>;
  }
  interface PressKey {
    (device: Device, key: keyof typeof Keys, duration: number): Promise<void>;
  }
  interface UpKey {
    (device: Device, key: keyof typeof Keys): Promise<void>;
  }
  interface DownKey {
    (device: Device, key: keyof typeof Keys): Promise<void>;
  }
  interface MiceClick {
    (device: Device, key: keyof typeof mices): Promise<void>;
  }
  interface MicePress {
    (device: Device, key: keyof typeof mices, duration: number): Promise<void>;
  }
  interface MiceMove {
    (device: Device, delta: { x?: number, y?: number }): void;
  }
  interface MiceRoll {
    (device: Device, rolling?: number): void;
  }
  interface MiceWheelDown {
    (device: Device, rolling?: number): void;
  }
  interface MiceWheelUp {
    (device: Device, rolling?: number): void;
  }
  interface UseKey {
    (
      key: keyof typeof Keys | keyof typeof mices,
      options?: {
        pressDuration?: number | null,
        mode?: "down" | "up" | "clickOrPress"
        device?: Device
      }
    ): Promise<void>;
  }

  namespace Utils {
    /**
     * - 等待时间 | Wait time
     * @param time 等待时间 | The waiting time
     */
    function wait(time: number): Promise<void>;
    /** 
     * - 基于 performance.now() 的时间戳差 | The timestamp difference based on performance.now()
     * @param start 开始时间 | The start time
     * @param end 结束时间 | The end time
     * @param toFix 保留小数位数 | The number of decimal places to keep
     * @returns 时间戳差 (ms) | Timestamp difference (ms)
     *  */
    function getMSDistance(
      start: DOMHighResTimeStamp,
      end: DOMHighResTimeStamp,
      toFix?: number
    ): number;
  }
}