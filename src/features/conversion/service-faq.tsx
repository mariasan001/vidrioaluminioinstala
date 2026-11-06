import type { Servicio } from "./contact-info";
import { SectionHeading } from "./section-heading";
import styles from "./conversion.module.css";

export type FaqItem = {
  question: string;
  answer: string;
  pending?: string;
};

type ServiceFaqProps = {
  servicio: Servicio;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  items: readonly FaqItem[];
  unifiedHeadings?: boolean;
  pending?: string;
};

export function ServiceFaq({
  servicio,
  eyebrow,
  title,
  accent,
  description,
  items,
  unifiedHeadings = false,
  pending,
}: ServiceFaqProps) {
  return (
    <section
      className={`${styles.faq} ${unifiedHeadings ? styles.faqModern : ""}`}
      id="preguntas"
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
      {pending ? <span hidden dangerouslySetInnerHTML={{ __html: `<!-- ${pending} -->` }} /> : null}
      <div className={styles.faqList}>
        {items.map((item, index) => (
          <details className={styles.faqItem} key={item.question} open={index === 0}>
            <summary>{item.question}</summary>
            <p>
              {item.answer}
              {item.pending ? (
                <span hidden dangerouslySetInnerHTML={{ __html: `<!-- ${item.pending} -->` }} />
              ) : null}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
