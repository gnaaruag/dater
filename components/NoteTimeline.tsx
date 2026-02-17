"use client";

import { useState } from "react";
import { SendHorizonal, Trash2, MessageCircle, Check, X } from "lucide-react";
import type { Note } from "@/lib/types";
import { saveNote, deleteNote } from "@/lib/db";

interface Props {
  daterId: string;
  color: string;
  notes: Note[];
  onNotesChange: () => void;
}

function formatNoteDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NoteTimeline({
  daterId,
  color,
  notes,
  onNotesChange,
}: Props) {
  const [text, setText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const note: Note = {
      id: crypto.randomUUID(),
      daterId,
      text: trimmed,
      date: dateStr,
      createdAt: new Date().toISOString(),
    };
    await saveNote(note);
    setText("");
    onNotesChange();
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    await deleteNote(deleteConfirmId);
    setDeleteConfirmId(null);
    onNotesChange();
  }

  return (
    <div className="px-6 pb-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-ink/30" strokeWidth={2} />
        <span className="text-sm font-semibold text-ink/30 uppercase tracking-wide">notes</span>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="add a note..."
          className="flex-1"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="w-11 h-11 rounded-full border-2 border-ink flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-default shrink-0"
          style={{
            backgroundColor: text.trim() ? color : "transparent",
            color: text.trim() ? "white" : "var(--ink)",
          }}
        >
          <SendHorizonal size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Timeline */}
      {notes.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[52px] top-2 bottom-2 w-[2.5px] rounded-full"
            style={{ backgroundColor: color + "30" }}
          />

          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-3">
                <span className="text-sm font-medium text-ink/40 w-[44px] text-right shrink-0 pt-0.5">
                  {formatNoteDate(note.date)}
                </span>
                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1.5 relative z-10"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                  <p className="text-base text-ink/80 leading-snug pt-0.5 break-words min-w-0">
                    {note.text}
                  </p>
                  <button
                    onClick={() => setDeleteConfirmId(note.id)}
                    className="shrink-0 text-ink/20 hover:text-dater-red leading-none p-1 transition-colors"
                    title="delete note"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-ink/20"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-cream rounded-2xl border-[2.5px] border-ink px-6 py-5 max-w-xs w-full mx-6 animate-slide-up text-center">
            <p className="text-lg font-semibold mb-1">delete this note?</p>
            <p className="text-sm text-ink/40 mb-5">this can&apos;t be undone</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="w-10 h-10 rounded-full border-[2.5px] border-dater-red bg-dater-red text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              >
                <Check size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-10 h-10 rounded-full border-[2.5px] border-ink/15 text-ink/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
