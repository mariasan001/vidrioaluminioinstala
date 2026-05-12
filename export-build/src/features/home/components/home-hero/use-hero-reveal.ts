"use client";

import { useEffect, useRef, useState } from "react";

export function useHeroReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasRevealed, setHasRevealed] = useState(true);
  const [isInView, setIsInView] = useState(true);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const introTimer = window.setTimeout(() => {
      setIntroDone(true);
    }, 2400);

    if (!section) {
      window.clearTimeout(introTimer);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting) {
          setHasRevealed(true);
        } else {
          setIntroDone(true);
        }
      },
      {
        rootMargin: "-12% 0px -18% 0px",
        threshold: 0.18,
      },
    );

    const revealOnRestore = () => {
      setHasRevealed(true);
      setIsInView(true);
      setIntroDone(true);
    };

    observer.observe(section);
    window.addEventListener("pageshow", revealOnRestore);

    return () => {
      window.clearTimeout(introTimer);
      observer.disconnect();
      window.removeEventListener("pageshow", revealOnRestore);
    };
  }, []);

  return { hasRevealed, introDone, isInView, sectionRef };
}
