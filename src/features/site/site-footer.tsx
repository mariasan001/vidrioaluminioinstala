import Image from "next/image";
import { FaFacebookF } from "react-icons/fa6";
import { PhoneIcon, WhatsAppIcon } from "@/features/conversion/contact-icons";
import { addressLabel, mapsHref, phoneDisplay, phoneHref } from "@/features/conversion/contact-info";
import { businessInfo } from "@/features/home/home-seo";
import { whatsappDirectUrl } from "@/features/home/components/home-floating-quote/home-floating-quote.data";
import styles from "./site-footer.module.css";

const services = [
  { href: "/servicios/canceles-de-bano", label: "Canceles de baño" },
  { href: "/servicios/ventanas", label: "Ventanas de aluminio" },
  { href: "/servicios/barandales", label: "Barandales" },
  { href: "/servicios/fachadas-de-cristal", label: "Fachadas de cristal" },
  { href: "/servicios/pergolas", label: "Pérgolas" },
  { href: "/servicios/puertas", label: "Puertas" },
] as const;

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer} data-ubicacion="footer" data-section="footer">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <a href="/" aria-label="Aluminio y Vidrio Instala">
            <Image src="/img/logo-nav.webp" alt="" width={188} height={62} className={styles.logo} />
          </a>
          <p>Instalación de aluminio y vidrio en Toluca y Metepec desde hace 8 años.</p>
          <a
            className={styles.facebook}
            href={businessInfo.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF aria-hidden="true" />
          </a>
        </div>

        <nav aria-label="Servicios">
          <p className={styles.title}>Servicios</p>
          <ul className={styles.list}>
            {services.map((service) => (
              <li key={service.href}>
                <a href={service.href}>{service.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={styles.title}>Contacto</p>
          <ul className={styles.list}>
            <li>
              <a className={styles.contactLink} href={phoneHref} data-ubicacion="footer">
                <PhoneIcon />
                <span>Llamar {phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                className={styles.contactLink}
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-ubicacion="footer"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a className={styles.contactLink} href={mapsHref} target="_blank" rel="noopener noreferrer">
                <PinIcon />
                <span>{addressLabel}</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className={styles.title}>Horario</p>
          <p className={styles.hours}>Lunes a sábado 8:00–18:00</p>
          <p className={styles.hours}>Domingo cerrado</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 Aluminio y Vidrio Instala</p>
        <a href="/aviso-de-privacidad">Aviso de privacidad</a>
        <p className={styles.credit}>Desarrollado por Aurenna</p>
      </div>
    </footer>
  );
}
