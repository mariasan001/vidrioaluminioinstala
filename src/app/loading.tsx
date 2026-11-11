import styles from "./not-found.module.css";

export default function Loading() {
  return (
    <main className={styles.page} aria-busy="true" aria-live="polite">
      <section className={styles.panel} aria-labelledby="loading-title">
        <p className={styles.eyebrow}>Cargando</p>
        <h1 id="loading-title" className={styles.title}>
          Un momento
        </h1>
        <p className={styles.copy}>Estamos preparando la página.</p>
      </section>
    </main>
  );
}
