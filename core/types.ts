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
        device?: Device,
        rolling?: number,
        x?: number,
        y?: number,
      }
    ): Promise<void>;
  }

  type CoreEvent = "start" | "stop" | "destroy";
  export function emit(event: CoreEvent): void;
  /** 销毁拦截器实例 */
  export function destroy(): void;
  /** 订阅销毁事件 */
  export function onDestroy(): void;
  /** 启用拦截器 */
  export function start(): void;
  /** 订阅 start 事件 */
  export function onListen(cb: () => void): void;
  /** 停用拦截器 */
  export function stop(): void;
  /** 订阅 stop 事件 */
  export function offListen(cb: () => void): void;


  /** 是否拦截中 */
  export function isListenning(): boolean;

  namespace Utils {
    /**
     * - 等待时间 | Wait time
     * @param time 等待时间 | The waiting time
     */
    function wait(time: number): Promise<void>;

    /**
     * - 等待时间 | Wait time
     * @param time 等待时间 | The waiting time
     * @param options 选项 | Options
     */
    function waitSync(time: number, options: {
      breakSignal?: boolean | ((time: number) => void);
      continueSignal?: boolean | ((time: number) => void);
      onLoop?: ((time: number) => void) | null;
    }): void;
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