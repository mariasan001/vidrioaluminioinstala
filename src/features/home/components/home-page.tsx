import { HomeEmpathy } from "./home-empathy";
import { HomeHero } from "./home-hero";
import { HomeNav } from "./home-nav";
import { HomeServices } from "./home-services";
import styles from "../home-page.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <HomeNav />
        <HomeHero />
        <HomeEmpathy />
        <HomeServices />
      </div>
    </main>
  );
}
