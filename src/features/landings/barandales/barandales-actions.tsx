"use client";

import type { ReactNode } from "react";
import { trackPhoneClick, trackWhatsappClick } from "@/features/analytics";
import { openQuoteDialog } from "@/features/home/components/home-floating-quote/quote-dialog";
import {
  barandalesPhoneDisplay,
  barandalesPhoneHref,
  barandalesServiceName,
  barandalesWhatsapp,
} from "./barandales-landing.data";

type WhatsappLinkProps = {
  children: ReactNode;
  className?: string;
  ctaType: string;
  href: string;
  placement: string;
};

export function BarandalesWhatsappLink({
  children,
  className,
  ctaType,
  href,
  placement,
}: WhatsappLinkProps) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackWhatsappClick({
          ctaType,
          href,
          placement,
          service: barandalesServiceName,
        })
      }
    >
      {children}
    </a>
  );
}

export function BarandalesQuoteButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={() =>
        openQuoteDialog({
          origin: "landing_quote_cta",
          service: barandalesServiceName,
          whatsappHref: barandalesWhatsapp.quote,
        })
      }
    >
      {children}
    </button>
  );
}

export function BarandalesPhoneLink({
  className,
  label = "Teléfono",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      className={className}
      href={barandalesPhoneHref}
      onClick={() =>
        trackPhoneClick({
          href: barandalesPhoneHref,
          placement: "landing",
          service: barandalesServiceName,
        })
      }
    >
      {label}: {barandalesPhoneDisplay}
    </a>
  );
}
