import { openDB, type IDBPDatabase } from "idb";
import type { Dater, Note } from "./types";

const DB_NAME = "dater-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("daters")) {
          db.createObjectStore("daters", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("notes")) {
          const noteStore = db.createObjectStore("notes", { keyPath: "id" });
          noteStore.createIndex("daterId", "daterId", { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

// Request persistent storage on init
export async function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    await navigator.storage.persist();
  }
}

// Daters CRUD
export async function getAllDaters(): Promise<Dater[]> {
  const db = await getDb();
  return db.getAll("daters");
}

export async function getDater(id: string): Promise<Dater | undefined> {
  const db = await getDb();
  return db.get("daters", id);
}

export async function saveDater(dater: Dater): Promise<void> {
  const db = await getDb();
  await db.put("daters", dater);
}

export async function deleteDater(id: string): Promise<void> {
  const db = await getDb();
  // Delete dater
  await db.delete("daters", id);
  // Delete associated notes
  const tx = db.transaction("notes", "readwrite");
  const index = tx.store.index("daterId");
  let cursor = await index.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Notes CRUD
export async function getNotesForDater(daterId: string): Promise<Note[]> {
  const db = await getDb();
  const tx = db.transaction("notes", "readonly");
  const index = tx.store.index("daterId");
  const notes = await index.getAll(daterId);
  await tx.done;
  // Sort newest first
  return notes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDb();
  await db.put("notes", note);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("notes", id);
}
