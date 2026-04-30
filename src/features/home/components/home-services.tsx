"use client";

import Image from "next/image";
import {
  HiArrowUpRight,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineViewColumns,
  HiOutlineWindow,
} from "react-icons/hi2";
import { FaDoorOpen, FaShower } from "react-icons/fa6";
import styles from "./home-services.module.css";
import { services } from "./home-services.data";

export function HomeServices() {
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

  return (
    <section
      className={styles.section}
      id="servicios"
      aria-labelledby="home-services-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>servicios que si se notan</span>
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
                      <span className={styles.arrow} aria-hidden="true">
                        <HiArrowUpRight />
                      </span>
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
                    <span className={styles.arrow} aria-hidden="true">
                      <HiArrowUpRight />
                    </span>
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
