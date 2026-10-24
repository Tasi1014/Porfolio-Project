/**
 * useProjects.js — Real-time Firestore projects listener
 * Directly listens to Firestore 'projects' collection.
 * No hardcoded fallback — displays empty state when Firestore is empty.
 * Returns { projects, loading, error }
 */

import { useState, useEffect } from "react";
import { subscribeToProjects } from "../services/projectService";
import { db } from "../lib/firebase";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const unsub = subscribeToProjects(
      (data) => {
        setProjects(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error in useProjects:", err);
        setError(err.message);
        setProjects([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { projects, loading, error };
}
