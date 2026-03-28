import { create } from "zustand";

import { storeActiveProfileId } from "../../core/storage/profiles";
import type { Profile, ProfilePreferences } from "../../shared/types/domain";

type AppState = {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  patchPreferences: (patch: Partial<ProfilePreferences>) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeProfile: null,
  setActiveProfile: (profile) => {
    storeActiveProfileId(profile.id);
    set({ activeProfile: profile });
  },
  patchPreferences: (patch) =>
    set((state) => {
      if (!state.activeProfile) {
        return state;
      }

      return {
        activeProfile: {
          ...state.activeProfile,
          updatedAt: new Date().toISOString(),
          preferences: {
            ...state.activeProfile.preferences,
            ...patch,
          },
        },
      };
    }),
}));
