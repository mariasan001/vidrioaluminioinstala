"use client";

import { useEffect, useRef, useState } from "react";

export function useSectionReveal(threshold = 0.16) {
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
        rootMargin: "-8% 0px -8% 0px",
        threshold,
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
  }, [threshold]);

  return { isVisible, scrollDirection, sectionRef };
}
