import { HomeEmpathy } from "./home-empathy";
import { HomeContact } from "./home-contact";
import { HomeFloatingQuote } from "./home-floating-quote";
import { HomeHero } from "./home-hero";
import { HomeMaterials } from "./home-materials";
import { HomeNav } from "./home-nav";
import { HomeProjects } from "./home-projects";
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
        <HomeProjects />
        <HomeMaterials />
        <HomeContact />
        <HomeFloatingQuote />
      </div>
    </main>
  );
}
