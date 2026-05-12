"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

export function useServicesReveal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const serviceRefs = useRef<Array<HTMLElement | null>>([]);
  const hideTimers = useRef<number[]>([]);
  const [isInView, setIsInView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("down");
  const [visibleServices, setVisibleServices] = useState<boolean[]>([]);

  const setServiceRef = (index: number) => (node: HTMLElement | null) => {
    serviceRefs.current[index] = node;
  };

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

  useEffect(() => {
    const serviceCards = serviceRefs.current.filter(Boolean) as HTMLElement[];

    if (serviceCards.length === 0) {
      return;
    }

    const hideTimerList = hideTimers.current;

    setVisibleServices(Array.from({ length: serviceCards.length }, () => false));

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleServices((current) => {
          const next = current.length === serviceCards.length
            ? [...current]
            : Array.from({ length: serviceCards.length }, () => false);

          entries.forEach((entry) => {
            const index = serviceCards.indexOf(entry.target as HTMLElement);

            if (index < 0) {
              return;
            }

            if (entry.isIntersecting) {
              window.clearTimeout(hideTimerList[index]);
              next[index] = true;
            } else {
              window.clearTimeout(hideTimerList[index]);
              hideTimerList[index] = window.setTimeout(() => {
                setVisibleServices((latest) => {
                  const delayedNext = [...latest];
                  delayedNext[index] = false;

                  return delayedNext;
                });
              }, 180);
            }
          });

          return next;
        });
      },
      {
        rootMargin: "-10% 0px -12% 0px",
        threshold: 0.18,
      },
    );

    serviceCards.forEach((serviceCard) => observer.observe(serviceCard));

    return () => {
      hideTimerList.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  return {
    isInView,
    isReady,
    isVisible,
    scrollDirection,
    sectionRef,
    setServiceRef,
    visibleServices,
  };
}
