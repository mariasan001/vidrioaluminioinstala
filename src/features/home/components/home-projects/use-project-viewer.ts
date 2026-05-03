"use client";

import { useEffect, useState } from "react";
import type { ProjectHighlight } from "./home-projects.data";

type UseProjectViewerOptions = {
  projects: readonly ProjectHighlight[];
};

export function useProjectViewer({ projects }: UseProjectViewerOptions) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const expandedProject =
    expandedIndex === null ? null : projects[expandedIndex];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (expandedProject) {
      document.body.style.overflow = "hidden";
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedIndex(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [expandedProject]);

  const closeProjectViewer = () => {
    setExpandedIndex(null);
  };

  const openProjectViewer = (index: number) => {
    setExpandedIndex(index);
  };

  return {
    closeProjectViewer,
    expandedIndex,
    expandedProject,
    openProjectViewer,
  };
}
