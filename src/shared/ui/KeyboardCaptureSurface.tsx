import {
  forwardRef,
  type KeyboardEventHandler,
  type PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type KeyboardCaptureSurfaceProps = PropsWithChildren<{
  autoFocus?: boolean;
  className?: string;
  ariaLabel: string;
  shortcutHint?: string;
  onCaptureBlur?: () => void;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyUp: KeyboardEventHandler<HTMLTextAreaElement>;
}>;

export const KeyboardCaptureSurface = forwardRef<
  HTMLTextAreaElement,
  KeyboardCaptureSurfaceProps
>(function KeyboardCaptureSurface(
  {
    autoFocus = false,
    className,
    ariaLabel,
    children,
    shortcutHint = "Alt+Shift+T",
    onCaptureBlur,
    onKeyDown,
    onKeyUp,
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLTextAreaElement, []);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleWindowBlur() {
      inputRef.current?.blur();
    }

    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const surfaceClassName = className
    ? `capture-surface ${className}${isFocused ? " capture-surface--focused" : ""}`
    : `capture-surface${isFocused ? " capture-surface--focused" : ""}`;

  return (
    <div
      className={surfaceClassName}
      onMouseDown={() => {
        inputRef.current?.focus();
      }}
    >
      <textarea
        ref={inputRef}
        aria-label={ariaLabel}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="capture-surface__input"
        data-keyboard-capture="true"
        spellCheck={false}
        onBlur={() => {
          setIsFocused(false);
          onCaptureBlur?.();
        }}
        onChange={(event) => {
          event.currentTarget.value = "";
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
      <div className="capture-surface__content">
        {children}
        <p className="capture-surface__status" role="status" aria-live="polite">
          {isFocused
            ? "Capture ready. Browser and app shortcuts still pass through."
            : `Capture paused. Click here or press ${shortcutHint} to resume.`}
        </p>
      </div>
    </div>
  );
});
