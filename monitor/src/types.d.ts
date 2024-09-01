import type { StoreApi, UseBoundStore } from "zustand";

declare namespace Monitor {
  interface CacheState {
    socketConnected: boolean;
    setSocketConnected: (value: boolean) => void;
  }

  type Cache = UseBoundStore<StoreApi<CacheState>>
}