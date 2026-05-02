"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  HiArrowUpRight,
  HiOutlineBuildingOffice2,
  HiOutlineSun,
  HiOutlineViewColumns,
  HiOutlineWindow,
} from "react-icons/hi2";
import { FaDoorOpen, FaShower } from "react-icons/fa6";
import styles from "./home-services.module.css";
import { services } from "./home-services.data";

export function HomeServices() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const topServices = services.slice(0, 3);
  const bottomServices = services.slice(3, 6);
  const serviceIcons = {
    barandales: HiOutlineViewColumns,
    "canceles de bano": FaShower,
    fachadas: HiOutlineBuildingOffice2,
    pergolas: HiOutlineSun,
    puertas: FaDoorOpen,
    ventanas: HiOutlineWindow,
  } as const;

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
        threshold: 0.12,
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
      className={styles.section}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="servicios"
      aria-labelledby="home-services-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>catalogo de soluciones</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-services-title" className={styles.title}>
            <span className={styles.titleLine}>Soluciones para transformar</span>
            <span className={styles.accent}>tu espacio en aluminio y vidrio</span>
          </h2>
          <p className={styles.description}>
            Explora cada servicio y acercate a una solucion pensada para tu
            proyecto: medidas claras, instalacion precisa y acabados que se
            sienten limpios desde el primer vistazo.
          </p>
        </div>
      </div>

      <div className={styles.showcase}>
        <div className={styles.topShowcase}>
          <div className={styles.topGrid}>
            {topServices.map((service) => (
              <article key={service.title} className={styles.topCard}>
                <div className={styles.copy}>
                  <div className={styles.copyTop}>
                    <div className={styles.labelRow}>
                      <span className={styles.label}>
                        {(() => {
                          const Icon = serviceIcons[service.title];
                          return <Icon className={styles.labelIcon} aria-hidden="true" />;
                        })()}
                        <span>{service.title}</span>
                      </span>
                      <a
                        className={styles.arrow}
                        href={service.href}
                        aria-label={service.ctaLabel}
                      >
                        <HiArrowUpRight aria-hidden="true" />
                      </a>
                    </div>

                    <p className={styles.cardDescription}>{service.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.sharedImageCard}>
            <div className={styles.sharedImageWrap}>
              <Image
                src="/img/img_servios_3.png"
                alt="Servicios de aluminio y vidrio"
                fill
                sizes="100vw"
                className={styles.image}
                style={{ objectPosition: "center 42%" }}
              />
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          {bottomServices.map((service) => (
            <article key={service.title} className={styles.bottomCard}>
              <div className={styles.copy}>
                <div className={styles.copyTop}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>
                      {(() => {
                        const Icon = serviceIcons[service.title];
                        return <Icon className={styles.labelIcon} aria-hidden="true" />;
                      })()}
                      <span>{service.title}</span>
                    </span>
                    <a
                      className={styles.arrow}
                      href={service.href}
                      aria-label={service.ctaLabel}
                    >
                      <HiArrowUpRight aria-hidden="true" />
                    </a>
                  </div>

                  <p className={styles.cardDescription}>{service.description}</p>
                </div>
              </div>

              <div className={styles.circleImageWrap}>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 820px) 100vw, 33vw"
                  className={styles.image}
                  style={{ objectPosition: service.imagePosition }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
