import type { ReactNode } from "react";
import type { Ubicacion } from "@/features/conversion/contact-info";
import { PhoneIcon, WhatsAppIcon } from "@/features/conversion/contact-icons";
import { barandalesPhoneDisplay, barandalesPhoneHref } from "./barandales-landing.data";

type WhatsappLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  ubicacion: Ubicacion;
};

export function BarandalesWhatsappLink({ children, className, href, ubicacion }: WhatsappLinkProps) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-servicio="barandales"
      data-ubicacion={ubicacion}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

export function BarandalesPhoneLink({
  className,
  label = "Teléfono",
  showNumber = true,
  ubicacion,
}: {
  className?: string;
  label?: string;
  showNumber?: boolean;
  ubicacion: Ubicacion;
}) {
  return (
    <a className={className} href={barandalesPhoneHref} data-servicio="barandales" data-ubicacion={ubicacion}>
      <PhoneIcon />
      {showNumber ? `${label}: ${barandalesPhoneDisplay}` : label}
    </a>
  );
}
