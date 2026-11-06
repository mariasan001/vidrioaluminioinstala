"use client";

import { FormEvent, useRef, useState } from "react";
import { trackFormSubmit } from "@/features/analytics";
import { whatsappPhoneNumber } from "@/features/home/components/home-floating-quote/home-floating-quote.data";
import {
  isValidQuotePhone,
  quotePhoneErrorMessage,
} from "@/features/home/components/home-floating-quote/quote-phone";
import { isServicio, serviceLabels, servicios, type Servicio } from "./contact-info";
import { WhatsAppIcon } from "./contact-icons";
import styles from "./conversion.module.css";

type ShortQuoteFormProps = {
  servicio: Servicio;
  variant?: "default" | "callback";
  callbackSubject?: string;
};

export function ShortQuoteForm({
  servicio,
  variant = "default",
  callbackSubject = "un cancel de baño",
}: ShortQuoteFormProps) {
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
    const name = formData.get("name")?.toString().trim() ?? "";
    const phone = formData.get("phone")?.toString().trim() ?? "";
    const selectedService = formData.get("service")?.toString().trim() ?? servicio;
    const message = formData.get("message")?.toString().trim() ?? "";
    const cuando = formData.get("cuando")?.toString().trim() ?? "";
    const phoneInput = form.elements.namedItem("phone");
    const phoneIsValid = isValidQuotePhone(phone);
    const servicioValue = isServicio(selectedService) ? selectedService : servicio;

    if (phoneInput instanceof HTMLInputElement) {
      phoneInput.setCustomValidity(phoneIsValid ? "" : quotePhoneErrorMessage);
    }

    if (!form.reportValidity()) {
      setFormError(phoneIsValid ? "Revisa los datos marcados antes de enviar." : quotePhoneErrorMessage);
      return;
    }

    if (variant === "callback" && cuando !== "mañana" && cuando !== "tarde") {
      setFormError("Elige si te llamamos en la mañana o en la tarde.");
      return;
    }

    setFormError("");
    submittingRef.current = true;
    setIsSubmitting(true);

    const whatsappMessage =
      variant === "callback"
        ? `Hola, soy ${name}. Quiero cotizar ${callbackSubject}. Mi teléfono es ${phone}, llámenme en la ${cuando}.`
        : [
            "Hola, quiero una cotización.",
            "",
            `Nombre: ${name}`,
            `Teléfono: ${phone}`,
            `Servicio: ${serviceLabels[servicioValue]}`,
            `Mensaje: ${message || "Sin mensaje adicional"}`,
          ].join("\n");

    trackFormSubmit({
      servicio: variant === "callback" ? servicio : servicioValue,
      ubicacion: "contacto",
    });

    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    window.setTimeout(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
    }, 1200);

    if (!whatsappWindow) {
      window.location.assign(whatsappUrl);
    }
  };

  if (variant === "callback") {
    return (
      <form className={`${styles.form} ${styles.callbackForm}`} onSubmit={handleSubmit}>
        <h3>¿Prefieres que te llamemos?</h3>
        <input type="hidden" name="service" value={servicio} />
        <label className={styles.field}>
          <span>Nombre</span>
          <input name="name" autoComplete="name" placeholder="Tu nombre" required />
        </label>
        <label className={styles.field}>
          <span>Teléfono</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10 dígitos"
            minLength={10}
            required
            onInput={(event) => {
              event.currentTarget.setCustomValidity("");
              setFormError("");
            }}
          />
        </label>
        <fieldset className={styles.when}>
          <legend>¿A qué hora te marcamos?</legend>
          <div className={styles.chips}>
            <label className={styles.chip}>
              <input type="radio" name="cuando" value="mañana" required />
              <span>Mañana</span>
            </label>
            <label className={styles.chip}>
              <input type="radio" name="cuando" value="tarde" />
              <span>Tarde</span>
            </label>
          </div>
        </fieldset>
        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}
        <button className={styles.primary} type="submit" disabled={isSubmitting}>
          Que me llamen
        </button>
        <p className={styles.privacy}>
          Al enviar aceptas el <a href="/aviso-de-privacidad">aviso de privacidad</a>
        </p>
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Pide tu cotización</h3>
      <label className={styles.field}>
        <span>Nombre</span>
        <input name="name" autoComplete="name" placeholder="Tu nombre" required />
      </label>
      <label className={styles.field}>
        <span>Teléfono</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="10 dígitos"
          minLength={10}
          required
          onInput={(event) => {
            event.currentTarget.setCustomValidity("");
            setFormError("");
          }}
        />
      </label>
      <label className={styles.field}>
        <span>Servicio</span>
        <select name="service" defaultValue={servicio} required>
          {servicios.map((item) => (
            <option key={item} value={item}>
              {serviceLabels[item]}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>
          Mensaje <em className={styles.optional}>(opcional)</em>
        </span>
        <textarea name="message" rows={3} placeholder="Medidas, colonia o una referencia" />
      </label>
      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      <button className={styles.primary} type="submit" disabled={isSubmitting}>
        <WhatsAppIcon />
        Enviar por WhatsApp
      </button>
      <p className={styles.privacy}>
        Al enviar aceptas el <a href="/aviso-de-privacidad">aviso de privacidad</a>.
      </p>
    </form>
  );
}
