"use client";

import type { Ref } from "react";
import Image from "next/image";
import styles from "./home-services.module.css";
import type { ServiceItem } from "./home-services.data";
import { serviceIcons } from "./home-services.icons";
import { ServiceTransitionLink } from "./service-transition-link";

type ServiceCardProps = {
  cardRef?: Ref<HTMLElement>;
  className: string;
  service: ServiceItem;
  showMobileImage?: boolean;
  showImage?: boolean;
};

export function ServiceCard({
  cardRef,
  className,
  service,
  showMobileImage = false,
  showImage = false,
}: ServiceCardProps) {
  const Icon = serviceIcons[service.title];
  const hasImage = showImage || showMobileImage;

  return (
    <article
      ref={cardRef}
      className={className}
      data-has-image={showImage}
      data-has-mobile-image={showMobileImage}
    >
      <div className={styles.copy}>
        <div className={styles.copyTop}>
          <div className={styles.labelRow}>
            <span className={styles.label}>
              <Icon className={styles.labelIcon} aria-hidden="true" />
              <span>{service.title}</span>
            </span>
            <ServiceTransitionLink
              href={service.href}
              label={service.ctaLabel}
              transition={service.title === "barandales"}
            />
          </div>

          <p className={styles.cardDescription}>{service.description}</p>
        </div>
      </div>

      {hasImage ? (
        <div
          className={styles.circleImageWrap}
          data-mobile-only={showMobileImage && !showImage}
        >
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 540px) 86vw, (max-width: 820px) 42vw, 190px"
            className={styles.image}
            style={{ objectPosition: service.imagePosition }}
          />
        </div>
      ) : null}
    </article>
  );
}
