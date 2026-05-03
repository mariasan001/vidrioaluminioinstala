"use client";

import { useEffect, useRef, useState } from "react";
import type { NavItem } from "./home-nav.data";

const defaultHref = "#inicio";

export function useActiveSection(links: readonly NavItem[]) {
  const [activeHref, setActiveHref] = useState(defaultHref);
  const activeHrefRef = useRef(defaultHref);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateActiveSection = () => {
      const readingLine = window.scrollY + Math.min(window.innerHeight * 0.38, 340);
      let nextActiveHref = defaultHref;

      links.forEach((link) => {
        if (!link.sectionId) {
          return;
        }

        const section = document.getElementById(link.sectionId);

        if (!section) {
          return;
        }

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= readingLine) {
          nextActiveHref = link.href;
        }
      });

      if (activeHrefRef.current !== nextActiveHref) {
        activeHrefRef.current = nextActiveHref;
        setActiveHref(nextActiveHref);
      }
    };

    const queueActiveSectionUpdate = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        updateActiveSection();
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", queueActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", queueActiveSectionUpdate);
    window.addEventListener("hashchange", queueActiveSectionUpdate);

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }

      window.removeEventListener("scroll", queueActiveSectionUpdate);
      window.removeEventListener("resize", queueActiveSectionUpdate);
      window.removeEventListener("hashchange", queueActiveSectionUpdate);
    };
  }, [links]);

  const setActiveSection = (href: string) => {
    activeHrefRef.current = href;
    setActiveHref(href);
  };

  return { activeHref, setActiveSection };
}
