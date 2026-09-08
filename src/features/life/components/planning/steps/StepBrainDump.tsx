import { Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ThoughtFields } from "@/features/life/components/thoughts/ThoughtFields";
import type { ThoughtType } from "@/features/life/logic/thought-types";
import type { LifeSphereData } from "@/features/life/types";
import type { ThoughtItem } from "../types";

export function StepBrainDump({
  spheres,
  thoughts,
  displayedThoughts,
  groupedThoughts,
  isGroupedBySphere,
  setIsGroupedBySphere,
  activeFilterSphereId,
  setActiveFilterSphereId,
  newThoughtText,
  setNewThoughtText,
  newThoughtSphereId,
  setNewThoughtSphereId,
  newThoughtType,
  newThoughtTemplateData,
  handleDetailedFieldsChange,
  showDetailedFields,
  setShowDetailedFields,
  handleAddThought,
  isActionPending,
  handleEditClick,
  inboxThoughts,
  setStep,
}: {
  spheres: LifeSphereData[];
  thoughts: ThoughtItem[];
  displayedThoughts: ThoughtItem[];
  groupedThoughts: Record<string, ThoughtItem[]>;
  isGroupedBySphere: boolean;
  setIsGroupedBySphere: (value: boolean | ((previous: boolean) => boolean)) => void;
  activeFilterSphereId: string | null;
  setActiveFilterSphereId: (value: string | null) => void;
  newThoughtText: string;
  setNewThoughtText: (value: string) => void;
  newThoughtSphereId: string | null;
  setNewThoughtSphereId: (value: string | null) => void;
  newThoughtType: ThoughtType | null;
  newThoughtTemplateData: Record<string, string> | null;
  handleDetailedFieldsChange: (patch: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  }) => void;
  showDetailedFields: boolean;
  setShowDetailedFields: (value: boolean | ((previous: boolean) => boolean)) => void;
  handleAddThought: () => void;
  isActionPending: boolean;
  handleEditClick: (thoughtItem: ThoughtItem) => void;
  inboxThoughts: ThoughtItem[];
  setStep: (step: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Form */}
      <div className="glass-card p-6 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4 w-full">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">Step 1: Brain Dump</h3>
          <p className="text-caption text-xs mt-1">
            Write down everything on your mind: tasks, shopping, thoughts, ideas, obligations. Write
            quickly.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex gap-3 items-start">
            <Textarea
              value={newThoughtText}
              onChange={(e) => setNewThoughtText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (e.metaKey || e.ctrlKey || !showDetailedFields) {
                    e.preventDefault();
                    handleAddThought();
                  }
                }
              }}
              placeholder="Capture thought... (Ctrl+Enter to save)"
              autoFocus
              disabled={isActionPending}
              rows={2}
              className="flex-1 min-h-[60px]"
            />
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="primary"
                onClick={handleAddThought}
                disabled={!newThoughtText.trim() || isActionPending}
                className="h-9 px-4"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowDetailedFields(!showDetailedFields)}
                className="text-[11px] font-mono h-8 border border-white/[0.04] bg-white/[0.01]"
              >
                {showDetailedFields ? "Hide details" : "Add details"}
              </Button>
            </div>
          </div>

          {showDetailedFields && (
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-4 animate-fade-up">
              <ThoughtFields
                spheres={spheres}
                sphereId={newThoughtSphereId}
                type={newThoughtType}
                templateData={newThoughtTemplateData}
                onChange={handleDetailedFieldsChange}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            💡 Life Areas (click to filter and pre-select):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(spheres || []).map((currentSphere) => {
              const isSelected = activeFilterSphereId === currentSphere.id;
              return (
                <button
                  key={currentSphere.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setActiveFilterSphereId(null);
                      if (!showDetailedFields) {
                        setNewThoughtSphereId(null);
                      }
                    } else {
                      setActiveFilterSphereId(currentSphere.id);
                      setNewThoughtSphereId(currentSphere.id);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wide border transition-all duration-150 ${
                    isSelected
                      ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: currentSphere.color }}
                  />
                  <span>{currentSphere.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Inbox List (3-column grid) */}
      <div className="glass-card p-5 bg-black/10 border border-white/[0.04] rounded-2xl flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">
              Current Inbox
            </h4>
            {!activeFilterSphereId && thoughts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGroupedBySphere(!isGroupedBySphere)}
                className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border transition-colors duration-150 ${
                  isGroupedBySphere
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                Group by sphere
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
            {activeFilterSphereId
              ? `${displayedThoughts.length} of ${thoughts.length}`
              : thoughts.length}
          </span>
        </div>

        {displayedThoughts.length === 0 ? (
          <div className="text-zinc-500 text-xs italic py-12 text-center">
            {activeFilterSphereId
              ? "No thoughts captured in this sphere yet."
              : "Your thoughts will appear here. Write something above!"}
          </div>
        ) : isGroupedBySphere && !activeFilterSphereId ? (
          <div className="flex flex-col gap-6 overflow-y-auto max-h-[350px] pr-1">
            {/* 1. Uncategorized Group */}
            {groupedThoughts["uncategorized"]?.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 border-b border-white/[0.04] pb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Uncategorized ({groupedThoughts["uncategorized"].length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...groupedThoughts["uncategorized"]].reverse().map((thoughtItem) => (
                    <div
                      key={thoughtItem.id}
                      className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                    >
                      <div className="flex items-start justify-between gap-3 w-full">
                        <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                          {thoughtItem.content}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditClick(thoughtItem)}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            title="Edit thought"
                          >
                            <Pencil size={12} />
                          </button>
                          <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                            {thoughtItem.status.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Spheres Groups */}
            {(spheres || []).map((currentSphere) => {
              const thoughtsInSphere = groupedThoughts[currentSphere.id] || [];
              if (thoughtsInSphere.length === 0) return null;

              return (
                <div key={currentSphere.id} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 border-b border-white/[0.04] pb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: currentSphere.color }}
                    />
                    <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-wider font-semibold">
                      {currentSphere.name} ({thoughtsInSphere.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...thoughtsInSphere].reverse().map((thoughtItem) => (
                      <div
                        key={thoughtItem.id}
                        className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
                          <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                            {thoughtItem.content}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditClick(thoughtItem)}
                              className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              title="Edit thought"
                            >
                              <Pencil size={12} />
                            </button>
                            <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                              {thoughtItem.status.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[350px] pr-1">
            {[...displayedThoughts].reverse().map((thoughtItem) => {
              const sphere = spheres.find(
                (currentSphere) => currentSphere.id === thoughtItem.sphereId,
              );
              return (
                <div
                  key={thoughtItem.id}
                  className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                      {thoughtItem.content}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(thoughtItem)}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        title="Edit thought"
                      >
                        <Pencil size={12} />
                      </button>
                      <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                        {thoughtItem.status.name}
                      </span>
                    </div>
                  </div>
                  {sphere && (
                    <div className="flex items-center gap-1.5 self-start mt-auto">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: sphere.color }}
                      />
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                        {sphere.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {thoughts.length > 0 && (
          <div className="flex justify-end border-t border-white/[0.04] pt-3 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(2)}
              className="w-full md:w-auto"
            >
              Next to Filtering ({inboxThoughts.length} in Inbox){" "}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
