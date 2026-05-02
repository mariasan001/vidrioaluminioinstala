 "use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";
import styles from "./home-empathy.module.css";
import { empathyPillars } from "./home-empathy.data";

export function HomeEmpathy() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const visiblePillars = empathyPillars.slice(0, 3);
  const pillarIcons = [
    HiOutlineSparkles,
    HiOutlineChatBubbleLeftRight,
    HiOutlineShieldCheck,
  ] as const;

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.22,
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.scrollDown} ${isVisible ? styles.sectionVisible : ""}`}
      id="somos"
      aria-labelledby="home-empathy-title"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>pensado para conectar contigo</span>
        </div>

        <div className={styles.copy}>
          <h2 id="home-empathy-title" className={styles.title}>
            Queremos que tu espacio
            <span className={styles.accent}>se sienta tan bien como se ve</span>
          </h2>

          <p className={styles.description}>
            Sabemos que no solo buscas aluminio y vidrio. Buscas sentirte
            orgulloso de tu casa o negocio, invertir con confianza y ver un
            resultado que realmente refleje lo que imaginaste.
          </p>
        </div>

        <div className={styles.pillars}>
          {visiblePillars.map((pillar, index) => (
            <article key={pillar.label} className={styles.pillar}>
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
