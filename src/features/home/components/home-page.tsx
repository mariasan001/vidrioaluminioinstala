import { HomeHero } from "./home-hero";
import { HomeNav } from "./home-nav";
import styles from "../home-page.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <HomeNav />
        <HomeHero />
      </div>
    </main>
  );
}
