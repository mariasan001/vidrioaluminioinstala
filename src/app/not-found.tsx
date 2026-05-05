import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="not-found-title">
        <p className={styles.eyebrow}>Error 404</p>
        <h1 id="not-found-title" className={styles.title}>
          Página no encontrada
        </h1>
        <p className={styles.copy}>
          La ruta que abriste no existe o cambió de ubicación. Puedes volver al inicio
          o ir directo a los servicios para retomar el camino.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Volver al inicio
          </Link>
          <Link className={styles.secondary} href="/#servicios">
            Ver servicios
          </Link>
        </div>
      </section>
    </main>
  );
}
