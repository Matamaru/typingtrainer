import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import type { Profile } from "../types/domain";
import { listProfiles } from "../../core/storage/profiles";
import { shouldIgnoreEditableTargetForGlobalShortcut } from "../lib/keyboard";

const navigationItems = [
  { to: "/", label: "Dashboard", shortcutCode: "Digit1", shortcutLabel: "Alt+Shift+1" },
  { to: "/lessons", label: "Lessons", shortcutCode: "Digit2", shortcutLabel: "Alt+Shift+2" },
  {
    to: "/practice/adaptive",
    label: "Adaptive",
    shortcutCode: "Digit3",
    shortcutLabel: "Alt+Shift+3",
  },
  {
    to: "/practice/free",
    label: "Free Practice",
    shortcutCode: "Digit4",
    shortcutLabel: "Alt+Shift+4",
  },
  {
    to: "/practice/shortcuts",
    label: "Shortcuts",
    shortcutCode: "Digit5",
    shortcutLabel: "Alt+Shift+5",
  },
  { to: "/coding", label: "Coding", shortcutCode: "Digit6", shortcutLabel: "Alt+Shift+6" },
  { to: "/stats", label: "Stats", shortcutCode: "Digit7", shortcutLabel: "Alt+Shift+7" },
  {
    to: "/settings",
    label: "Settings",
    shortcutCode: "Digit8",
    shortcutLabel: "Alt+Shift+8",
  },
];

export function AppShell() {
  const profile = useAppStore((state) => state.activeProfile);
  const setActiveProfile = useAppStore((state) => state.setActiveProfile);
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        shouldIgnoreEditableTargetForGlobalShortcut(event.target)
      ) {
        return;
      }

      const matchedItem = navigationItems.find((item) => item.shortcutCode === event.code);

      if (!matchedItem) {
        return;
      }

      event.preventDefault();
      navigate(matchedItem.to);

      window.requestAnimationFrame(() => {
        mainContentRef.current?.focus();
      });
    }

    window.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, [navigate]);

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

  return (
    <div className="app-shell">
      <button
        className="skip-button"
        type="button"
        onClick={() => {
          mainContentRef.current?.focus();
        }}
      >
        Skip to content
      </button>

      <aside className="app-shell__sidebar">
        <div className="brand-block">
          <p className="eyebrow">local-first qwerty trainer</p>
          <h1>typingtrainer</h1>
          <p className="brand-block__copy">
            Accuracy, fingering, and muscle memory first. Speed follows later.
          </p>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-keyshortcuts={item.shortcutLabel}
              className={({ isActive }) =>
                isActive ? "nav-list__item nav-list__item--active" : "nav-list__item"
              }
            >
              <span>{item.label}</span>
              <span className="nav-list__shortcut">{item.shortcutLabel}</span>
            </NavLink>
          ))}
        </nav>

        <div className="shortcut-card">
          <p className="eyebrow">keyboard navigation</p>
          <ul className="shortcut-list">
            <li>
              <kbd>Tab</kbd>
              <span>Move between controls</span>
            </li>
            <li>
              <kbd>Enter</kbd>
              <span>Activate the focused link or button</span>
            </li>
            <li>
              <kbd>Esc</kbd>
              <span>Leave a typing capture surface</span>
            </li>
            <li>
              <kbd>Alt+Shift+1-8</kbd>
              <span>Jump directly between main pages</span>
            </li>
          </ul>
        </div>

        <div className="profile-card">
          <p className="eyebrow">active profile</p>
          <strong>{profile?.name ?? "Loading..."}</strong>
          <label className="field field--inverse">
            <span>Switch local profile</span>
            <select
              value={profile?.id ?? ""}
              onChange={(event) => {
                const selectedProfile = profiles.find((entry) => entry.id === event.target.value);

                if (selectedProfile) {
                  setActiveProfile(selectedProfile);
                }
              }}
            >
              {profiles.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <span>Strictness: {profile?.preferences.strictness ?? "strict"}</span>
          <span>
            Finger guides: {profile?.preferences.showFingerGuides ? "visible" : "hidden"}
          </span>
        </div>
      </aside>

      <div ref={mainContentRef} className="app-shell__content" tabIndex={-1}>
        <Outlet />
      </div>
    </div>
  );
}
