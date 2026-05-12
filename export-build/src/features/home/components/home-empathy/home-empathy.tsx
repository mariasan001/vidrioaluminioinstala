"use client";

import type { CSSProperties } from "react";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";
import styles from "./home-empathy.module.css";
import { empathyContent } from "./home-empathy.data";
import { useEmpathyReveal } from "./use-empathy-reveal";

const pillarIcons = [
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
] as const;

export function HomeEmpathy() {
  const {
    isInView,
    isReady,
    isVisible,
    sectionRef,
    setPillarRef,
    visiblePillarCount,
    visiblePillars,
  } = useEmpathyReveal();
  const lastVisiblePillar = visiblePillars.reduce(
    (latestIndex, isPillarVisible, index) => (
      isPillarVisible ? index : latestIndex
    ),
    -1,
  );
  const lineProgress = Math.max(
    visiblePillarCount > 0 ? 0.18 : 0,
    (lastVisiblePillar + 1) / empathyContent.pillars.length,
  );
  const pillarsStyle = {
    "--empathy-line-progress": lineProgress,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.scrollDown} ${isVisible ? styles.sectionVisible : ""} ${isReady ? styles.sectionReady : ""} ${isInView ? styles.sectionInView : styles.sectionOutView}`}
      id="somos"
      aria-labelledby="home-empathy-title"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>{empathyContent.eyebrow}</span>
        </div>

        <div className={styles.copy}>
          <h2 id="home-empathy-title" className={styles.title}>
            {empathyContent.title}
            <span className={styles.accent}>{empathyContent.accentTitle}</span>
          </h2>

          <p className={styles.description}>{empathyContent.description}</p>
        </div>

        <div className={styles.pillars} style={pillarsStyle}>
          {empathyContent.pillars.map((pillar, index) => (
            <article
              key={pillar.label}
              ref={setPillarRef(index)}
              className={`${styles.pillar} ${visiblePillars[index] ? styles.mobilePillarVisible : ""}`}
            >
              {(() => {
                const Icon = pillarIcons[index];

                return (
                  <>
                    <div className={styles.pillarTop}>
                      <span className={styles.pillarIconWrap} aria-hidden="true">
                        <Icon className={styles.pillarIcon} />
                      </span>
                      <span className={styles.pillarNumber}>
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <span className={styles.pillarEyebrow}>{pillar.eyebrow}</span>
                    <p className={styles.pillarText}>{pillar.label}</p>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
