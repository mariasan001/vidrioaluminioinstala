import { HomeEmpathy } from "./home-empathy";
import { SiteContact } from "@/components/site/contact";
import { SiteFloatingQuote } from "@/components/site/floating-quote";
import { HomeHero } from "./home-hero";
import { HomeMaterials } from "./home-materials";
import { SiteNav } from "@/components/site/nav";
import { SiteProjects } from "@/components/site/projects";
import { HomeServices } from "./home-services";
import styles from "../home-page.module.css";

export function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <SiteNav />
        <HomeHero />
        <HomeEmpathy />
        <HomeServices />
        <SiteProjects />
        <HomeMaterials />
        <SiteContact />
        <SiteFloatingQuote />
      </div>
    </main>
  );
}
