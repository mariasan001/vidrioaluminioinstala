import type { Servicio } from "./contact-info";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

export type FaqItem = {
  question: string;
  answer: string;
};

type ServiceFaqProps = {
  servicio: Servicio;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  items: readonly FaqItem[];
  unifiedHeadings?: boolean;
};

export function ServiceFaq({
  servicio,
  eyebrow,
  title,
  accent,
  description,
  items,
  unifiedHeadings = false,
}: ServiceFaqProps) {
  return (
    <section
      className={`${styles.faq} ${unifiedHeadings ? styles.faqModern : ""}`}
      id="preguntas"
      data-section="preguntas"
      aria-labelledby="faq-title"
      data-servicio={servicio}
    >
      {unifiedHeadings ? (
        <SectionHeading accent={accent} description={description} title={title} titleId="faq-title" />
      ) : (
        <>
          <p className={styles.kicker}>{eyebrow}</p>
          <h2 className={styles.sectionTitle} id="faq-title">
            {title}
          </h2>
          <p className={styles.faqLead}>{description}</p>
        </>
      )}
      <div className={styles.faqList}>
        {items.map((item, index) => (
          <details className={styles.faqItem} key={item.question} open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
