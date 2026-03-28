import type { KeystrokePhase } from "../../shared/types/domain";

export type KeyboardEventLike = {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  key: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  timeStamp: number;
  type: KeystrokePhase;
};
