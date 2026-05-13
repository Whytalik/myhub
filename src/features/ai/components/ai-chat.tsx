"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Trash2, ExternalLink, Settings2, Thermometer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { motion, AnimatePresence } from "framer-motion";

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
  { id: "openrouter", label: "OpenRouter" },
];

const DOMAIN_OPTIONS = [
  { id: "operations", label: "Operations" },
  { id: "health", label: "Health" },
  { id: "mind", label: "Mind" },
  { id: "wealth", label: "Wealth" },
];

const TEMPERATURE_OPTIONS = [
  { id: "0.2", label: "Precise" },
  { id: "0.5", label: "Balanced" },
  { id: "0.7", label: "Creative" },
];

function SimpleSelect({ value, onChange, options, className = "" }: { value: string; onChange: (val: string) => void; options: { id: string; label: string }[]; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = options.find(o => o.id === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-caption font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
      >
        <span className="truncate">{selected?.label || value}</span>
        <ChevronDown size={12} className={`text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 min-w-[140px] rounded-xl border border-border bg-elevated shadow-elevated overflow-hidden z-50"
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-caption text-left transition-all ${
                  option.id === value
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("operations");
  const [provider, setProvider] = useState<AIProvider>("groq");
  const [temperature, setTemperature] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
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
      const result = await aiChatAction(userMessage, domain as "operations" | "health", provider);

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
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-accent text-bg shadow-lg hover:bg-accent-hover transition-all flex items-center justify-center md:bottom-6"
      >
        <Sparkles size={20} />
      </motion.button>
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
        onClick={() => setIsOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[10001] w-full max-w-6xl h-[85vh] bg-elevated border border-border/50 rounded-2xl shadow-elevated flex overflow-hidden"
      >
        {/* Left Sidebar: Suggestions */}
        <AnimatePresence>
          {suggestionIds.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="border-r border-border/50 flex flex-col overflow-hidden shrink-0"
            >
              <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                <span className="text-caption font-mono uppercase tracking-wider text-text-muted">Draft Actions</span>
                <Sparkles size={14} className="text-accent/40" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AISuggestions
                  suggestionIds={suggestionIds}
                  onDismiss={(id) => setSuggestionIds((prev) => prev.filter((s) => s !== id))}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mr-2">
                <Sparkles size={16} className="text-accent" />
              </div>
              <div>
                <h2 className="text-body font-semibold text-text-primary">Karasik AI</h2>
                <p className="text-micro text-text-muted">Your intelligent assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-surface/50 rounded-xl px-2 py-1">
                <SimpleSelect
                  value={provider}
                  onChange={(val) => setProvider(val as AIProvider)}
                  options={PROVIDER_OPTIONS}
                />
                <div className="w-px h-4 bg-border" />
                <SimpleSelect
                  value={domain}
                  onChange={setDomain}
                  options={DOMAIN_OPTIONS}
                />
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-all ${showSettings ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-surface-hover"}`}
              >
                <Settings2 size={16} />
              </button>

              <button
                onClick={handleClear}
                className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-border/30"
              >
                <div className="px-6 py-4 flex items-center gap-6 bg-surface/30">
                  <div className="flex items-center gap-3">
                    <Thermometer size={14} className="text-text-muted" />
                    <span className="text-caption text-text-secondary">Temperature</span>
                    <SimpleSelect
                      value={temperature}
                      onChange={setTemperature}
                      options={TEMPERATURE_OPTIONS}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
              >
                <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-6">
                  <Sparkles size={36} strokeWidth={1.5} className="text-accent" />
                </div>
                <h3 className="text-heading font-bold text-text-primary mb-2">Hello! I&apos;m Karasik</h3>
                <p className="text-body text-text-secondary leading-relaxed mb-8">
                  Your intelligent OS assistant. I can help you manage tasks, track habits, and navigate your life system.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {[
                    "Add task 'Morning workout' for tomorrow",
                    "Show my pending tasks for today",
                    "What habits am I tracking this week",
                  ].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="text-caption font-mono text-text-secondary/60 hover:text-accent hover:bg-accent/5 py-3 px-4 rounded-xl border border-border/30 transition-all text-left"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/10 text-accent px-5 py-3 rounded-2xl rounded-tr-sm"
                      : "text-text-primary"
                  }`}
                >
                  {msg.role === "assistant" && msg.metadata && (
                    <div className="flex items-center gap-2 text-micro font-mono text-text-muted/50 mb-2 uppercase tracking-wider">
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

                  {msg.role === "assistant" && msg.taskData && msg.taskData.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.taskData.filter((t): t is TaskData => typeof t.id === "string" && typeof t.title === "string").map((task) => (
                        <Link
                          key={task.id}
                          href={`/life/tasks?focus=${task.id}`}
                          className="group/link flex items-center justify-between w-full max-w-sm p-3 rounded-xl bg-surface/50 border border-border/50 hover:border-accent/40 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover/link:bg-accent/15 transition-colors">
                              <ExternalLink size={14} className="text-accent" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-body font-medium text-text-primary truncate">{task.title}</p>
                              <p className="text-micro font-mono text-text-muted uppercase tracking-wider">Open in Tasks</p>
                            </div>
                          </div>
                          <span className="text-micro font-medium px-2 py-0.5 rounded-lg bg-bg/50 border border-border/50 text-text-muted group-hover/link:text-accent group-hover/link:border-accent/20 transition-all">
                            {task.priority}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.suggestionIds && msg.suggestionIds.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-accent/8 border border-accent/15 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-accent" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-text-primary">Created {msg.suggestionIds.length} draft actions</p>
                        <p className="text-micro text-text-muted leading-tight">Review and confirm them in the sidebar</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface/50 border border-border/30">
                  <Loader2 size={16} className="animate-spin text-accent" />
                  <span className="text-caption text-text-muted">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border/30">
            <div className="relative max-w-3xl mx-auto flex items-center gap-3 bg-surface/50 border border-border rounded-2xl px-4 py-3 focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/10 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Karasik..."
                className="flex-1 !border-none !bg-transparent !h-10 !shadow-none !ring-0 !text-base placeholder:text-text-muted/50"
                disabled={isLoading}
                autoFocus
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="!h-9 !w-9 !rounded-xl shrink-0"
                size="icon"
                variant="primary"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
