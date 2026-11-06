import styles from "./conversion.module.css";

type SectionHeadingProps = {
  title: string;
  accent?: string;
  description?: string;
  align?: "start" | "center";
  titleId?: string;
};

export function SectionHeading({
  title,
  accent,
  description,
  align = "center",
  titleId,
}: SectionHeadingProps) {
  return (
    <div className={styles.sectionHeading} data-section-heading data-align={align}>
      <h2 id={titleId}>
        <span data-heading="title">{title}</span>
        {accent ? <span data-heading="accent">{accent}</span> : null}
      </h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
