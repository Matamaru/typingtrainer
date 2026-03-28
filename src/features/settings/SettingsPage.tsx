import { useState } from "react";

import { useAppStore } from "../../app/store/app-store";
import type { PracticeStrictness } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";
import { updateProfilePreferences } from "../../core/storage/profiles";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsPage() {
  const profile = useAppStore((state) => state.activeProfile);
  const setActiveProfile = useAppStore((state) => state.setActiveProfile);
  const patchPreferences = useAppStore((state) => state.patchPreferences);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  async function persistPreferences(
    patch: Parameters<typeof patchPreferences>[0],
  ) {
    if (!profile) {
      return;
    }

    patchPreferences(patch);
    setSaveState("saving");

    const updated = await updateProfilePreferences(profile.id, patch);

    if (!updated) {
      setSaveState("error");
      return;
    }

    setActiveProfile(updated);
    setSaveState("saved");
  }

  async function handleStrictnessChange(event: React.ChangeEvent<HTMLSelectElement>) {
    await persistPreferences({
      strictness: event.target.value as PracticeStrictness,
    });
  }

  async function handleFingerGuideToggle(event: React.ChangeEvent<HTMLInputElement>) {
    await persistPreferences({
      showFingerGuides: event.target.checked,
    });
  }

  return (
    <div className="page-grid">
      <PageSection eyebrow="settings" title="Technique defaults">
        <p>
          These settings already persist to the local profile database. That keeps the app local
          and browser-first while still allowing multiple named profiles later.
        </p>

        <label className="field">
          <span>Practice strictness</span>
          <select
            value={profile?.preferences.strictness ?? "strict"}
            onChange={handleStrictnessChange}
          >
            <option value="strict">Strict</option>
            <option value="guided">Guided</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </label>

        <label className="field field--checkbox">
          <input
            checked={profile?.preferences.showFingerGuides ?? true}
            type="checkbox"
            onChange={handleFingerGuideToggle}
          />
          <span>Show finger guidance overlays</span>
        </label>

        <p className="status-line">
          Save state: <strong>{saveState}</strong>
        </p>
      </PageSection>
    </div>
  );
}
