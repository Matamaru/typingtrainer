import { useEffect, useRef, useState } from "react";

import { useAppStore } from "../../app/store/app-store";
import type { PracticeStrictness, Profile } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";
import {
  buildLocalBackup,
  getBackupFilename,
  importLocalBackup,
  serializeLocalBackup,
} from "../../core/storage/backup";
import {
  createProfile,
  listProfiles,
  renameProfile,
  updateProfilePreferences,
} from "../../core/storage/profiles";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsPage() {
  const profile = useAppStore((state) => state.activeProfile);
  const setActiveProfile = useAppStore((state) => state.setActiveProfile);
  const patchPreferences = useAppStore((state) => state.patchPreferences);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [preferenceSaveState, setPreferenceSaveState] = useState<SaveState>("idle");
  const [profileSaveState, setProfileSaveState] = useState<SaveState>("idle");
  const [backupSaveState, setBackupSaveState] = useState<SaveState>("idle");
  const [renameValue, setRenameValue] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [backupMessage, setBackupMessage] = useState(
    "Export all local profiles and session history as a versioned JSON backup.",
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setRenameValue(profile.name);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      const storedProfiles = await listProfiles();

      if (!cancelled) {
        setProfiles(storedProfiles);
      }
    }

    void loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.updatedAt]);

  async function persistPreferences(
    patch: Parameters<typeof patchPreferences>[0],
  ) {
    if (!profile) {
      return;
    }

    patchPreferences(patch);
    setPreferenceSaveState("saving");

    const updated = await updateProfilePreferences(profile.id, patch);

    if (!updated) {
      setPreferenceSaveState("error");
      return;
    }

    setActiveProfile(updated);
    setPreferenceSaveState("saved");
  }

  async function refreshProfiles(nextActiveProfile?: Profile) {
    const storedProfiles = await listProfiles();
    setProfiles(storedProfiles);

    if (!nextActiveProfile || nextActiveProfile.id === profile?.id) {
      return;
    }

    setActiveProfile(nextActiveProfile);
  }

  async function handleActiveProfileChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedProfile = profiles.find((entry) => entry.id === event.target.value);

    if (!selectedProfile) {
      return;
    }

    setProfileSaveState("saving");
    setActiveProfile(selectedProfile);
    setProfileSaveState("saved");
  }

  async function handleRenameProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setProfileSaveState("saving");

    const updated = await renameProfile(profile.id, renameValue);

    if (!updated) {
      setProfileSaveState("error");
      return;
    }

    setActiveProfile(updated);
    await refreshProfiles(updated);
    setProfileSaveState("saved");
  }

  async function handleCreateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfileSaveState("saving");

    const created = await createProfile(newProfileName);

    setNewProfileName("");
    setActiveProfile(created);
    await refreshProfiles(created);
    setProfileSaveState("saved");
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

  async function handleExportBackup() {
    setBackupSaveState("saving");

    try {
      const backup = await buildLocalBackup();
      const blob = new Blob([serializeLocalBackup(backup)], { type: "application/json" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = getBackupFilename(new Date(backup.exportedAt));
      document.body.append(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 0);

      setBackupMessage(
        `Exported ${backup.profiles.length} profiles and ${backup.sessionSummaries.length} session summaries.`,
      );
      setBackupSaveState("saved");
    } catch (error) {
      setBackupMessage(
        error instanceof Error ? error.message : "Failed to export the local backup.",
      );
      setBackupSaveState("error");
    }
  }

  async function handleImportBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const backupFile = event.target.files?.[0];

    if (!backupFile) {
      return;
    }

    setBackupSaveState("saving");

    try {
      const raw = await backupFile.text();
      const result = await importLocalBackup(raw);
      const refreshedProfiles = await listProfiles();
      const nextActiveProfile =
        refreshedProfiles.find((entry) => entry.id === result.activeProfileId) ??
        refreshedProfiles.find((entry) => entry.id === profile?.id) ??
        refreshedProfiles[0] ??
        null;

      setProfiles(refreshedProfiles);

      if (nextActiveProfile) {
        setActiveProfile(nextActiveProfile);
      }

      setBackupMessage(
        `Imported ${result.profilesImported} profiles and ${result.sessionSummariesImported} session summaries.`,
      );
      setBackupSaveState("saved");
    } catch (error) {
      setBackupMessage(
        error instanceof Error ? error.message : "Failed to import the backup file.",
      );
      setBackupSaveState("error");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="page-grid">
      <PageSection eyebrow="settings" title="Technique defaults">
        <p>
          These settings persist to the local profile database so each profile can keep its own
          strictness and finger-guide defaults.
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
          Save state: <strong>{preferenceSaveState}</strong>
        </p>
      </PageSection>

      <PageSection eyebrow="profiles" title="Profile management">
        <p>
          Profiles stay local to this browser. You can switch, rename, or create profiles without
          introducing accounts or backend state.
        </p>

        <label className="field">
          <span>Active profile</span>
          <select value={profile?.id ?? ""} onChange={handleActiveProfileChange}>
            {profiles.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>

        <form className="settings-form" onSubmit={handleRenameProfile}>
          <label className="field">
            <span>Rename current profile</span>
            <input
              type="text"
              value={renameValue}
              onChange={(event) => {
                setRenameValue(event.target.value);
              }}
            />
          </label>

          <button className="panel-button" type="submit">
            Save profile name
          </button>
        </form>

        <form className="settings-form" onSubmit={handleCreateProfile}>
          <label className="field">
            <span>Create a new local profile</span>
            <input
              type="text"
              placeholder="New profile"
              value={newProfileName}
              onChange={(event) => {
                setNewProfileName(event.target.value);
              }}
            />
          </label>

          <button className="panel-button" type="submit">
            Create and switch
          </button>
        </form>

        <p className="status-line">
          Profile state: <strong>{profileSaveState}</strong>
        </p>
      </PageSection>

      <PageSection eyebrow="backup" title="Local backup">
        <p>
          Export a full local snapshot or import a previous backup. Imports merge by record id so
          local data stays intact unless the backup contains newer versions of the same entries.
        </p>

        <div className="button-row">
          <button className="panel-button" type="button" onClick={handleExportBackup}>
            Export local backup
          </button>
          <button
            className="panel-button"
            type="button"
            onClick={() => {
              importInputRef.current?.click();
            }}
          >
            Import backup
          </button>
        </div>

        <input
          ref={importInputRef}
          className="visually-hidden"
          type="file"
          accept="application/json"
          aria-label="Import backup file"
          onChange={handleImportBackup}
        />

        <p className="status-line">
          Backup state: <strong>{backupSaveState}</strong>
        </p>
        <p className="status-line">{backupMessage}</p>
      </PageSection>
    </div>
  );
}
