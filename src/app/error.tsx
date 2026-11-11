"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="error-title">
        <p className={styles.eyebrow}>Algo salió mal</p>
        <h1 id="error-title" className={styles.title}>
          No pudimos cargar esta página
        </h1>
        <p className={styles.copy}>
          Intenta de nuevo. Si el problema continúa, vuelve al inicio o escríbenos por WhatsApp.
        </p>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={reset}>
            Reintentar
          </button>
          <Link className={styles.secondary} href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
