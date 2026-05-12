"use client";

import { useEffect, useRef, useState } from "react";

export function useEmpathyReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pillarRefs = useRef<Array<HTMLElement | null>>([]);
  const hideTimers = useRef<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [visiblePillars, setVisiblePillars] = useState<boolean[]>([]);

  const setPillarRef = (index: number) => (node: HTMLElement | null) => {
    pillarRefs.current[index] = node;
  };

  useEffect(() => {
    const section = sectionRef.current;
    const readyTimer = window.setTimeout(() => {
      setIsReady(true);
    }, 1700);

    if (!section) {
      window.clearTimeout(readyTimer);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsReady(true);
        }
      },
      {
        rootMargin: "-8% 0px -12% 0px",
        threshold: 0.18,
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

  useEffect(() => {
    const pillars = pillarRefs.current.filter(Boolean) as HTMLElement[];

    if (pillars.length === 0) {
      return;
    }

    const hideTimerList = hideTimers.current;

    setVisiblePillars(Array.from({ length: pillars.length }, () => false));

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePillars((current) => {
          const next = current.length === pillars.length
            ? [...current]
            : Array.from({ length: pillars.length }, () => false);

          entries.forEach((entry) => {
            const index = pillars.indexOf(entry.target as HTMLElement);

            if (index >= 0) {
              if (entry.isIntersecting) {
                window.clearTimeout(hideTimerList[index]);
                next[index] = true;
              } else {
                window.clearTimeout(hideTimerList[index]);
                hideTimerList[index] = window.setTimeout(() => {
                  setVisiblePillars((latest) => {
                    const delayedNext = [...latest];
                    delayedNext[index] = false;

                    return delayedNext;
                  });
                }, 220);
              }
            }
          });

          return next;
        });
      },
      {
        rootMargin: "-8% 0px -10% 0px",
        threshold: 0.16,
      },
    );

    pillars.forEach((pillar) => observer.observe(pillar));

    return () => {
      hideTimerList.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  const visiblePillarCount = visiblePillars.filter(Boolean).length;

  return {
    isInView,
    isReady,
    isVisible,
    sectionRef,
    setPillarRef,
    visiblePillarCount,
    visiblePillars,
  };
}
