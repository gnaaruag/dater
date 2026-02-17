"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, CalendarPlus, Check, X } from "lucide-react";
import type { Dater, Note } from "@/lib/types";
import {
  getAllDaters,
  getNotesForDater,
  requestPersistence,
  deleteDater,
} from "@/lib/db";
import DaterSelector from "@/components/DaterSelector";
import DaterDisplay from "@/components/DaterDisplay";
import CalendarView from "@/components/CalendarView";
import NoteTimeline from "@/components/NoteTimeline";
import CreateDaterModal from "@/components/CreateDaterModal";

export default function Home() {
  const [daters, setDaters] = useState<Dater[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selected = daters.find((d) => d.id === selectedId) || null;

  // Load daters on mount
  useEffect(() => {
    requestPersistence();
    loadDaters();
  }, []);

  async function loadDaters() {
    const all = await getAllDaters();
    // Sort by creation date, newest first
    all.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setDaters(all);
    if (all.length > 0 && !selectedId) {
      setSelectedId(all[0].id);
    }
    setLoaded(true);
  }

  // Load notes when selection changes
  const loadNotes = useCallback(async () => {
    if (!selectedId) {
      setNotes([]);
      return;
    }
    const n = await getNotesForDater(selectedId);
    setNotes(n);
  }, [selectedId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  function handleDaterCreated(dater: Dater) {
    setDaters((prev) => [dater, ...prev]);
    setSelectedId(dater.id);
  }

  async function handleDeleteDater() {
    if (!selectedId) return;
    await deleteDater(selectedId);
    const remaining = daters.filter((d) => d.id !== selectedId);
    setDaters(remaining);
    setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    setShowDeleteConfirm(false);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-2xl font-semibold text-ink/30">dater</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b-[2.5px] border-ink">
        <h1 className="text-3xl font-bold tracking-tight text-ink">dater</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="w-10 h-10 rounded-full border-[2.5px] border-dater-orange text-dater-orange flex items-center justify-center hover:bg-dater-orange hover:text-white transition-colors"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* Selector */}
      <DaterSelector
        daters={daters}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Main content */}
      {selected ? (
        <>
          <DaterDisplay dater={selected} />
          <CalendarView dater={selected} />

          {/* Divider */}
          <div className="mx-6 border-t-[2px] border-ink/10" />

          <div className="pt-5">
            <NoteTimeline
              daterId={selected.id}
              color={selected.color}
              notes={notes}
              onNotesChange={loadNotes}
            />
          </div>

          {/* Delete dater */}
          <div className="px-6 pb-10 pt-4 flex justify-center">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-dater-red/60 hover:text-dater-red transition-colors"
            >
              <Trash2 size={15} strokeWidth={2} />
              delete dater
            </button>
          </div>

          {/* Delete dater modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-ink/20 animate-fade-in"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <div className="relative bg-cream rounded-2xl border-[2.5px] border-ink px-6 py-5 max-w-xs w-full mx-6 animate-slide-up text-center">
                <p className="text-lg font-semibold mb-1">delete this dater?</p>
                <p className="text-sm text-ink/40 mb-5">all notes will be lost</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleDeleteDater}
                    className="w-10 h-10 rounded-full border-[2.5px] border-dater-red bg-dater-red text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  >
                    <Check size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-10 h-10 rounded-full border-[2.5px] border-ink/15 text-ink/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <CalendarPlus size={44} className="text-dater-orange/40 mb-4" strokeWidth={1.5} />
          <p className="text-xl text-ink/40 italic leading-relaxed">
            create your first dater<br />to start tracking
          </p>
        </div>
      )}

      {/* Create modal */}
      <CreateDaterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleDaterCreated}
      />
    </div>
  );
}
