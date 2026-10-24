/**
 * projectService.js — Reusable Firestore operations and Drive link helper
 * Abstracts all CRUD operations and real-time subscription for projects.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Extracts Google Drive file ID from standard share URLs or direct IDs.
 * Supported patterns:
 *  - /d/{FILE_ID}/
 *  - id={FILE_ID}
 *  - direct file ID (20+ alphanumeric chars)
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Pattern 1: /d/{FILE_ID} (e.g. https://drive.google.com/file/d/1a2B.../view)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 2: id={FILE_ID} (e.g. https://drive.google.com/open?id=1a2B...)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Pattern 3: Direct File ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Formats Google Drive preview embed URL from file ID
 */
export function getDrivePreviewUrl(fileId) {
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Real-time Firestore subscription to projects collection
 */
export function subscribeToProjects(onData, onError) {
  if (!db) {
    onData([]);
    return () => {};
  }

  const q = query(collection(db, "projects"), orderBy("order", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const projects = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(projects);
    },
    (err) => {
      console.error("Firestore subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Adds a new project to Firestore
 */
export async function createProject(projectData) {
  if (!db) throw new Error("Firebase is not initialized.");

  const payload = {
    ...projectData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "projects"), payload);
  return docRef.id;
}

/**
 * Updates an existing project in Firestore
 */
export async function updateProject(id, projectData) {
  if (!db) throw new Error("Firebase is not initialized.");
  const docId = String(id).trim();
  if (!docId) throw new Error("Invalid project ID.");

  const payload = {
    ...projectData,
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, "projects", docId);
  await updateDoc(docRef, payload);
  return docId;
}

/**
 * Deletes a project from Firestore
 */
export async function deleteProject(id) {
  if (!db) throw new Error("Firebase is not initialized.");
  const docId = String(id).trim();
  if (!docId) throw new Error("Invalid project ID.");

  const docRef = doc(db, "projects", docId);
  await deleteDoc(docRef);
  return docId;
}
