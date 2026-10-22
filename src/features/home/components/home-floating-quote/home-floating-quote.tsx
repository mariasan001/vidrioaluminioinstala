"use client";

import {
  FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { trackQuoteSubmit } from "@/features/analytics";
import { useLockBodyScroll } from "../../hooks/use-lock-body-scroll";
import styles from "./home-floating-quote.module.css";
import {
  extractWhatsappTextFromHref,
  quoteFormOptions,
  whatsappPhoneNumber,
  whatsappReturnStorageKey,
} from "./home-floating-quote.data";
import { isValidQuotePhone, quotePhoneErrorMessage } from "./quote-phone";
import {
  openQuoteDialog,
  openQuoteDialogEventName,
  type QuoteDialogOptions,
} from "./quote-dialog";

type HomeFloatingQuoteProps = {
  defaultService?: string;
  hideLauncher?: boolean;
  hideLauncherOnMobile?: boolean;
  whatsappHref?: string;
};

const fallbackService = "Ventanas";

function quoteField(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field : null;
}

export function HomeFloatingQuote({
  defaultService = fallbackService,
  hideLauncher = false,
  hideLauncherOnMobile = false,
  whatsappHref,
}: HomeFloatingQuoteProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteOrigin, setQuoteOrigin] = useState<string>("floating_quote_button");
  const [service, setService] = useState<string>(defaultService);
  const [timing, setTiming] = useState<string>("Solo cotizo");
  const [workType, setWorkType] = useState<string>("Instalación nueva");
  const [photoStatus, setPhotoStatus] = useState<string>("La enviaré por WhatsApp");
  const [prefilledWhatsappText, setPrefilledWhatsappText] = useState<string>(
    extractWhatsappTextFromHref(whatsappHref),
  );
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  useLockBodyScroll(isOpen);

  const closeQuoteDialog = () => {
    setIsOpen(false);

    window.requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    });
  };

  const openDialog = useCallback(
    (options?: QuoteDialogOptions) => {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setQuoteOrigin(options?.origin ?? "floating_quote_button");
      setService(options?.service ?? defaultService);
      setPrefilledWhatsappText(
        extractWhatsappTextFromHref(options?.whatsappHref ?? whatsappHref),
      );
      submittingRef.current = false;
      setIsSubmitting(false);
      setFormError("");
      setIsOpen(true);
    },
    [defaultService, whatsappHref],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeQuoteDialog();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      closeQuoteDialog();

      if (event.persisted && sessionStorage.getItem(whatsappReturnStorageKey)) {
        sessionStorage.removeItem(whatsappReturnStorageKey);
        window.location.reload();
      }
    };

    const handleOpenQuoteDialog = (event: Event) => {
      const customEvent = event as CustomEvent<QuoteDialogOptions>;
      openDialog(customEvent.detail);
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener(openQuoteDialogEventName, handleOpenQuoteDialog);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener(openQuoteDialogEventName, handleOpenQuoteDialog);
    };
  }, [openDialog]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    modalRef.current?.focus();
  }, [isOpen]);

  const keepFocusInsideDialog = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    const focusableElements = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);

    if (focusableElements.length === 0) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const zone = formData.get("zone")?.toString().trim() || "";
    const measurements = formData.get("measurements")?.toString().trim() || "";
    const notes = formData.get("notes")?.toString().trim() || "";
    const nameInput = quoteField(form, "name");
    const phoneInput = quoteField(form, "phone");
    const phoneIsValid = isValidQuotePhone(phone);

    nameInput?.setCustomValidity(name ? "" : "Escribe tu nombre.");
    phoneInput?.setCustomValidity(phoneIsValid ? "" : quotePhoneErrorMessage);

    if (!form.reportValidity()) {
      setFormError(name ? quotePhoneErrorMessage : "Escribe tu nombre.");
      return;
    }

    setFormError("");
    submittingRef.current = true;
    setIsSubmitting(true);

    const message = [
      prefilledWhatsappText || "Hola, quiero solicitar una cotización.",
      "",
      "*Proyecto*",
      `Servicio: ${service}`,
      `Tipo de trabajo: ${workType}`,
      `Para cuándo: ${timing}`,
      `Foto del espacio: ${photoStatus}`,
      "",
      "*Cliente*",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Zona o colonia: ${zone || "No indicada"}`,
      "",
      "*Medidas y detalles*",
      `Medidas aproximadas: ${measurements || "No indicadas"}`,
      `Comentarios: ${notes || "Sin comentarios adicionales"}`,
    ].join("\n");

    trackQuoteSubmit({
      origin: quoteOrigin,
      photoStatus,
      service,
      timing,
      workType,
    });

    closeQuoteDialog();
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
      return;
    }

    sessionStorage.setItem(whatsappReturnStorageKey, "true");
    window.location.assign(whatsappUrl);
  };

  return (
    <>
      {hideLauncher ? null : (
      <button
        className={styles.button}
        type="button"
        aria-label="Generar cotización"
        data-hide-mobile={hideLauncherOnMobile ? "true" : undefined}
        onClick={() =>
          openQuoteDialog({
            origin: "floating_quote_button",
            service: defaultService,
            whatsappHref,
          })
        }
      >
        <span className={styles.dot} aria-hidden="true" />
        <span>Generar cotización</span>
      </button>
      )}

      {isOpen ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-form-title"
          onClick={closeQuoteDialog}
        >
          <div
            ref={modalRef}
            className={styles.modal}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={keepFocusInsideDialog}
          >
            <div className={styles.modalHeader}>
              <div>
                <span>Cotización clara</span>
                <h2 id="quote-form-title">Cuéntanos qué necesitas</h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Cerrar formulario"
                onClick={closeQuoteDialog}
              >
                <HiOutlineXMark aria-hidden="true" />
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.selectGrid}>
                <label className={styles.selectField}>
                  ¿Qué quieres cotizar?
                  <select
                    name="service"
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                  >
                    {quoteFormOptions.services.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.selectField}>
                  ¿Es instalación nueva o reemplazo?
                  <select
                    name="workType"
                    value={workType}
                    onChange={(event) => setWorkType(event.target.value)}
                  >
                    {quoteFormOptions.workTypes.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.inputGrid}>
                <label>
                  Nombre
                  <input
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    onInput={(event) => {
                      event.currentTarget.setCustomValidity("");
                      setFormError("");
                    }}
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    name="phone"
                    type="tel"
                    placeholder="729 000 0000"
                    autoComplete="tel"
                    inputMode="tel"
                    onInput={(event) => {
                      event.currentTarget.setCustomValidity("");
                      setFormError("");
                    }}
                  />
                </label>
                <label>
                  Zona o colonia
                  <input
                    name="zone"
                    type="text"
                    placeholder="Toluca, Metepec..."
                    autoComplete="address-level2"
                  />
                </label>
                <label>
                  Medidas aproximadas
                  <input name="measurements" type="text" placeholder="Ancho x alto" />
                </label>
              </div>

              <div className={styles.selectGrid}>
                <label className={styles.selectField}>
                  ¿Para cuándo lo necesitas?
                  <select
                    name="timing"
                    value={timing}
                    onChange={(event) => setTiming(event.target.value)}
                  >
                    {quoteFormOptions.timings.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.selectField}>
                  ¿Tienes foto del espacio?
                  <select
                    name="photoStatus"
                    value={photoStatus}
                    onChange={(event) => setPhotoStatus(event.target.value)}
                  >
                    {quoteFormOptions.photoStatuses.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {formError ? (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              ) : null}

              <label className={styles.notes}>
                Cuéntanos un poco más
                <textarea
                  name="notes"
                  placeholder="Ejemplo: quiero cambiar una ventana, tengo foto del espacio, busco color negro..."
                  autoComplete="off"
                  rows={4}
                />
              </label>

              <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                Enviar solicitud por WhatsApp
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
