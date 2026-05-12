"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ProjectHighlight } from "./home-projects.data";

type UseProjectViewerOptions = {
  projects: readonly ProjectHighlight[];
};

export function useProjectViewer({ projects }: UseProjectViewerOptions) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const expandedProject =
    expandedIndex === null ? null : projects[expandedIndex];

  function closeProjectViewer() {
    setExpandedIndex(null);

    window.requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    });
  }

  useEffect(() => {
    if (!expandedProject) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      viewerRef.current?.focus();
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProjectViewer();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [expandedProject]);

  const openProjectViewer = (index: number) => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setExpandedIndex(index);
  };

  const keepFocusInsideViewer = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const viewer = viewerRef.current;

    if (!viewer) {
      return;
    }

    const focusableElements = Array.from(
      viewer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);

    if (focusableElements.length === 0) {
      event.preventDefault();
      viewer.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return {
    closeProjectViewer,
    expandedIndex,
    expandedProject,
    keepFocusInsideViewer,
    openProjectViewer,
    viewerRef,
  };
}
