"use client";

import Image from "next/image";
import {
  HiChevronLeft,
  HiChevronRight,
  HiMiniArrowsPointingIn,
  HiMiniArrowsPointingOut,
  HiMiniPlay,
  HiOutlineSparkles,
} from "react-icons/hi2";
import styles from "./home-projects.module.css";
import { projectsContent } from "./home-projects.data";
import { useProjectViewer } from "./use-project-viewer";
import { useProjectsCarousel } from "./use-projects-carousel";
import { useProjectsReveal } from "./use-projects-reveal";

export function HomeProjects() {
  const {
    isVisible,
    scrollDirection,
    sectionRef,
    isInView,
    isReady,
  } = useProjectsReveal();
  const projects = projectsContent.items;
  const {
    activeIndex,
    carouselRef,
    goToProject,
    handleCarouselScroll,
    pauseAutoMovement,
    setActiveIndex,
  } = useProjectsCarousel({ projectCount: projects.length });
  const {
    closeProjectViewer,
    expandedProject,
    openProjectViewer: openViewer,
  } = useProjectViewer({ projects });

  const openProjectViewer = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.stopPropagation();
    pauseAutoMovement();
    setActiveIndex(index);
    openViewer(index);
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-in-view={isInView}
      data-ready={isReady}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="proyectos"
      aria-labelledby="home-projects-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>{projectsContent.eyebrow}</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-projects-title" className={styles.title}>
            {projectsContent.title}
            <span className={styles.accent}>{projectsContent.accentTitle}</span>
          </h2>
          <p className={styles.description}>{projectsContent.description}</p>
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
            {projects.map((project, index) => (
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
          aria-label="Galería de trabajos destacados"
          onPointerDown={pauseAutoMovement}
          onScroll={handleCarouselScroll}
          onWheel={pauseAutoMovement}
        >
          {projects.map((project, index) => (
            <article
              className={`${styles.projectCard} ${
                activeIndex === index ? styles.projectCardActive : ""
              }`}
              key={project.title}
              data-project-index={index}
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
          onClick={closeProjectViewer}
        >
          <div className={styles.viewerPanel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.viewerTop}>
              <span className={styles.viewerLabel}>{expandedProject.title}</span>
              <button
                type="button"
                className={styles.viewerClose}
                aria-label="Minimizar imagen"
                onClick={closeProjectViewer}
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
