import type { StoreApi, UseBoundStore } from "zustand";

declare namespace Monitor {
  interface CacheState {
    socketConnected: boolean;
    setSocketConnected: (value: boolean) => void;
  }

  type Cache = UseBoundStore<StoreApi<CacheState>>

  module Utils {
    type Toast = {
      (text: string): void;
      success: (text: string) => void;
      error: (text: string) => void;
      info: (text: string) => void;
      warn: (text: string) => void;
    }
  }
}