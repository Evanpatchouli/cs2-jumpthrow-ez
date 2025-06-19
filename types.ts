import { Stroke } from "node-interception";
import keys from "./core/key_codes.json" assert { type: "json" };

export declare namespace App {
  type Input = string | null | undefined;
  interface JumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }
  interface ForwardJumpThrowHandler {
    (stroke: Stroke, input: Input, key?: keyof typeof keys): void;
  }

  class State {
    readonly pressDuration: 40;
  }
}
