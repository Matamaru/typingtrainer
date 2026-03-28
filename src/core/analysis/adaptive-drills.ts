import type {
  FingerZone,
  FingerZoneCount,
  KeyCount,
  KeySubstitutionCount,
  Lesson,
  Prompt,
  SessionSummary,
} from "../../shared/types/domain";

type AdaptiveFocusType = "shift-side" | "timing" | "key" | "finger-zone" | "symbols" | "code-syntax";

type AccuracyEntry = {
  label: string;
  count: number;
  mistakes: number;
  accuracy: number;
  code?: string;
  fingerZone?: FingerZone;
};

type AdaptiveFocusBlock = {
  type: AdaptiveFocusType;
  title: string;
  reason: string;
  prompts: Prompt[];
  tags: string[];
};

export type AdaptiveLessonPlan = {
  lesson: Lesson;
  blocks: AdaptiveFocusBlock[];
  overview: {
    shiftSideErrors: number;
    likelyWrongFingerCount: number;
    timingHesitationCount: number;
  };
};

const fingerZonePromptSets: Record<FingerZone, string[]> = {
  "left-pinky": ["aqa zaq qaz", "a q z a q z", "1qaz 1qaz 1qaz"],
  "left-ring": ["wsw xsw wsx", "s w x s w x", "sws xsw sws"],
  "left-middle": ["ede cde dec", "d e c d e c", "ded cde ded"],
  "left-index": ["rfr vfr frv", "g t f r g t", "vfr frv rfg"],
  "left-thumb": ["a a a a", "tap the space bar calmly", "space space space"],
  "right-thumb": ["space space space", "hold rhythm with calm spaces", "space then continue"],
  "right-index": ["huj nju jun", "h j u n h j", "jhn ujn jnh"],
  "right-middle": ["iki ,ki ik,", "k i comma k i", "iki kik iki"],
  "right-ring": ["olo .lo ol.", "l o period l o", "olo lol olo"],
  "right-pinky": ["p;p /p; p/;", "p [ ] p ;", "; p / ; p /"],
};

const symbolPromptSets: Record<string, string[]> = {
  "`": ["`cache_key`", "`tick` then rest", "value = `ready`"],
  "!": ["ready != false", "if (!ready) { retry(); }", "warn! then wait!"],
  "@": ["user@example.com", "@timer.wrap", "notify @ops now"],
  "#": ["#define READY 1", "# state header", "count #1 stays ready"],
  "$": ["total_cost += $5", "$value stays visible", "cost_$ = total_$ + fee_$"],
  "%": ["value % 2 == 0", "progress = 95%", "ratio % limit"],
  "^": ["flags ^= READY_MASK;", "a ^ b ^ c", "xor ^ keeps changing"],
  "&": ["ready && retries > 0", "mask &= READY_MASK;", "left & right & center"],
  "*": ["ptr = base_ptr + 1", "value * scale_factor", "count * 4 == total"],
  ";": ["count++; state++;", "ready = state; flag = on;", "if (ready) { start(); }"],
  "[": ["buffer[index] = value;", "flags[0] = flags[1];", "items[index + 1] = next;"],
  "]": ["buffer[index] = value;", "flags[0] = flags[1];", "items[index + 1] = next;"],
  "=": ["value = state + 1;", "ready = left == right;", "mask = base | flag;"],
  "-": ["count -= 1;", "next_state = prev_state - 1;", "ready -> value // stay calm"],
  "_": ["sensor_ready_flag", "frame_count_ms", "A_B == C_D"],
  "+": ["count += 1;", "sum = left + right;", "base + step + offset"],
  "\\": ["path\\to\\file", "log\\trace\\now", "ready\\set\\go"],
  "/": ["path/to/file", "count / total", "index / stride"],
  ",": ["left, right, center", "Pin(15, Pin.IN, Pin.PULL_UP)", "x, y, z"],
  ".": ["value.count", "ready.then", "module.name"],
  ":": ["def read_pin() -> bool:", "case 1: break;", "time: 12:30"],
  "'": ["'a' 'b' 'c'", "state = 'on';", "char c = 'x';"],
  "\"": ['"quoted text"', 'printf("ready");', '"calm symbols"'],
  "<": ["count < limit", "value <= max_value", "left << 1"],
  ">": ["count > 0", "value >= min_value", "right >> 1"],
  "?": ["ready ? start : wait", "state? yes : no", "path/to/file?debug=1"],
  "|": ["mask | READY_FLAG", "left | right | center", "cmd1 | cmd2"],
  "~": ["~ready_mask", "tilde ~ then rest", "mask = ~ready_mask"],
  "(": ["if (ready) { start(); }", "wait_for_frame(sync_count);", "value = read_pin(state);"],
  ")": ["if (ready) { start(); }", "wait_for_frame(sync_count);", "value = read_pin(state);"],
  "{": ["while (ready) { tick(); }", "if (error) { reset(); }", "for (;;) { poll(); }"],
  "}": ["while (ready) { tick(); }", "if (error) { reset(); }", "for (;;) { poll(); }"],
};

const fingerZoneAnchorKeys: Record<FingerZone, string[]> = {
  "left-pinky": ["a", "q", "z"],
  "left-ring": ["s", "w", "x"],
  "left-middle": ["d", "e", "c"],
  "left-index": ["f", "r", "v"],
  "left-thumb": ["a", "s", "d"],
  "right-thumb": ["j", "k", "l"],
  "right-index": ["j", "u", "n"],
  "right-middle": ["k", "i", ","],
  "right-ring": ["l", "o", "."],
  "right-pinky": ["p", ";", "/"],
};

function rotate<T>(items: T[], seed: number) {
  if (items.length === 0) {
    return items;
  }

  const offset = seed % items.length;

  return [...items.slice(offset), ...items.slice(0, offset)];
}

function aggregateKeyCounts(entries: KeyCount[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const entry of entries) {
    const current = counts.get(entry.code);

    counts.set(entry.code, {
      label: entry.label,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return counts;
}

function aggregateFingerZoneCounts(entries: FingerZoneCount[]) {
  const counts = new Map<FingerZone, number>();

  for (const entry of entries) {
    counts.set(entry.fingerZone, (counts.get(entry.fingerZone) ?? 0) + entry.count);
  }

  return counts;
}

function buildAccuracyEntries(
  expectedCounts: Map<string, { label: string; count: number }>,
  mistakeCounts: Map<string, number>,
) {
  return [...expectedCounts.entries()]
    .map(([code, expected]) => {
      const mistakes = mistakeCounts.get(code) ?? 0;
      const accuracy = expected.count === 0 ? 100 : ((expected.count - mistakes) / expected.count) * 100;

      return {
        code,
        label: expected.label,
        count: expected.count,
        mistakes,
        accuracy,
      } satisfies AccuracyEntry;
    })
    .filter((entry) => entry.mistakes > 0)
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.mistakes - left.mistakes;
    });
}

function buildFingerZoneAccuracyEntries(
  expectedCounts: Map<FingerZone, number>,
  mistakeCounts: Map<FingerZone, number>,
) {
  return [...expectedCounts.entries()]
    .map(([fingerZone, expected]) => {
      const mistakes = mistakeCounts.get(fingerZone) ?? 0;
      const accuracy = expected === 0 ? 100 : ((expected - mistakes) / expected) * 100;

      return {
        label: fingerZone,
        fingerZone,
        count: expected,
        mistakes,
        accuracy,
      } satisfies AccuracyEntry;
    })
    .filter((entry) => entry.mistakes > 0)
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.mistakes - left.mistakes;
    });
}

function buildPromptBlock(prefix: string, prompts: string[]) {
  return prompts.map((text, index) => ({
    id: `${prefix}-${index + 1}`,
    text,
  }));
}

function aggregateSubstitutionCounts(entries: KeySubstitutionCount[]) {
  const counts = new Map<
    string,
    { expectedCode: string; expectedLabel: string; actualCode: string; actualLabel: string; count: number }
  >();

  for (const entry of entries) {
    const key = `${entry.expectedCode}->${entry.actualCode}`;
    const current = counts.get(key);

    counts.set(key, {
      expectedCode: entry.expectedCode,
      expectedLabel: entry.expectedLabel,
      actualCode: entry.actualCode,
      actualLabel: entry.actualLabel,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return [...counts.values()].sort((left, right) => right.count - left.count);
}

function buildShiftFocusBlock(seed: number): AdaptiveFocusBlock {
  const prompts = rotate(
    [
      "Ada asks Sam to stay calm.",
      "Calm Hands Build Clear Control.",
      "Make Clean Lines, Not Rushed Errors.",
    ],
    seed,
  );

  return {
    type: "shift-side",
    title: "Shift-side discipline",
    reason: "Recent sessions show modifier-side mistakes, so this block reinforces calm opposite-hand Shift use.",
    prompts: buildPromptBlock("adaptive-shift", prompts),
    tags: ["shift-side", "capitalization", "technique"],
  };
}

function buildTimingFocusBlock(key: AccuracyEntry | undefined, seed: number): AdaptiveFocusBlock {
  const label = key?.label ?? "home row";
  const lower = label.toLowerCase();
  const prompts =
    /^[a-z]$/i.test(label)
      ? rotate(
          [
            `${lower} ${lower} ${lower} ${lower}`,
            `steady ${lower} steady ${lower}`,
            `${lower}${lower} pause ${lower}${lower}`,
          ],
          seed,
        )
      : rotate(
          [
            `steady ${label} steady ${label}`,
            `pause then ${label} again`,
            `keep rhythm on ${label}`,
          ],
          seed,
        );

  return {
    type: "timing",
    title: `Smooth out hesitation on ${label}`,
    reason: `${label} is showing up in long-pause patterns, so this block slows the session down and rebuilds steady rhythm.`,
    prompts: buildPromptBlock(`adaptive-timing-${label}`, prompts),
    tags: ["timing", "rhythm", label.toLowerCase()],
  };
}

function buildSymbolFocusBlock(key: AccuracyEntry, seed: number): AdaptiveFocusBlock {
  const fallbackPrompts = symbolPromptSets[";"] ?? [];
  const prompts = rotate(symbolPromptSets[key.label] ?? fallbackPrompts, seed);

  return {
    type: "symbols",
    title: `Reinforce symbol reach around ${key.label}`,
    reason: `${key.label} is showing up as a weak target key. These short code-shaped prompts slow it down and make the reach deliberate.`,
    prompts: buildPromptBlock(`adaptive-symbol-${key.label}`, prompts),
    tags: ["symbols", "coding", "accuracy"],
  };
}

function buildCodeSyntaxFocusBlock(
  substitution:
    | {
        expectedLabel: string;
        actualLabel: string;
        count: number;
      }
    | undefined,
  delimiterMismatchCount: number,
  seed: number,
): AdaptiveFocusBlock {
  const focusSymbol =
    substitution && isSymbolLike(substitution.expectedLabel) ? substitution.expectedLabel : "(";
  const fallbackPrompts = symbolPromptSets[focusSymbol] ?? symbolPromptSets["("] ?? [];
  const prompts = rotate(fallbackPrompts, seed);
  const reason = substitution
    ? `Recent code-shaped mistakes keep swapping ${substitution.expectedLabel} for ${substitution.actualLabel}. This block slows the syntax down and rebuilds the correct pattern.`
    : `${delimiterMismatchCount} paired-delimiter mistakes were detected, so this block rebuilds bracket and brace control with short realistic snippets.`;

  return {
    type: "code-syntax",
    title: `Repair syntax around ${focusSymbol}`,
    reason,
    prompts: buildPromptBlock(`adaptive-code-${focusSymbol}`, prompts),
    tags: ["coding", "syntax", focusSymbol],
  };
}

function buildLetterFocusBlock(key: AccuracyEntry, seed: number, fingerZone?: FingerZone): AdaptiveFocusBlock {
  const lower = key.label.toLowerCase();
  const anchors = rotate(fingerZone ? fingerZoneAnchorKeys[fingerZone] : [lower, "a", "s"], seed);
  const prompts = [
    `${anchors[0]}${lower}${anchors[1]} ${anchors[1]}${lower}${anchors[2]} ${lower}${lower}${lower}`,
    `${lower}${anchors[0]}${lower} ${lower}${anchors[1]}${lower} ${lower}${anchors[2]}${lower}`,
    `${anchors[0]}${anchors[1]}${lower} ${anchors[1]}${anchors[2]}${lower} ${lower}${anchors[2]}${anchors[0]}`,
  ];

  return {
    type: "key",
    title: `Reinforce target key ${key.label}`,
    reason: `${key.label} is one of the weakest target keys in your recent sessions, so this block repeats it with nearby anchor keys.`,
    prompts: buildPromptBlock(`adaptive-key-${key.label}`, prompts),
    tags: ["target-key", key.label.toLowerCase(), "accuracy"],
  };
}

function buildFingerZoneFocusBlock(entry: AccuracyEntry, seed: number): AdaptiveFocusBlock {
  const prompts = rotate(
    fingerZonePromptSets[entry.fingerZone ?? "left-index"],
    seed,
  );

  return {
    type: "finger-zone",
    title: `Re-center ${entry.label}`,
    reason: `${entry.label} carries repeated misses in recent sessions. This block narrows the reach to rebuild clean movement.`,
    prompts: buildPromptBlock(`adaptive-finger-${entry.label}`, prompts),
    tags: ["finger-zone", entry.label, "muscle-memory"],
  };
}

function buildStarterBlock(seed: number): AdaptiveFocusBlock {
  const prompts = rotate(
    ["asdf jkl;", "sad lad; ask dad", "all fall; ask flask"],
    seed,
  );

  return {
    type: "finger-zone",
    title: "Starter adaptive rhythm",
    reason: "No session history exists yet, so start with calm home-row control before specializing.",
    prompts: buildPromptBlock("adaptive-starter", prompts),
    tags: ["home-row", "starter", "accuracy"],
  };
}

function isSymbolLike(label: string) {
  return /[^a-z0-9 ]/i.test(label);
}

export function buildAdaptiveLessonPlan(summaries: SessionSummary[], seed = 0): AdaptiveLessonPlan {
  const shiftSideErrors = summaries.reduce((sum, summary) => sum + summary.shiftSideErrors, 0);
  const likelyWrongFingerCount = summaries.reduce(
    (sum, summary) => sum + summary.likelyWrongFingerCount,
    0,
  );
  const timingHesitationCount = summaries.reduce(
    (sum, summary) => sum + summary.timingHesitationCount,
    0,
  );
  const delimiterMismatchCount = summaries.reduce(
    (sum, summary) => sum + (summary.mistakeCounts["delimiter-mismatch"] ?? 0),
    0,
  );

  const expectedKeyCounts = aggregateKeyCounts(
    summaries.flatMap((summary) => summary.expectedKeyCounts),
  );
  const mistakeKeyCounts = summaries
    .flatMap((summary) => summary.mistakeKeyCounts)
    .reduce<Map<string, number>>((counts, entry) => {
      counts.set(entry.code, (counts.get(entry.code) ?? 0) + entry.count);
      return counts;
    }, new Map());
  const expectedFingerZoneCounts = aggregateFingerZoneCounts(
    summaries.flatMap((summary) => summary.expectedFingerZoneCounts),
  );
  const mistakeFingerZoneCounts = aggregateFingerZoneCounts(
    summaries.flatMap((summary) => summary.mistakeFingerZoneCounts),
  );
  const hesitationKeyCounts = summaries
    .flatMap((summary) => summary.hesitationKeyCounts)
    .reduce<Map<string, { label: string; count: number }>>((counts, entry) => {
      const current = counts.get(entry.code);

      counts.set(entry.code, {
        label: entry.label,
        count: (current?.count ?? 0) + entry.count,
      });

      return counts;
    }, new Map());
  const topSymbolSubstitution = aggregateSubstitutionCounts(
    summaries.flatMap((summary) => summary.substitutionCounts),
  ).find((entry) => isSymbolLike(entry.expectedLabel) || isSymbolLike(entry.actualLabel));

  const weakestKeys = buildAccuracyEntries(expectedKeyCounts, mistakeKeyCounts);
  const weakestFingerZones = buildFingerZoneAccuracyEntries(
    expectedFingerZoneCounts,
    mistakeFingerZoneCounts,
  );
  const topHesitationKey = [...hesitationKeyCounts.entries()]
    .map(([code, entry]) => ({
      code,
      label: entry.label,
      count: entry.count,
      mistakes: entry.count,
      accuracy: 0,
    }))
    .sort((left, right) => right.count - left.count)[0];

  const blocks: AdaptiveFocusBlock[] = [];

  if (summaries.length === 0) {
    blocks.push(buildStarterBlock(seed));
  }

  if (shiftSideErrors > 0) {
    blocks.push(buildShiftFocusBlock(seed));
  }

  if (timingHesitationCount > 0) {
    blocks.push(buildTimingFocusBlock(topHesitationKey, seed));
  }

  if (delimiterMismatchCount > 0 || topSymbolSubstitution) {
    blocks.push(buildCodeSyntaxFocusBlock(topSymbolSubstitution, delimiterMismatchCount, seed));
  }

  const topWeakKey = weakestKeys[0];
  if (topWeakKey) {
    blocks.push(
      isSymbolLike(topWeakKey.label)
        ? buildSymbolFocusBlock(topWeakKey, seed)
        : buildLetterFocusBlock(topWeakKey, seed, weakestFingerZones[0]?.fingerZone),
    );
  }

  const topWeakFingerZone = weakestFingerZones[0];
  if (topWeakFingerZone) {
    blocks.push(buildFingerZoneFocusBlock(topWeakFingerZone, seed));
  }

  const secondWeakKey = weakestKeys.find((entry) => entry.code !== topWeakKey?.code);
  if (blocks.length < 3 && secondWeakKey) {
    blocks.push(
      isSymbolLike(secondWeakKey.label)
        ? buildSymbolFocusBlock(secondWeakKey, seed + 1)
        : buildLetterFocusBlock(secondWeakKey, seed + 1, topWeakFingerZone?.fingerZone),
    );
  }

  if (blocks.length === 0) {
    blocks.push(buildStarterBlock(seed));
  }

  const selectedBlocks = blocks.slice(0, 3);
  const prompts = selectedBlocks.flatMap((block) => block.prompts).slice(0, 12);
  const focusTitles = selectedBlocks.map((block) => block.title);
  const kind = selectedBlocks.some((block) => block.type === "symbols" || block.type === "code-syntax")
    ? "code"
    : "technique";

  return {
    lesson: {
      id: `adaptive-generated-${seed}`,
      title: "Adaptive Session",
      summary:
        focusTitles.length > 0
          ? `Generated from your recent weakness patterns: ${focusTitles.join(", ")}.`
          : "Generated from your recent typing history.",
      mode: "adaptive",
      kind,
      goals: selectedBlocks.map((block) => block.reason),
      prompts,
      tags: selectedBlocks.flatMap((block) => block.tags),
      estimatedMinutes: Math.max(6, Math.ceil(prompts.length / 2)),
    },
    blocks: selectedBlocks,
    overview: {
      shiftSideErrors,
      likelyWrongFingerCount,
      timingHesitationCount,
    },
  };
}
