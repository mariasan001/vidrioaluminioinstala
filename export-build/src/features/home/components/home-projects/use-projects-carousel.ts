"use client";

import { useEffect, useRef, useState } from "react";

type UseProjectsCarouselOptions = {
  projectCount: number;
};

export function useProjectsCarousel({ projectCount }: UseProjectsCarouselOptions) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const programmaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  const pauseAutoMovement = () => {
    programmaticScrollRef.current = false;
    setIsAutoPaused(true);
  };

  const goToProject = (index: number, shouldPause = true) => {
    if (shouldPause) {
      setIsAutoPaused(true);
    }

    setActiveIndex((index + projectCount) % projectCount);
  };

  useEffect(() => {
    if (isAutoPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % projectCount);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [isAutoPaused, projectCount]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const activeCard = carousel?.querySelector<HTMLElement>(
      `[data-project-index="${activeIndex}"]`,
    );

    if (!carousel || !activeCard) {
      return;
    }

    programmaticScrollRef.current = true;

    if (programmaticTimerRef.current !== null) {
      window.clearTimeout(programmaticTimerRef.current);
    }

    carousel.scrollTo({
      left: activeCard.offsetLeft - (carousel.clientWidth - activeCard.clientWidth) / 2,
      behavior: "smooth",
    });

    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 520);
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }

      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  const syncActiveProjectFromScroll = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const cards = Array.from(
      carousel.querySelectorAll<HTMLElement>("[data-project-index]"),
    );
    const scrollTarget = carousel.scrollLeft + carousel.clientWidth / 2;
    let nearestIndex = activeIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const index = Number(card.dataset.projectIndex);
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - scrollTarget);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  const handleCarouselScroll = () => {
    if (programmaticScrollRef.current) {
      return;
    }

    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      syncActiveProjectFromScroll();
    }, 120);
  };

  return {
    activeIndex,
    carouselRef,
    goToProject,
    handleCarouselScroll,
    pauseAutoMovement,
    setActiveIndex,
  };
}
