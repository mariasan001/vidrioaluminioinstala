import { projectsContent } from "@/features/home/components/home-projects/home-projects.data";
import type { Servicio } from "./contact-info";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

const imageSize: Record<string, { width: number; height: number }> = {
  "/img/trabajos/balcon-barandal-vidrio.webp": { width: 1086, height: 1448 },
  "/img/trabajos/barandal-vidrio-escalera-interior.webp": { width: 1086, height: 1448 },
  "/img/trabajos/barandal-vidrio-vista-abierta.webp": { width: 1122, height: 1402 },
  "/img/trabajos/cancel-bano-apertura-limpia.webp": { width: 1086, height: 1448 },
  "/img/trabajos/cancel-bano-corredizo-cristal-templado.webp": { width: 1122, height: 1402 },
  "/img/trabajos/cancel-bano-herrajes-negros.webp": { width: 1086, height: 1448 },
  "/img/trabajos/escalera-barandal-vidrio-madera.webp": { width: 1086, height: 1448 },
  "/img/trabajos/ventanal-aluminio-vidrio-corredor.webp": { width: 1448, height: 1086 },
  "/img/trabajos/ventanales-espacio-doble-altura.webp": { width: 1086, height: 1448 },
  "/img/trabajos/ventanas-aluminio-iluminacion-natural.webp": { width: 1122, height: 1402 },
};

type ServiceGalleryProps = {
  servicio: Servicio;
  title: string;
  accent?: string;
  description: string;
  match: (category: string) => boolean;
  unifiedHeadings?: boolean;
};

export function ServiceGallery({
  servicio,
  title,
  accent,
  description,
  match,
  unifiedHeadings = false,
}: ServiceGalleryProps) {
  const projects = projectsContent.items.filter((item) => match(item.category)).slice(0, 6);

  return (
    <section className={styles.gallery} id="proyectos" aria-labelledby="galeria-title" data-servicio={servicio} data-section="trabajos">
      {unifiedHeadings ? (
        <SectionHeading accent={accent} description={description} title={title} titleId="galeria-title" />
      ) : (
        <>
          <p className={styles.kicker}>Trabajos</p>
          <h2 className={styles.sectionTitle} id="galeria-title">
            {title}
          </h2>
          <p className={styles.galleryLead}>{description}</p>
        </>
      )}
      <div className={styles.galleryGrid}>
        {projects.map((project) => {
          const size = imageSize[project.image] ?? { width: 1086, height: 1448 };

          return (
            <article className={styles.project} key={project.image}>
              <img
                src={project.image}
                alt={project.alt}
                width={size.width}
                height={size.height}
                loading="lazy"
                decoding="async"
              />
              <div>
                <span>{project.category}</span>
                <strong>{project.title}</strong>
                <p>{project.description}</p>
              </div>
            </article>
          );
        })}
      </div>
      <a className={styles.more} href="/#proyectos">
        Ver más proyectos
      </a>
    </section>
  );
}
