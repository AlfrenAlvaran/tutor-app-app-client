"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorRosterEntry } from "@/constant/request/type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function useTutorRoster(tutorId: string | null) {
  const [roster, setRoster] = useState<TutorRosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!tutorId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/participation/roster/${tutorId}`,
      );
      if (!res.ok) throw new Error("Unable to load your roster.");
      const data: { roster: TutorRosterEntry[] } = await res.json();
      setRoster(data.roster);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your roster.",
      );
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { roster, loading, error, refresh };
}