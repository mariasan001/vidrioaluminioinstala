"use client";

import Image from "next/image";
import styles from "./home-services.module.css";
import { servicesContent } from "./home-services.data";
import { ServiceCard } from "./service-card";
import { useServicesReveal } from "./use-services-reveal";

export function HomeServices() {
  const {
    isInView,
    isReady,
    isVisible,
    scrollDirection,
    sectionRef,
    setServiceRef,
    visibleServices,
  } = useServicesReveal();
  const topServices = servicesContent.items.slice(0, 3);
  const bottomServices = servicesContent.items.slice(3, 6);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-in-view={isInView}
      data-ready={isReady}
      data-visible={isVisible}
      data-scroll-direction={scrollDirection}
      id="servicios"
      aria-labelledby="home-services-title"
    >
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>{servicesContent.eyebrow}</span>
        </div>

        <div className={styles.heading}>
          <h2 id="home-services-title" className={styles.title}>
            <span className={styles.titleLine}>{servicesContent.title}</span>
            <span className={styles.accent}>{servicesContent.accentTitle}</span>
          </h2>
          <p className={styles.description}>{servicesContent.description}</p>
        </div>
      </div>

      <div className={styles.showcase}>
        <div className={styles.topShowcase}>
          <div className={styles.topGrid}>
            {topServices.map((service) => (
              <ServiceCard
                key={service.title}
                cardRef={setServiceRef(servicesContent.items.indexOf(service))}
                className={`${styles.topCard} ${visibleServices[servicesContent.items.indexOf(service)] ? styles.mobileServiceVisible : ""}`}
                service={service}
                showMobileImage
              />
            ))}
          </div>

          <div className={styles.sharedImageCard}>
            <div className={styles.sharedImageWrap}>
              <Image
                src={servicesContent.sharedImage.src}
                alt={servicesContent.sharedImage.alt}
                fill
                sizes="100vw"
                className={styles.image}
                style={{ objectPosition: servicesContent.sharedImage.position }}
              />
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          {bottomServices.map((service) => {
            const serviceIndex = servicesContent.items.indexOf(service);

            return (
            <ServiceCard
              key={service.title}
              cardRef={setServiceRef(serviceIndex)}
              className={`${styles.bottomCard} ${visibleServices[serviceIndex] ? styles.mobileServiceVisible : ""}`}
              service={service}
              showImage
            />
            );
          })}
        </div>
      </div>
    </section>
  );
}
