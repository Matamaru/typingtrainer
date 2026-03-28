import { type PropsWithChildren, useEffect, useState } from "react";

import { ensureDefaultProfile } from "../core/storage/profiles";
import { useAppStore } from "./store/app-store";

type BootstrapState = "loading" | "ready" | "error";

export function AppBootstrap({ children }: PropsWithChildren) {
  const setActiveProfile = useAppStore((state) => state.setActiveProfile);
  const [status, setStatus] = useState<BootstrapState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const profile = await ensureDefaultProfile();

        if (cancelled) {
          return;
        }

        setActiveProfile(profile);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unknown profile bootstrap error.",
        );
        setStatus("error");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setActiveProfile]);

  if (status === "loading") {
    return (
      <div className="boot-screen">
        <p className="eyebrow">typingtrainer</p>
        <h1>Preparing your local profile</h1>
        <p>Initializing the Firefox-first scaffold and loading profile storage.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="boot-screen boot-screen--error">
        <p className="eyebrow">storage error</p>
        <h1>Profile bootstrap failed</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
