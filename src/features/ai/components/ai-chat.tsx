"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  aiChatAction,
  aiClearChatAction,
  aiGetTasksAction,
} from "@/features/ai/actions/ai-actions";
import type { AIActionPayload } from "@/lib/ai/ai-types";
import type { AIProvider } from "@/lib/ai/ai-client";
import { AISuggestions } from "./ai-suggestions";
import type { TaskData } from "@/features/life/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: AIActionPayload[];
  taskData?: (TaskData | Record<string, unknown>)[];
  metadata?: { responseTime: number; usage: { inputTokens: number; outputTokens: number } };
  suggestionIds?: string[];
}

const PROVIDER_OPTIONS = [
  { id: "groq", label: "Groq" },
  { id: "google", label: "Google" },
  { id: "openrouter", label: "OR" },
];

const DOMAIN_OPTIONS = [
  { id: "operations", label: "Ops" },
  { id: "health", label: "Health" },
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState<"operations" | "health">("operations");
  const [provider, setProvider] = useState<AIProvider>("groq");
  const [suggestionIds, setSuggestionIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await aiChatAction(userMessage, domain, provider);

      let finalTaskData: (Record<string, unknown> | TaskData)[] = result.taskData || [];

      const taskIds = result.actions
        .filter(a => a.action.includes("Task") && a.payload.id && !finalTaskData.find(t => t.id === a.payload.id))
        .map(a => a.payload.id as string);

      if (taskIds.length > 0) {
        const fetched = (await aiGetTasksAction(taskIds)) as unknown as TaskData[];
        finalTaskData = [...finalTaskData, ...fetched];
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reply,
          actions: result.actions,
          metadata: result.metadata,
          taskData: finalTaskData as Record<string, unknown>[],
          suggestionIds: result.suggestionIds
        },
      ]);

      if (result.suggestionIds && result.suggestionIds.length > 0) {
        setSuggestionIds((prev) => [...prev, ...result.suggestionIds]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    await aiClearChatAction();
    setMessages([]);
    setSuggestionIds([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-accent text-bg shadow-lg hover:bg-accent-hover transition-all active:scale-95 flex items-center justify-center md:bottom-6"
      >
        <Sparkles size={20} />
      </button>
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-12">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Main Container */}
      <div className="relative z-[10001] w-full max-w-5xl h-[85vh] bg-elevated border border-border/50 rounded-xl shadow-elevated flex overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Left Sidebar: Suggestions */}
        {suggestionIds.length > 0 && (
          <div className="relative w-80 border-r border-border/50 flex flex-col animate-in slide-in-from-left duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-xl -z-10" />
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-transparent">
              <span className="text-caption font-mono uppercase tracking-wider text-muted">Draft Actions</span>
              <Sparkles size={14} className="text-accent/40" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent text-left">
              <AISuggestions
                suggestionIds={suggestionIds}
                onDismiss={(id) => setSuggestionIds((prev) => prev.filter((s) => s !== id))}
              />
            </div>
          </div>
        )}

        {/* Right Area: Chat */}
        <div className="flex-1 flex flex-col bg-surface relative">
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-border/30">
            <div className="flex items-center gap-4">
              <CustomSelect
                value={provider}
                onChange={(val) => setProvider(val as AIProvider)}
                options={PROVIDER_OPTIONS}
                className="w-24"
              />
              <CustomSelect
                value={domain}
                onChange={(val) => setDomain(val as "operations" | "health")}
                options={DOMAIN_OPTIONS}
                className="w-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="p-2 hover:bg-surface-hover rounded-lg text-muted hover:text-text transition-all"
                title="Clear"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-lg text-muted hover:text-text transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in fade-in duration-700">
              <div className="w-16 h-16 rounded-2xl bg-accent/8 flex items-center justify-center mb-6">
                <Sparkles size={32} strokeWidth={1.5} className="text-accent/40" />
              </div>
              <h3 className="text-sm font-bold text-text mb-2">Hello! I&apos;m Karasik</h3>
              <p className="text-body text-muted leading-relaxed">
                Your intelligent OS assistant. I can help you manage tasks,
                track habits, and navigate your life system. Ask anything.
              </p>
              <div className="mt-8 flex flex-col gap-2 w-full">
                {[
                  "Add task 'Morning workout' for tomorrow",
                  "Show my pending tasks for today",
                  "What habits am I tracking this week",
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="text-note font-mono text-muted/60 hover:text-accent hover:bg-accent/5 py-2 px-4 rounded-xl border border-border/30 transition-all text-left"
                  >
                    &rarr; {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/8 text-accent px-5 py-3 rounded-xl border border-accent/10"
                      : "text-text"
                  }`}
                >
                  {msg.role === "assistant" && msg.metadata && (
                    <div className="flex items-center gap-2 text-label font-mono text-muted/50 mb-2 uppercase tracking-wider">
                      <span>{(msg.metadata.responseTime / 1000).toFixed(1)}s</span>
                      {msg.metadata.usage && (
                        <>
                          <span>·</span>
                          <span>{msg.metadata.usage.inputTokens + msg.metadata.usage.outputTokens} tokens</span>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-left whitespace-pre-wrap">{msg.content}</p>

                  {/* Direct Action Links (Post-Execution) */}
                  {msg.role === "assistant" && msg.taskData && msg.taskData.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.taskData.filter((t): t is TaskData => typeof t.id === "string" && typeof t.title === "string").map((task) => (
                        <Link
                          key={task.id}
                          href={`/life/tasks?focus=${task.id}`}
                          className="group/link flex items-center justify-between w-full max-w-sm p-3 rounded-xl bg-surface-hover border border-border/50 hover:border-accent/40 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover/link:bg-accent/15 transition-colors">
                              <ExternalLink size={14} className="text-accent" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-body font-medium text-text truncate">{task.title}</p>
                              <p className="text-caption font-mono text-muted uppercase tracking-wider">Open in Tasks</p>
                            </div>
                          </div>
                          <span className="text-caption font-medium px-2 py-0.5 rounded-lg bg-bg/50 border border-border/50 text-muted group-hover/link:text-accent group-hover/link:border-accent/20 transition-all">
                            {task.priority}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Pending Confirmation Indicator */}
                  {msg.role === "assistant" && msg.suggestionIds && msg.suggestionIds.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-accent/8 border border-accent/15 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-text">Created {msg.suggestionIds.length} draft actions</p>
                        <p className="text-caption text-muted leading-tight">Review and confirm them in the sidebar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <Loader2 size={18} className="animate-spin text-accent/50" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8">
            <div className="relative max-w-2xl mx-auto flex items-center gap-3 bg-surface-hover border border-border rounded-xl px-4 py-2 focus-within:border-accent/30 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Karasik..."
                className="flex-1 !border-none !bg-transparent !h-10 !shadow-none !ring-0 !text-base"
                disabled={isLoading}
                autoFocus
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="!h-8 !w-8 !rounded-lg"
                size="icon"
                variant="primary"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
