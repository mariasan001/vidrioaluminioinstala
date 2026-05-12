"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HiArrowUpRight } from "react-icons/hi2";
import styles from "./home-services.module.css";

type ServiceTransitionLinkProps = {
  href: string;
  label: string;
  transition?: boolean;
};

export function ServiceTransitionLink({
  href,
  label,
  transition = false,
}: ServiceTransitionLinkProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!transition || href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    setIsLeaving(true);

    window.setTimeout(() => {
      router.push(href);
    }, 560);
  };

  return (
    <>
      <a
        className={styles.arrow}
        href={href}
        aria-label={label}
        onClick={handleClick}
      >
        <HiArrowUpRight aria-hidden="true" />
      </a>

      {isLeaving ? (
        <div className={styles.pageTransition} aria-hidden="true">
          <div className={styles.pageTransitionMark}>
            <HiArrowUpRight aria-hidden="true" />
          </div>
        </div>
      ) : null}
    </>
  );
}

