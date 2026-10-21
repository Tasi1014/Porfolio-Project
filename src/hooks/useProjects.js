/**
 * useProjects.js — Real-time Firestore projects listener
 * Replaces the static src/data/projects.js import.
 * Returns { projects, loading, error }
 */

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import fallbackProjects from "../data/projects";

export function useProjects() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setProjects(fallbackProjects);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "projects"), orderBy("order", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProjects(data);
        } else {
          setProjects(fallbackProjects);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error, falling back to static projects:", err);
        setError(err.message);
        setProjects(fallbackProjects);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { projects, loading, error };
}
