"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiMiniArrowsPointingIn,
  HiMiniArrowsPointingOut,
  HiMiniPlay,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useSectionReveal } from "../hooks/use-section-reveal";
import styles from "./home-projects.module.css";
import { projectHighlights } from "./home-projects.data";

export function HomeProjects() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const {
    isVisible,
    scrollDirection,
    sectionRef,
  } = useSectionReveal();
  const programmaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const expandedProject =
    expandedIndex === null ? null : projectHighlights[expandedIndex];

  const goToProject = (index: number, shouldPause = true) => {
    if (shouldPause) {
      setIsAutoPaused(true);
    }

    setActiveIndex((index + projectHighlights.length) % projectHighlights.length);
  };

  useEffect(() => {
    if (isAutoPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % projectHighlights.length);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [isAutoPaused]);

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

  useEffect(() => {
    document.body.style.overflow = expandedProject ? "hidden" : "";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedIndex(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [expandedProject]);

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

  const pauseAutoMovement = () => {
    programmaticScrollRef.current = false;
    setIsAutoPaused(true);
  };

  const handleProjectKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    index: number,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    goToProject(index);
  };

  const openProjectViewer = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.stopPropagation();
    pauseAutoMovement();
    setActiveIndex(index);
    setExpandedIndex(index);
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="proyectos"
      aria-labelledby="home-projects-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>trabajos que hablan por si solos</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-projects-title" className={styles.title}>
            Proyectos que muestran
            <span className={styles.accent}>como se transforma un espacio</span>
          </h2>
          <p className={styles.description}>
            Una seleccion visual de instalaciones, detalles y resultados. Aqui
            cada imagen funciona como prueba: materiales correctos, trazos
            limpios y una entrega que se nota en el uso diario.
          </p>
        </div>
      </div>

      <div className={styles.carouselShell}>
        <div className={styles.carouselControls} aria-label="Controles de proyectos">
          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Trabajo anterior"
            onClick={() => goToProject(activeIndex - 1)}
          >
            <HiChevronLeft aria-hidden="true" />
          </button>

          <div className={styles.carouselDots} aria-label="Seleccionar trabajo">
            {projectHighlights.map((project, index) => (
              <button
                type="button"
                key={project.title}
                className={`${styles.carouselDot} ${
                  activeIndex === index ? styles.carouselDotActive : ""
                }`}
                aria-label={`Ver ${project.title}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => goToProject(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Siguiente trabajo"
            onClick={() => goToProject(activeIndex + 1)}
          >
            <HiChevronRight aria-hidden="true" />
          </button>
        </div>

        <div
          ref={carouselRef}
          className={styles.reel}
          aria-label="Galeria de trabajos destacados"
          onPointerDown={pauseAutoMovement}
          onScroll={handleCarouselScroll}
          onWheel={pauseAutoMovement}
        >
          {projectHighlights.map((project, index) => (
            <article
              className={`${styles.projectCard} ${
                activeIndex === index ? styles.projectCardActive : ""
              }`}
              key={project.title}
              data-project-index={index}
              role="button"
              tabIndex={0}
              aria-label={`Seleccionar ${project.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => goToProject(index)}
              onKeyDown={(event) => handleProjectKeyDown(event, index)}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 820px) 82vw, 34vw"
                className={styles.projectImage}
                style={{ objectPosition: project.imagePosition }}
              />

              <div className={styles.projectShade} />

              {project.format === "video" ? (
                <span className={styles.playButton} aria-hidden="true">
                  <HiMiniPlay />
                </span>
              ) : null}

              <div className={styles.projectTop}>
                <span className={styles.projectType}>
                  <HiOutlineSparkles aria-hidden="true" />
                  {project.category}
                </span>
                <button
                  type="button"
                  className={styles.projectAction}
                  aria-label={`Ver imagen completa de ${project.title}`}
                  onClick={(event) => openProjectViewer(event, index)}
                >
                  <HiMiniArrowsPointingOut aria-hidden="true" />
                </button>
              </div>

              <div className={styles.projectCopy}>
                <p>&ldquo;{project.testimonial}&rdquo;</p>
                <div>
                  <strong>{project.customer}</strong>
                  <span>{project.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {expandedProject ? (
        <div
          className={styles.viewerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen completa de ${expandedProject.title}`}
          onClick={() => setExpandedIndex(null)}
        >
          <div className={styles.viewerPanel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.viewerTop}>
              <span className={styles.viewerLabel}>{expandedProject.title}</span>
              <button
                type="button"
                className={styles.viewerClose}
                aria-label="Minimizar imagen"
                onClick={() => setExpandedIndex(null)}
              >
                <HiMiniArrowsPointingIn aria-hidden="true" />
              </button>
            </div>

            <div className={styles.viewerImageWrap}>
              <Image
                src={expandedProject.image}
                alt={expandedProject.title}
                fill
                sizes="100vw"
                className={styles.viewerImage}
                style={{ objectPosition: expandedProject.imagePosition }}
              />
            </div>

            <div className={styles.viewerCopy}>
              <p>&ldquo;{expandedProject.testimonial}&rdquo;</p>
              <span>
                {expandedProject.customer} / {expandedProject.location}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
