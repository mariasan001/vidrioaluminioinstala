"use client";

import { FormEvent, useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { useLockBodyScroll } from "../../hooks/use-lock-body-scroll";
import styles from "./home-floating-quote.module.css";
import {
  quoteFormOptions,
  whatsappPhoneNumber,
  whatsappReturnStorageKey,
} from "./home-floating-quote.data";

type HomeFloatingQuoteProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export function HomeFloatingQuote({
  isOpen,
  onClose,
  onOpen,
}: HomeFloatingQuoteProps) {
  const [service, setService] = useState<string>("Ventanas");
  const [timing, setTiming] = useState<string>("Solo cotizo");
  const [workType, setWorkType] = useState<string>("Instalación nueva");
  const [photoStatus, setPhotoStatus] = useState<string>("La enviaré por WhatsApp");
  useLockBodyScroll(isOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      onClose();

      if (event.persisted && sessionStorage.getItem(whatsappReturnStorageKey)) {
        sessionStorage.removeItem(whatsappReturnStorageKey);
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const zone = formData.get("zone")?.toString() || "";
    const measurements = formData.get("measurements")?.toString() || "";
    const notes = formData.get("notes")?.toString() || "";
    const message = [
      "*Nueva solicitud de cotización*",
      "",
      "*Proyecto*",
      `Servicio: ${service}`,
      `Tipo de trabajo: ${workType}`,
      `Para cuándo: ${timing}`,
      `Foto del espacio: ${photoStatus}`,
      "",
      "*Cliente*",
      `Nombre: ${name || "No indicado"}`,
      `Teléfono: ${phone || "No indicado"}`,
      `Zona o colonia: ${zone || "No indicada"}`,
      "",
      "*Medidas y detalles*",
      `Medidas aproximadas: ${measurements || "No indicadas"}`,
      `Comentarios: ${notes || "Sin comentarios adicionales"}`,
    ].join("\n");

    onClose();
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
      <button
        className={styles.button}
        type="button"
        aria-label="Generar cotización"
        onClick={onOpen}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span>Generar cotización</span>
      </button>

      {isOpen ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-form-title"
          onClick={onClose}
        >
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span>Cotización clara</span>
                <h2 id="quote-form-title">Cuéntanos qué necesitas</h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Cerrar formulario"
                onClick={onClose}
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
                  <input name="name" type="text" placeholder="Tu nombre" />
                </label>
                <label>
                  Teléfono
                  <input name="phone" type="tel" placeholder="729 000 0000" />
                </label>
                <label>
                  Zona o colonia
                  <input name="zone" type="text" placeholder="Toluca, Metepec..." />
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

              <label className={styles.notes}>
                Cuéntanos un poco más
                <textarea
                  name="notes"
                  placeholder="Ejemplo: quiero cambiar una ventana, tengo foto del espacio, busco color negro..."
                  rows={4}
                />
              </label>

              <button className={styles.submitButton} type="submit">
                Enviar solicitud por WhatsApp
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
