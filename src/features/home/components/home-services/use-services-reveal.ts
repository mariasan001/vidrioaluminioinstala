"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

export function useServicesReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("down");

  useEffect(() => {
    const section = sectionRef.current;
    const readyTimer = window.setTimeout(() => {
      setIsReady(true);
    }, 1300);

    if (!section) {
      window.clearTimeout(readyTimer);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting) {
          setScrollDirection(entry.boundingClientRect.top < 0 ? "up" : "down");
          setIsVisible(true);
        } else {
          setIsReady(true);
        }
      },
      {
        rootMargin: "-8% 0px -8% 0px",
        threshold: 0.12,
      },
    );

    const revealOnRestore = () => {
      setIsVisible(true);
      setIsInView(true);
      setIsReady(true);
    };

    observer.observe(section);
    window.addEventListener("pageshow", revealOnRestore);

    return () => {
      window.clearTimeout(readyTimer);
      observer.disconnect();
      window.removeEventListener("pageshow", revealOnRestore);
    };
  }, []);

  return { isInView, isReady, isVisible, scrollDirection, sectionRef };
}
