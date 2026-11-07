"use client";

import { useEffect, useState } from "react";
import { phoneHref, type Servicio } from "./contact-info";
import { PhoneIcon, WhatsAppIcon } from "./contact-icons";
import styles from "./conversion.module.css";

type ContactBarProps = {
  servicio: Servicio;
  whatsappHref: string;
  revealOnScroll?: boolean;
};

export function ContactBar({ servicio, whatsappHref, revealOnScroll = false }: ContactBarProps) {
  const [showBar, setShowBar] = useState(!revealOnScroll);

  useEffect(() => {
    document.body.classList.add("has-contact-bar");

    return () => {
      document.body.classList.remove("has-contact-bar");
    };
  }, []);

  useEffect(() => {
    if (!revealOnScroll) {
      return;
    }

    const target = document.querySelector("[data-hero-actions]");

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBar(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [revealOnScroll]);

  return (
    <div data-servicio={servicio} data-section="sticky">
      <div
        className={`${styles.bar} ${revealOnScroll ? styles.barReveal : ""} ${
          showBar ? styles.barShown : ""
        }`}
        data-ubicacion="sticky"
      >
        <a href={phoneHref} data-ubicacion="sticky">
          <PhoneIcon />
          Llamar
        </a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-ubicacion="sticky">
          <WhatsAppIcon />
          WhatsApp
        </a>
      </div>
      <a
        className={styles.float}
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        data-ubicacion="sticky"
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
    </div>
  );
}
