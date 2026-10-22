"use client";

import { FormEvent, useRef, useState } from "react";
import { trackQuoteSubmit } from "@/features/analytics";
import { whatsappPhoneNumber } from "@/features/home/components/home-floating-quote/home-floating-quote.data";
import {
  isValidQuotePhone,
  quotePhoneErrorMessage,
} from "@/features/home/components/home-floating-quote/quote-phone";
import {
  barandalesFinalCta,
  barandalesServiceName,
  barandalesSpaces,
} from "./barandales-landing.data";
import styles from "./barandales-landing.module.css";

const quoteSubmitLockMs = 1200;

export function BarandalesQuoteForm() {
  const [space, setSpace] = useState<(typeof barandalesSpaces)[number]>("Escalera");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const submittingRef = useRef(false);

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
    const phoneInput = form.elements.namedItem("phone");
    const phoneIsValid = isValidQuotePhone(phone);

    if (phoneInput instanceof HTMLInputElement) {
      phoneInput.setCustomValidity(phoneIsValid ? "" : quotePhoneErrorMessage);
    }

    if (!form.reportValidity()) {
      setFormError(phoneIsValid ? "Revisa los datos marcados antes de enviar." : quotePhoneErrorMessage);
      return;
    }

    setFormError("");
    submittingRef.current = true;
    setIsSubmitting(true);

    const message = [
      "Hola, quiero solicitar una cotización de barandal.",
      "",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Colonia o municipio: ${zone}`,
      `Dónde: ${space}`,
      `Medidas aproximadas: ${measurements || "No indicadas"}`,
      `Proyecto: ${notes || "Sin comentarios adicionales"}`,
    ].join("\n");

    trackQuoteSubmit({
      origin: "landing_form",
      photoStatus: "No indicado en este formulario",
      service: barandalesServiceName,
      timing: "No indicado",
      workType: space,
    });

    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    window.setTimeout(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
    }, quoteSubmitLockMs);

    if (!whatsappWindow) {
      window.location.assign(whatsappUrl);
    }
  };

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      <div className={styles.formIntro}>
        <h3>{barandalesFinalCta.formTitle}</h3>
        <p>{barandalesFinalCta.formNote}</p>
      </div>

      <label className={styles.field}>
        <span>Nombre</span>
        <input name="name" placeholder="Tu nombre" required autoComplete="name" />
      </label>

      <label className={styles.field}>
        <span>Teléfono de contacto</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="10 dígitos"
          required
          autoComplete="tel"
          minLength={10}
          onInput={(event) => {
            event.currentTarget.setCustomValidity("");
            setFormError("");
          }}
        />
      </label>

      <label className={styles.field}>
        <span>Colonia o municipio del proyecto</span>
        <input
          name="zone"
          placeholder="Ej. Metepec, Toluca centro"
          required
          autoComplete="address-level2"
        />
      </label>

      <fieldset className={styles.spaces}>
        <legend>¿Dónde necesitas el barandal?</legend>
        <div className={styles.pills}>
          {barandalesSpaces.map((item) => (
            <button
              key={item}
              className={item === space ? styles.pillActive : styles.pill}
              type="button"
              aria-pressed={item === space}
              onClick={() => setSpace(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span>
          Medidas aproximadas <em>(opcional)</em>
        </span>
        <input name="measurements" placeholder="Ej. 4 m de largo, 1 m de alto" />
      </label>

      <label className={styles.field}>
        <span>
          Cuéntanos sobre tu proyecto <em>(opcional)</em>
        </span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Tipo de barandal, estilo que te gusta, estado de la obra..."
        />
      </label>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      <button
        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge} ${styles.btnBlock}`}
        type="submit"
        disabled={isSubmitting}
      >
        {barandalesFinalCta.submit}
      </button>
      <p className={styles.privacy}>{barandalesFinalCta.privacy}</p>
    </form>
  );
}
