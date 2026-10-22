import { barandalesFaq } from "./barandales-landing.data";
import styles from "./barandales-landing.module.css";

export function BarandalesFaq() {
  return (
    <div className={styles.faqList}>
      {barandalesFaq.items.map((item, index) => (
        <details className={styles.faqItem} key={item.question} open={index === 0}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
