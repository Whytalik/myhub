"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Compass, PartyPopper, Play, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { deleteThoughtAction, routeThoughtAction } from "@/features/life/actions/thought-actions";
import { TRASH_STATUS_NAME, type FilterOutcome } from "@/features/life/logic/filter-outcomes";
import type { ThoughtData } from "@/features/life/types";

interface ReviewSessionClientProps {
  initialThoughts: ThoughtData[];
  missionContent: string | null;
  activeThoughts: ThoughtData[];
}

type Stage = "q1" | "q1b" | "q_conflict" | "q2" | "q3";
type WantType = "want" | "must";

const OUTCOME_LABELS: Record<FilterOutcome, string> = {
  KEEP_WANT: "Хочу",
  KEEP_MUST: "Повинен",
  SOMEDAY: "Колись/Можливо",
  NOT_MINE: TRASH_STATUS_NAME,
  DELETE: "Видалено",
};

// Fisher–Yates — shuffled once per session, drawn without replacement, so
// every card in the deck gets a decision (GTD's "reach zero" guarantee is
// preserved even though the order isn't sequential).
function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function ReviewSessionClient({
  initialThoughts,
  missionContent,
  activeThoughts,
}: ReviewSessionClientProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [queue, setQueue] = useState<ThoughtData[]>([]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("q1");
  const [wantType, setWantType] = useState<WantType | null>(null);
  const [outcomeCounts, setOutcomeCounts] = useState<Record<FilterOutcome, number>>({
    KEEP_WANT: 0,
    KEEP_MUST: 0,
    SOMEDAY: 0,
    NOT_MINE: 0,
    DELETE: 0,
  });
  const [, startTransition] = useTransition();

  const start = () => {
    setQueue(shuffle(initialThoughts));
    setIndex(0);
    setStage("q1");
    setWantType(null);
    setOutcomeCounts({ KEEP_WANT: 0, KEEP_MUST: 0, SOMEDAY: 0, NOT_MINE: 0, DELETE: 0 });
    setHasStarted(true);
  };

  const exit = () => setHasStarted(false);

  const current = queue[index];
  const isComplete = hasStarted && index >= queue.length;

  const finalize = (outcome: FilterOutcome) => {
    if (!current) return;
    setOutcomeCounts((prev) => ({ ...prev, [outcome]: prev[outcome] + 1 }));

    startTransition(async () => {
      const result =
        outcome === "DELETE"
          ? await deleteThoughtAction(current.id)
          : await routeThoughtAction(current.id, outcome);
      if (!result.success) {
        toast.error(result.error || "Failed to save this decision");
      }
    });

    setIndex((i) => i + 1);
    setStage("q1");
    setWantType(null);
  };

  if (!hasStarted) {
    return (
      <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent">
          <Play size={28} />
        </div>
        {initialThoughts.length === 0 ? (
          <>
            <p className="text-panel-title">Inbox is empty</p>
            <p className="text-caption max-w-sm">
              Nothing to review right now — capture a few thoughts first.
            </p>
          </>
        ) : (
          <>
            <p className="text-panel-title">
              {initialThoughts.length} thought{initialThoughts.length === 1 ? "" : "s"} waiting in
              Inbox
            </p>
            <p className="text-caption max-w-sm">
              Each card gets three quick questions. Nothing goes back into Inbox once decided.
            </p>
            <Button type="button" variant="primary" onClick={start}>
              Start review
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[7500] bg-canvas flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        {missionContent ? (
          <div className="flex items-center gap-2 min-w-0 text-caption text-zinc-400">
            <Compass size={13} className="shrink-0 text-accent" />
            <span className="truncate">{missionContent}</span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 shrink-0">
          {!isComplete && (
            <span className="text-label">
              {Math.min(index + 1, queue.length)} / {queue.length}
            </span>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={exit} title="Exit review">
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {isComplete ? (
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <PartyPopper size={28} />
            </div>
            <p className="text-panel-title">Review complete</p>
            <div className="flex flex-col gap-1 w-full">
              {(Object.keys(OUTCOME_LABELS) as FilterOutcome[])
                .filter((outcome) => outcomeCounts[outcome] > 0)
                .map((outcome) => (
                  <div
                    key={outcome}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] text-sm"
                  >
                    <span className="text-zinc-300">{OUTCOME_LABELS[outcome]}</span>
                    <span className="font-mono text-zinc-400">{outcomeCounts[outcome]}</span>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={exit}>
                Close
              </Button>
              <Link href="/life/planning">
                <Button type="button" variant="primary">
                  Go to board
                </Button>
              </Link>
            </div>
          </div>
        ) : current ? (
          <div className="flex flex-col items-center gap-8 max-w-xl w-full text-center">
            <p className="text-page-title whitespace-pre-wrap break-words">{current.content}</p>

            {stage === "q1" && (
              <QuestionButtons
                question="Чиє це бажання?"
                options={[
                  {
                    label: "Хочу",
                    onClick: () => {
                      setWantType("want");
                      setStage("q_conflict");
                    },
                  },
                  { label: "Нав'язане", onClick: () => setStage("q1b") },
                ]}
              />
            )}

            {stage === "q1b" && (
              <QuestionButtons
                question="Що станеться, якщо я просто заб'ю і цього не зроблю?"
                options={[
                  { label: "Нічого страшного", onClick: () => finalize("NOT_MINE") },
                  {
                    label: "Реальний наслідок",
                    onClick: () => {
                      setWantType("must");
                      setStage("q_conflict");
                    },
                  },
                ]}
              />
            )}

            {stage === "q_conflict" && (
              <div className="flex flex-col gap-4 w-full">
                <QuestionButtons
                  question="Чи суперечить це моїй місії або тому, що я вже прийняв?"
                  options={[
                    { label: "Так, конфлікт", onClick: () => finalize("NOT_MINE") },
                    { label: "Ні, все узгоджено", onClick: () => setStage("q2") },
                  ]}
                />
                {activeThoughts.length > 0 && (
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-label">Вже прийнято ({activeThoughts.length})</span>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.06] p-2">
                      {activeThoughts.map((thought) => (
                        <p key={thought.id} className="text-caption truncate">
                          {thought.content}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {stage === "q2" && (
              <QuestionButtons
                question="Чи принесе це пряму користь мені особисто або моїм найближчим людям?"
                options={[
                  { label: "Так", onClick: () => setStage("q3") },
                  { label: "Ні", onClick: () => finalize("NOT_MINE") },
                ]}
              />
            )}

            {stage === "q3" && (
              <QuestionButtons
                question="Чи маю я на це ресурс у найближчій перспективі?"
                options={[
                  {
                    label: "Так",
                    onClick: () => finalize(wantType === "must" ? "KEEP_MUST" : "KEEP_WANT"),
                  },
                  { label: "Не зараз", onClick: () => finalize("SOMEDAY") },
                ]}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuestionButtons({
  question,
  options,
}: {
  question: string;
  options: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-panel-title">{question}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {options.map((option) => (
          <Button
            key={option.label}
            type="button"
            variant="outline"
            size="lg"
            onClick={option.onClick}
            className="flex-1 sm:min-w-[160px]"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
