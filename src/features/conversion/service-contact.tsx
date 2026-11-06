import {
  addressLabel,
  hoursLabel,
  mapsHref,
  phoneDisplay,
  phoneHref,
  type Servicio,
} from "./contact-info";
import { ShortQuoteForm } from "./short-quote-form";
import { PhoneIcon, WhatsAppIcon } from "./contact-icons";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ServiceContactProps = {
  servicio: Servicio;
  title: string;
  accent?: string;
  description: string;
  whatsappHref: string;
  unifiedHeadings?: boolean;
  whatsappNote?: string;
  callbackSubject?: string;
};

export function ServiceContact({
  servicio,
  title,
  accent,
  description,
  whatsappHref,
  unifiedHeadings = false,
  whatsappNote = "Mándanos medidas o una foto de tu regadera",
  callbackSubject,
}: ServiceContactProps) {
  return (
    <section className={styles.contact} id="contacto" aria-labelledby="contacto-title" data-servicio={servicio} data-ubicacion="contacto">
      {unifiedHeadings ? (
        <SectionHeading accent={accent} description={description} title={title} titleId="contacto-title" />
      ) : (
        <>
          <p className={styles.kicker}>Contacto</p>
          <h2 className={styles.sectionTitle} id="contacto-title">
            {title}
          </h2>
          <p className={styles.contactLead}>{description}</p>
        </>
      )}
      {unifiedHeadings ? (
        <div className={styles.callbackLayout}>
          <div className={styles.callbackDirect}>
            <a
              className={styles.callbackWhatsapp}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-ubicacion="contacto"
            >
              <span className={styles.callbackWhatsappButton}>
                <WhatsAppIcon />
                Escríbenos por WhatsApp
              </span>
              <span className={styles.callbackWhatsappNote}>{whatsappNote}</span>
            </a>
            <a className={styles.callbackCall} href={phoneHref} data-ubicacion="contacto">
              <PhoneIcon />
              Llamar al {phoneDisplay}
            </a>
            <div className={styles.callbackMeta}>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                <PinIcon />
                <span>{addressLabel}</span>
              </a>
              <p>
                <ClockIcon />
                <span>{hoursLabel}</span>
              </p>
            </div>
          </div>
          <ShortQuoteForm servicio={servicio} variant="callback" callbackSubject={callbackSubject} />
        </div>
      ) : (
      <div className={styles.contactGrid}>
        <ShortQuoteForm servicio={servicio} />
        <div className={styles.facts}>
          <a className={styles.fact} href={phoneHref} data-ubicacion="contacto">
            <span>
              <PhoneIcon />
              Llamar
            </span>
            <strong>{phoneDisplay}</strong>
          </a>
          <a className={styles.fact} href={whatsappHref} target="_blank" rel="noopener noreferrer" data-ubicacion="contacto">
            <span>
              <WhatsAppIcon />
              WhatsApp
            </span>
            <strong>Escríbenos al {phoneDisplay}</strong>
          </a>
          <a className={styles.fact} href={mapsHref} target="_blank" rel="noopener noreferrer">
            <span>Dirección</span>
            <strong>{addressLabel}</strong>
          </a>
          <article className={styles.fact}>
            <span>Horario</span>
            <strong>{hoursLabel}</strong>
          </article>
        </div>
      </div>
      )}
    </section>
  );
}
