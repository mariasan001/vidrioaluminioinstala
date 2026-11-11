"use client";

import { useEffect, useRef, useState } from "react";

type SectionRevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

/** Shared section-in-view reveal for service/home blocks. */
export function useSectionReveal(thresholdOrOptions: number | SectionRevealOptions = 0.16) {
  const options =
    typeof thresholdOrOptions === "number"
      ? { threshold: thresholdOrOptions, rootMargin: "-8% 0px -8% 0px" }
      : {
          threshold: thresholdOrOptions.threshold ?? 0.16,
          rootMargin: thresholdOrOptions.rootMargin ?? "-8% 0px -8% 0px",
        };
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const currentDirectionRef = useRef<"up" | "down">("down");
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const updateScrollDirection = () => {
      const nextScrollY = window.scrollY;
      const direction =
        nextScrollY > lastScrollYRef.current ? "down" : "up";

      currentDirectionRef.current = direction;
      setScrollDirection(direction);
      lastScrollYRef.current = nextScrollY;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrollDirection(currentDirectionRef.current);
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      },
    );

    const revealOnRestore = () => {
      setIsVisible(true);
    };

    lastScrollYRef.current = window.scrollY;
    observer.observe(section);
    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    window.addEventListener("pageshow", revealOnRestore);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollDirection);
      window.removeEventListener("pageshow", revealOnRestore);
    };
  }, [options.rootMargin, options.threshold]);

  return { isVisible, scrollDirection, sectionRef };
}
