import Image from "next/image";
import { BarandalesPhoneLink, BarandalesQuoteButton, BarandalesWhatsappLink } from "./barandales-actions";
import { BarandalesFaq } from "./barandales-faq";
import { BarandalesQuoteForm } from "./barandales-form";
import {
  barandalesFacebook,
  barandalesFaq,
  barandalesFinalCta,
  barandalesFooter,
  barandalesHero,
  barandalesNav,
  barandalesPhoneDisplay,
  barandalesQuoteLabel,
  barandalesTypes,
  barandalesWhatsapp,
  barandalesWork,
} from "./barandales-landing.data";
import styles from "./barandales-landing.module.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5h16v11H9l-5 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkRailingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 8v3m4-3v4m4-4v3m4-3v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WorkChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5h16v11H9l-5 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 9.5h8m-8 3h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WorkLayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3 9 5-9 5-9-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m3 12.5 9 5 9-5m-18 4 9 5 9-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const workIcons = [WorkRailingIcon, WorkChatIcon, WorkLayersIcon];

export function BarandalesLanding() {
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} />
              {barandalesHero.eyebrow}
            </p>
            <div className={styles.heroTitles}>
              <h1>{barandalesHero.title}</h1>
              <p className={styles.editorial}>{barandalesHero.accent}</p>
            </div>
            <p className={styles.heroLead}>{barandalesHero.description}</p>
            <div className={styles.heroActions}>
              <BarandalesQuoteButton className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                {barandalesQuoteLabel}
              </BarandalesQuoteButton>
              <a className={`${styles.btn} ${styles.btnGhost} ${styles.btnLarge}`} href="#tipos">
                Ver opciones
              </a>
              <BarandalesPhoneLink className={`${styles.btn} ${styles.btnGhost} ${styles.btnLarge}`} label="Llámanos" />
            </div>
            <p className={styles.heroNote}>
              <ChatIcon />
              {barandalesHero.note}
            </p>
          </div>

          <div className={styles.heroMedia}>
            <Image
              src={barandalesHero.portrait.src}
              alt={barandalesHero.portrait.alt}
              width={barandalesHero.portrait.width}
              height={barandalesHero.portrait.height}
              className={styles.heroImage}
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 1400px"
            />
            <p className={styles.heroBadge}>{barandalesHero.portrait.badge}</p>
          </div>
        </div>
      </section>

      <section className={styles.types} id="tipos">
        <div className={styles.wrap}>
          <div className={styles.splitHead}>
            <div>
              <p className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                <span className={`${styles.dot} ${styles.dotDark}`} />
                {barandalesTypes.eyebrow}
              </p>
              <h2>{barandalesTypes.title}</h2>
            </div>
            <p className={styles.splitCopy}>{barandalesTypes.description}</p>
          </div>

          <div className={styles.typeGrid}>
            {barandalesTypes.items.map((item) => (
              <article className={styles.typeCard} key={item.id}>
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  className={styles.typeImage}
                  sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 480px"
                />
                <div className={styles.typeBody}>
                  <div>
                    <p className={styles.typeIndex}>{item.index}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <BarandalesQuoteButton className={styles.typeLink}>
                    <span>Consultar esta opción</span>
                    <span className={styles.arrow}>
                      <ArrowIcon />
                    </span>
                  </BarandalesQuoteButton>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.typeClose}>
            <div>
              <h3>{barandalesTypes.closeTitle}</h3>
              <p>{barandalesTypes.closeText}</p>
            </div>
            <BarandalesQuoteButton className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
              {barandalesTypes.cta}
            </BarandalesQuoteButton>
          </div>
        </div>
      </section>

      <section className={styles.work} id="trabajo">
        <div className={styles.wrap}>
          <div className={styles.splitHead}>
            <div className={styles.workCopy}>
              <p className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                <span className={`${styles.dot} ${styles.dotDark}`} />
                {barandalesWork.eyebrow}
              </p>
              <h2>{barandalesWork.title}</h2>
            </div>
            <p className={styles.workLead}>{barandalesWork.description}</p>
          </div>
          <div className={styles.workList}>
            {barandalesWork.items.map((item, index) => {
              const Icon = workIcons[index];

              return (
                <article key={item.title}>
                  <span className={styles.workIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <p className={styles.workStep}>{String(index + 1).padStart(2, "0")}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.faq} id="preguntas">
        <div className={styles.wrap}>
          <div className={styles.splitHead}>
            <div>
              <p className={`${styles.eyebrow} ${styles.eyebrowDark}`}>
                <span className={`${styles.dot} ${styles.dotDark}`} />
                {barandalesFaq.eyebrow}
              </p>
              <h2>{barandalesFaq.title}</h2>
            </div>
            <div className={styles.faqAside}>
              <p className={styles.faqLead}>{barandalesFaq.description}</p>
              <BarandalesWhatsappLink
                className={`${styles.btn} ${styles.btnDark}`}
                ctaType="faq_whatsapp"
                href={barandalesWhatsapp.question}
                placement="faq"
              >
                {barandalesFaq.cta}
              </BarandalesWhatsappLink>
            </div>
          </div>
          <BarandalesFaq />
        </div>
      </section>

      <section className={styles.final} id="cotizacion">
        <div className={styles.finalGrid}>
          <div className={styles.finalCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} />
              {barandalesFinalCta.eyebrow}
            </p>
            <h2>{barandalesFinalCta.title}</h2>
            <p>{barandalesFinalCta.description}</p>
            <BarandalesWhatsappLink
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
              ctaType="final_whatsapp"
              href={barandalesWhatsapp.quote}
              placement="final_cta"
            >
              {barandalesFinalCta.whatsappCta}
            </BarandalesWhatsappLink>
            <div className={styles.photoNote}>
              <p>{barandalesFinalCta.photoNote}</p>
              <BarandalesPhoneLink className={styles.phoneLink} label="Llámanos" />
              <BarandalesWhatsappLink
                className={styles.phoneLink}
                ctaType="photo_whatsapp"
                href={barandalesWhatsapp.photo}
                placement="final_photo"
              >
                WhatsApp: {barandalesPhoneDisplay}
              </BarandalesWhatsappLink>
            </div>
          </div>
          <BarandalesQuoteForm />
        </div>
      </section>

      <footer className={styles.footer} id="contacto">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <a className={styles.brand} href="/" aria-label="Aluminio y Vidrio Instala">
              <Image
                src="/img/logo-nav.webp"
                alt=""
                width={188}
                height={62}
                className={styles.logo}
              />
            </a>
            <p>{barandalesFooter.zone}</p>
          </div>
          <div>
            <p className={styles.footerLabel}>Secciones</p>
            {barandalesNav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <p className={styles.footerLabel}>Contacto</p>
            <BarandalesWhatsappLink
              ctaType="footer_whatsapp"
              href={barandalesWhatsapp.quote}
              placement="footer"
            >
              WhatsApp: {barandalesPhoneDisplay}
            </BarandalesWhatsappLink>
            <BarandalesPhoneLink />
            <a href={barandalesFacebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
        <a className={styles.servicesLink} href={barandalesFooter.servicesHref}>
          <span>{barandalesFooter.servicesPrompt}</span>
          <span aria-hidden="true">→</span>
        </a>
        <div className={styles.footerBottom}>
          <p>{barandalesFooter.copyright}</p>
          <p>{barandalesFooter.privacy}</p>
        </div>
      </footer>

      <BarandalesQuoteButton className={styles.mobileQuote}>Cotiza proyecto</BarandalesQuoteButton>
    </div>
  );
}
