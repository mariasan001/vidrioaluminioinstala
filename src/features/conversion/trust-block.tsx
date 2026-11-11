import { coverageLabel, type Servicio } from "./contact-info";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

const trustItems = [
  { label: "Experiencia", value: "8 años instalando aluminio y vidrio" },
  { label: "Cotización", value: "Medición y cotización sin costo" },
  { label: "Zonas atendidas", value: coverageLabel },
  { label: "Opiniones", value: "4.3 ★ en Google (18 reseñas)" },
] as const;

export function TrustBlock({ servicio, unifiedHeadings = false }: { servicio: Servicio; unifiedHeadings?: boolean }) {
  return (
    <section className={styles.trust} id="confianza" aria-labelledby="confianza-title" data-servicio={servicio} data-section="confianza">
      {unifiedHeadings ? (
        <SectionHeading
          accent="en Toluca y Metepec"
          title="8 años instalando"
          titleId="confianza-title"
        />
      ) : (
        <>
          <p className={styles.kicker}>Confianza</p>
          <h2 className={styles.sectionTitle} id="confianza-title">
            Lo que puedes confirmar antes de instalar
          </h2>
        </>
      )}
      {unifiedHeadings ? (
        <div className={styles.statGrid}>
          <article className={styles.statCard}>
            <strong>8 años</strong>
            <p>de experiencia instalando aluminio y vidrio</p>
          </article>
          <article className={styles.statCard}>
            <strong>
              4.3 <span className={styles.statStar}>★</span>
            </strong>
            <p>18 opiniones en Google</p>
          </article>
          <article className={styles.statCard}>
            <strong className={styles.statPlace}>Toluca y Metepec</strong>
            <p>y alrededores</p>
          </article>
          <article className={styles.statCard}>
            <strong>Sin costo</strong>
            <p>medición y cotización</p>
          </article>
        </div>
      ) : (
        <div className={styles.trustGrid}>
          {trustItems.map((item) => (
            <article className={styles.trustCard} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
