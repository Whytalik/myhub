"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileJson, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { importDishesFromJson } from "../actions/dishes";

interface DishImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface ImportResult {
  imported: number;
  updated: number;
  errors: string[];
}

export function DishImportModal({ isOpen, onClose, onImported }: DishImportModalProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === "string") setJsonInput(text);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please drop a .json file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === "string") setJsonInput(text);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error("Paste JSON or upload a file");
      return;
    }
    setIsImporting(true);
    setResult(null);
    try {
      const res = await importDishesFromJson(jsonInput);
      if (res.success) {
        setResult(res.data);
        if (res.data.imported > 0 || res.data.updated > 0) {
          toast.success(`Imported: ${res.data.imported}, Updated: ${res.data.updated}`);
          onImported();
        } else if (res.data.errors.length > 0) {
          toast.error("No dishes imported. Check errors below.");
        }
      } else {
        toast.error(res.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setResult(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Dishes from JSON"
      maxWidth="560px"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleImport} disabled={isImporting || !jsonInput.trim()}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragOver ? "border-accent bg-accent/5" : "border-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileSelect}
          />
          <FileJson size={32} className="mx-auto mb-2 text-muted" />
          <p className="text-sm text-text font-medium">Drop .json file here or click to browse</p>
          <p className="text-caption text-muted mt-1">Supports dishes.json format</p>
        </div>

        <div className="relative">
          <textarea
            className="w-full h-64 bg-surface border border-border-strong rounded-xl p-3 font-mono text-xs text-text resize-none focus:outline-none focus:border-accent"
            placeholder='[{"name": "Dish", "type": "MAIN", "ingredients": [...]}]'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          {jsonInput && (
            <button
              className="absolute top-2 right-2 p-1 text-muted hover:text-text"
              onClick={() => setJsonInput("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-caption text-muted">
          <Upload size={12} />
          <span>Paste JSON array or upload a file. Products are matched by name. Existing dishes are updated.</span>
        </div>

        {result && (
          <div className="bg-raised border border-border rounded-xl p-4 space-y-3">
            <div className="flex gap-4 text-note font-mono">
              <span className="text-accent flex items-center gap-1">
                <CheckCircle size={12} /> Imported: {result.imported}
              </span>
              <span className="text-secondary flex items-center gap-1">
                <CheckCircle size={12} /> Updated: {result.updated}
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-caption font-mono text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> Errors ({result.errors.length}):
                </p>
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-label font-mono text-red-400/80 pl-4">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
