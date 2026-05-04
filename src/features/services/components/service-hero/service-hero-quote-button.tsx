"use client";

import { openQuoteDialog } from "@/features/home/components/home-floating-quote/quote-dialog";
import styles from "./service-hero.module.css";

type ServiceHeroQuoteButtonProps = {
  label: string;
};

export function ServiceHeroQuoteButton({
  label,
}: ServiceHeroQuoteButtonProps) {
  return (
    <button
      className={styles.primaryAction}
      type="button"
      onClick={openQuoteDialog}
    >
      {label}
    </button>
  );
}
