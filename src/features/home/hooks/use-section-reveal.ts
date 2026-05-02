"use client";

import { useEffect, useRef, useState } from "react";

export function useSectionReveal(threshold = 0.16) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrollDirection(entry.boundingClientRect.top < 0 ? "up" : "down");
          setIsVisible(true);
        }
      },
      {
        rootMargin: "-8% 0px -8% 0px",
        threshold,
      },
    );

    const revealOnRestore = () => {
      setIsVisible(true);
    };

    observer.observe(section);
    window.addEventListener("pageshow", revealOnRestore);

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", revealOnRestore);
    };
  }, [threshold]);

  return { isVisible, scrollDirection, sectionRef };
}
