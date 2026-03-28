import { NavLink, Outlet } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";

const navigationItems = [
  { to: "/", label: "Dashboard" },
  { to: "/lessons", label: "Lessons" },
  { to: "/practice/adaptive", label: "Adaptive" },
  { to: "/practice/free", label: "Free Practice" },
  { to: "/coding", label: "Coding" },
  { to: "/stats", label: "Stats" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const profile = useAppStore((state) => state.activeProfile);

  return (
    <div className="app-shell">
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
              className={({ isActive }) =>
                isActive ? "nav-list__item nav-list__item--active" : "nav-list__item"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <p className="eyebrow">active profile</p>
          <strong>{profile?.name ?? "Loading..."}</strong>
          <span>Strictness: {profile?.preferences.strictness ?? "strict"}</span>
          <span>
            Finger guides: {profile?.preferences.showFingerGuides ? "visible" : "hidden"}
          </span>
        </div>
      </aside>

      <div className="app-shell__content">
        <Outlet />
      </div>
    </div>
  );
}
