"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { WhatsAppIcon } from "@/features/conversion/contact-icons";
import { SectionHeading } from "@/features/conversion/section-heading";
import { productAction, useLiveProducts } from "@/features/catalog/use-live-products";
import styles from "./canceles-types.module.css";

type CancelType = {
  id: string;
  label: string;
  image: { src: string; alt: string };
  ideal?: string;
  detail?: string;
  message?: string;
  pendingNote?: string;
  focus?: string;
  cta?: string;
};

type CancelesTypesSectionProps = {
  title: string;
  accent: string;
  description: string;
  items: readonly CancelType[];
  whatsappHref: string;
  photoMessage?: string;
  trackLabel?: string;
  titleId?: string;
};

const cardMessage =
  "Hola, me interesa el cancel {tipo}. Mi regadera mide aprox. ___ de ancho por ___ de alto. ¿Me pueden dar precio? También puedo mandar foto.";

function whatsappHrefWithText(href: string, text: string) {
  try {
    const url = new URL(href);
    url.searchParams.set("text", text);
    return url.toString().replace(/\+/g, "%20");
  } catch {
    return href;
  }
}

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function DobleCorredizoIcon() {
  return (
    <LineIcon>
      <rect x="2" y="3.5" width="6" height="17" />
      <rect x="16" y="3.5" width="6" height="17" />
      <path d="M8.5 12h7M11 9.2 8.5 12 11 14.8M13 9.2 15.5 12 13 14.8" />
    </LineIcon>
  );
}

function CurvoIcon() {
  return (
    <LineIcon>
      <path d="M5 18.5A9.5 9.5 0 0 1 18.5 5" />
    </LineIcon>
  );
}

function EscuadraIcon() {
  return (
    <LineIcon>
      <rect x="3" y="3" width="7.5" height="18" />
      <rect x="10.5" y="12" width="10.5" height="9" />
    </LineIcon>
  );
}

function FijoCorredizoIcon() {
  return (
    <LineIcon>
      <rect x="1.5" y="3.5" width="7" height="17" />
      <rect x="15" y="3.5" width="7" height="17" />
      <path d="M9.2 12h5M12.2 9.6 15 12l-2.8 2.4" />
    </LineIcon>
  );
}

function PendingOpeningIcon() {
  return (
    <LineIcon>
      <rect x="5" y="4" width="14" height="16" />
    </LineIcon>
  );
}

function VentanaIcon() {
  return (
    <LineIcon>
      <rect x="5.5" y="5" width="13" height="14" rx="0.6" />
      <path d="M12 5v14M5.5 12h13" />
    </LineIcon>
  );
}

function BotonesIcon() {
  return (
    <LineIcon>
      <rect x="9.2" y="5" width="9.2" height="14" rx="0.7" />
      <circle cx="6.2" cy="9" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="6.2" cy="15" r="1.7" fill="currentColor" stroke="none" />
    </LineIcon>
  );
}

function MiniposteIcon() {
  return (
    <LineIcon>
      <rect x="5.5" y="5" width="13" height="8.5" rx="0.7" />
      <rect x="7.2" y="14.4" width="2.6" height="4.2" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="14.2" y="14.4" width="2.6" height="4.2" rx="0.4" fill="currentColor" stroke="none" />
    </LineIcon>
  );
}

function PosteIcon() {
  return (
    <LineIcon>
      <rect x="5.2" y="4.6" width="2.6" height="14.8" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="16.2" y="4.6" width="2.6" height="14.8" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="8.8" y="6.2" width="6.4" height="11.6" rx="0.5" />
    </LineIcon>
  );
}

const typeIcons: Record<string, () => ReactNode> = {
  "doble-corredizo": DobleCorredizoIcon,
  bacalar: FijoCorredizoIcon,
  cozumel: FijoCorredizoIcon,
  cielo: PendingOpeningIcon,
  curvo: CurvoIcon,
  escuadra: EscuadraIcon,
  "serie-1400": VentanaIcon,
  "serie-3500": VentanaIcon,
  "serie-4600": VentanaIcon,
  "linea-nacional": VentanaIcon,
  botones: BotonesIcon,
  miniposte: MiniposteIcon,
  poste: PosteIcon,
};

const photoFocus: Record<string, string> = {
  "doble-corredizo": "center 40%",
  bacalar: "center 40%",
  cozumel: "center 40%",
  cielo: "right 40%",
  curvo: "center 40%",
  escuadra: "center 40%",
};

function TypeMark({ id }: { id: string }) {
  const Icon = typeIcons[id] ?? PendingOpeningIcon;
  return <Icon />;
}

export function CancelesTypesSection({
  title,
  accent,
  description,
  items,
  whatsappHref,
  photoMessage = "Hola, no sé qué cancel me conviene. Les mando una foto de mi regadera para que me recomienden.",
  trackLabel = "Tipos de cancel",
  titleId = "canceles-types-title",
}: CancelesTypesSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const live = useLiveProducts();
  const shown: readonly CancelType[] = live && live.length
    ? live.map((product): CancelType => ({
        id: product.id,
        label: product.titulo,
        image: { src: product.imagen, alt: product.titulo },
        ideal: product.descripcion,
        detail: product.caracteristicas,
        cta: productAction(product),
      }))
    : items;

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const update = () => {
      const cards = [...track.querySelectorAll("[data-type-card]")];
      const trackLeft = track.getBoundingClientRect().left;
      let next = 0;
      let best = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);

        if (distance < best) {
          best = distance;
          next = index;
        }
      });

      setActiveIndex(next);
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [shown.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const card = track?.querySelectorAll("[data-type-card]")[index];

    if (!track || !(card instanceof HTMLElement)) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: card.offsetLeft,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
      <section id="tipos" className={styles.section} aria-labelledby={titleId} data-section="tipos">
      <SectionHeading
        accent={accent}
        description={description}
        title={title}
        titleId={titleId}
      />

      <div className={styles.track} ref={trackRef} aria-label={trackLabel}>
        {shown.map((item) => (
          <a
            className={styles.card}
            key={item.id}
            href={whatsappHrefWithText(
              whatsappHref,
              item.message ?? cardMessage.split("{tipo}").join(item.label),
            )}
            target="_blank"
            rel="noopener noreferrer"
            data-type-card
            data-tipo={item.label}
            data-ubicacion="tipos"
          >
            <span className={styles.photoWrap}>
              <span
                className={styles.photo}
                style={{ "--focus": item.focus ?? photoFocus[item.id] ?? "center 40%" } as CSSProperties}
              >
                {item.image.src.startsWith("data:") || item.image.src === "" ? (
                  item.image.src ? <img src={item.image.src} alt={item.image.alt} className={styles.photoImage} /> : null
                ) : (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 900px) 80vw, 340px"
                    className={styles.photoImage}
                  />
                )}
              </span>
              <span className={styles.badge}>
                <TypeMark id={item.id} />
              </span>
            </span>
            <span className={styles.body}>
              <h3>{item.label}</h3>
              {item.ideal ? <p className={styles.ideal}>{item.ideal}</p> : null}
              {item.detail ? <p className={styles.detail}>{item.detail}</p> : null}
              <span className={styles.price}>
                <WhatsAppIcon />
                {item.cta || "Preguntar precio →"}
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className={styles.dots} role="group" aria-label="Posición del carrusel">
        {shown.map((item, index) => (
          <button
            key={item.id}
            className={styles.dot}
            type="button"
            aria-label={item.label}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      <a
        className={styles.photoLink}
        href={whatsappHrefWithText(whatsappHref, photoMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-tipo="foto"
        data-ubicacion="tipos"
      >
        <WhatsAppIcon />
        ¿No sabes cuál? Mándanos una foto
      </a>
    </section>
  );
}
