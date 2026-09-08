"use client";

import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/actions/button";
import { Dialog } from "@/components/ui/overlays/dialog";
import { EXERCISE_DETAILS } from "@/features/health/training/data/exercise-details";
import { Activity, ListChecks, Video } from "lucide-react";

interface SessionExerciseDetailsModalProps {
  selectedExercise: { id: string; name: string } | null;
  setSelectedExercise: Dispatch<SetStateAction<{ id: string; name: string } | null>>;
}

export function SessionExerciseDetailsModal({
  selectedExercise,
  setSelectedExercise,
}: SessionExerciseDetailsModalProps) {
  return (
    <Dialog
      isOpen={!!selectedExercise}
      onClose={() => setSelectedExercise(null)}
      title={selectedExercise?.name}
      maxWidth="640px"
    >
      {selectedExercise &&
        (() => {
          const details = EXERCISE_DETAILS[selectedExercise.name];
          return (
            <div className="flex flex-col gap-5 text-sm pb-2">
              {/* Biomechanics */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-accent-training flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                  <Activity size={14} />
                  Науковий аналіз
                </h4>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  {details?.explanation || "Пояснення вправи ще додається."}
                </p>
                {details?.scientificInsight && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                    {details.scientificInsight}
                  </p>
                )}
              </div>

              {/* Technique */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                  <ListChecks size={14} />
                  Техніка виконання
                </h4>
                <div className="flex flex-col gap-2">
                  {details?.technique ? (
                    details.technique.split("\n").map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-xs text-zinc-300">
                        <span className="w-5 h-5 rounded-full bg-white/5 border border-white/[0.08] text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="pt-0.5">{step.replace(/^\d+\.\s*/, "")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400 italic">Слідкуйте за правильною формою.</p>
                  )}
                </div>
              </div>

              {/* Video Player */}
              {details?.videoUrl && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-red-400 flex items-center gap-1.5 border-b border-white/[0.04] pb-1">
                    <Video size={14} />
                    Відеопояснення
                  </h4>
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/[0.08] bg-black/20 mt-1">
                    <iframe
                      className="w-full h-full"
                      src={details.videoUrl}
                      title={`Відеопояснення: ${selectedExercise.name}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Open Full Page */}
              <div className="flex justify-between items-center pt-3 border-t border-white/[0.06] mt-1">
                <Link
                  href={`/health/training/exercises/${selectedExercise.id}`}
                  target="_blank"
                  className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors underline flex items-center gap-1 focus:outline-none"
                >
                  Відкрити повну сторінку вправи в новій вкладці →
                </Link>
                <Button variant="secondary" size="sm" onClick={() => setSelectedExercise(null)}>
                  Закрити
                </Button>
              </div>
            </div>
          );
        })()}
    </Dialog>
  );
}
