"use client";

import { openQuoteDialog } from "@/features/home/components/home-floating-quote/quote-dialog";
import styles from "./service-hero.module.css";

type ServiceHeroQuoteButtonProps = {
  label: string;
  service?: string;
  whatsappHref?: string;
};

export function ServiceHeroQuoteButton({
  label,
  service,
  whatsappHref,
}: ServiceHeroQuoteButtonProps) {
  return (
    <button
      className={styles.primaryAction}
      type="button"
      onClick={() =>
        openQuoteDialog({
          origin: "service_hero_quote_cta",
          service,
          whatsappHref,
        })
      }
    >
      {label}
    </button>
  );
}
