"use client";

import { useEffect, useState } from "react";
import { AutomatedActionDefinition } from "@/types/workflow";
import { fetchAutomations } from "@/lib/api/workflow-api";

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomatedActionDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAutomations();
        setAutomations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load automations.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return { automations, isLoading, error };
}
