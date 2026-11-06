import { coverageLabel, type Servicio } from "./contact-info";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

const pendingItems = [
  { label: "Años de experiencia", value: "PENDIENTE: dato real" },
  { label: "Garantía", value: "PENDIENTE: dato real" },
  { label: "Reseñas", value: "PENDIENTE: dato real" },
] as const;

/** PENDIENTE: URL del perfil */
const googleProfileUrl = "";

export function TrustBlock({ servicio, unifiedHeadings = false }: { servicio: Servicio; unifiedHeadings?: boolean }) {
  return (
    <section className={styles.trust} id="confianza" aria-labelledby="confianza-title" data-servicio={servicio}>
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
            <p>
              {googleProfileUrl ? (
                <a href={googleProfileUrl} target="_blank" rel="noopener noreferrer">
                  18 opiniones en Google
                </a>
              ) : (
                "18 opiniones en Google"
              )}
              <span hidden dangerouslySetInnerHTML={{ __html: "<!-- PENDIENTE: URL del perfil -->" }} />
            </p>
          </article>
          <article className={styles.statCard}>
            <strong className={styles.statPlace}>Toluca y Metepec</strong>
            <p>y alrededores</p>
          </article>
          <article className={styles.statCard}>
            <span hidden dangerouslySetInnerHTML={{ __html: "<!-- PENDIENTE: garantía real del cliente -->" }} />
            <strong>Sin costo</strong>
            <p>medición y cotización</p>
          </article>
        </div>
      ) : (
      <div className={styles.trustGrid}>
        {pendingItems.slice(0, 2).map((item) => (
          <article className={styles.trustCard} key={item.label}>
            <span>{item.label}</span>
            {/* PENDIENTE: dato real */}
            <strong className={styles.pending}>{item.value}</strong>
          </article>
        ))}
        <article className={styles.trustCard}>
          <span>Zonas atendidas</span>
          <strong>{coverageLabel}</strong>
        </article>
        <article className={styles.trustCard}>
          <span>{pendingItems[2].label}</span>
          {/* PENDIENTE: dato real */}
          <strong className={styles.pending}>{pendingItems[2].value}</strong>
        </article>
      </div>
      )}
    </section>
  );
}
