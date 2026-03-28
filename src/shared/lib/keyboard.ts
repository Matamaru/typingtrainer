type KeyboardCaptureCandidate = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  getModifierState?: (key: "AltGraph") => boolean;
};

const navigationKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
  "Delete",
  "CapsLock",
  "ContextMenu",
  "Pause",
  "PrintScreen",
  "ScrollLock",
  "NumLock",
]);

export function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

export function isKeyboardCaptureTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.dataset.keyboardCapture === "true";
}

export function shouldReleaseKeyboardCapture(key: string) {
  return key === "Tab" || key === "Escape";
}

export function shouldIgnoreEditableTargetForGlobalShortcut(target: EventTarget | null) {
  return isEditableKeyboardTarget(target) && !isKeyboardCaptureTarget(target);
}

export function shouldBypassKeyboardCapture(event: KeyboardCaptureCandidate) {
  if (event.ctrlKey || event.metaKey) {
    return true;
  }

  if (event.altKey && !event.getModifierState?.("AltGraph")) {
    return true;
  }

  if (/^F\d{1,2}$/u.test(event.key)) {
    return true;
  }

  return navigationKeys.has(event.key);
}
