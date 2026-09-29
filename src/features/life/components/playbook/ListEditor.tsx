"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { savePlaybookAction } from "@/features/life/actions/goal-playbook-actions";
import type { SavePlaybookInput } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface Row {
  first: string;
  second: string;
}

interface ListEditorProps {
  goalId: string;
  field: "assets" | "obstacles" | "people";
  rows: Row[];
  firstPlaceholder: string;
  // When omitted the list is a plain list of single strings (assets).
  secondPlaceholder?: string;
}

function toInput(field: ListEditorProps["field"], rows: Row[]): SavePlaybookInput {
  if (field === "assets") return { assets: rows.map((row) => row.first) };
  if (field === "obstacles") {
    return { obstacles: rows.map((row) => ({ obstacle: row.first, solution: row.second })) };
  }
  return { people: rows.map((row) => ({ name: row.first, help: row.second })) };
}

export function ListEditor({
  goalId,
  field,
  rows: initialRows,
  firstPlaceholder,
  secondPlaceholder,
}: ListEditorProps) {
  const { run, isPending } = useServerAction();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const hasSecond = secondPlaceholder !== undefined;

  const save = (nextRows: Row[]) => {
    run(savePlaybookAction(goalId, toInput(field, nextRows)), {
      errorMessage: "Failed to save",
    });
  };

  const handleChange = (index: number, key: keyof Row, value: string) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  };

  const handleRemove = (index: number) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(nextRows);
    save(nextRows);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => {
        const isUnsolved = field === "obstacles" && row.first.trim() !== "" && !row.second.trim();
        return (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={row.first}
                onChange={(e) => handleChange(index, "first", e.target.value)}
                onBlur={() => save(rows)}
                placeholder={firstPlaceholder}
                className={hasSecond ? "" : "sm:col-span-2"}
              />
              {hasSecond && (
                <Input
                  value={row.second}
                  onChange={(e) => handleChange(index, "second", e.target.value)}
                  onBlur={() => save(rows)}
                  placeholder={secondPlaceholder}
                  className={isUnsolved ? "border-amber-500/40" : ""}
                />
              )}
            </div>
            <Button
              variant="ghost-danger"
              size="icon-sm"
              onClick={() => handleRemove(index)}
              disabled={isPending}
              title="Remove"
            >
              <X size={13} />
            </Button>
          </div>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setRows((previous) => [...previous, { first: "", second: "" }])}
        className="self-start"
      >
        <Plus size={14} /> Add
      </Button>
    </div>
  );
}
