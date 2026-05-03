"use client";

import Image from "next/image";
import { HiArrowUpRight } from "react-icons/hi2";
import styles from "./home-services.module.css";
import type { ServiceItem } from "./home-services.data";
import { serviceIcons } from "./home-services.icons";

type ServiceCardProps = {
  className: string;
  service: ServiceItem;
  showImage?: boolean;
};

export function ServiceCard({
  className,
  service,
  showImage = false,
}: ServiceCardProps) {
  const Icon = serviceIcons[service.title];

  return (
    <article className={className}>
      <div className={styles.copy}>
        <div className={styles.copyTop}>
          <div className={styles.labelRow}>
            <span className={styles.label}>
              <Icon className={styles.labelIcon} aria-hidden="true" />
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

      {showImage ? (
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
      ) : null}
    </article>
  );
}
