import { HomeFloatingQuote } from "@/features/home/components/home-floating-quote";
import { HomeNav } from "@/features/home/components/home-nav";
import { BarandalesLanding } from "./barandales-landing";
import { barandalesServiceName, barandalesWhatsapp } from "./barandales-landing.data";
import styles from "./barandales-landing.module.css";

const primaryLinks = [
  { href: "#tipos", label: "Barandales", sectionId: "tipos" },
  { href: "#preguntas", label: "Preguntas frecuentes", sectionId: "preguntas" },
  { href: "#contacto", label: "Contacto", sectionId: "contacto" },
] as const;

const mobileLinks = [
  ...primaryLinks,
  { href: "#cotizacion", label: "Crear cotización" },
] as const;

export function BarandalesLandingPage() {
  return (
    <main className={styles.page}>
      <HomeNav
        defaultActiveHref=""
        logoHref="/"
        mobileMenuLinks={mobileLinks}
        primaryLinks={primaryLinks}
        quoteService={barandalesServiceName}
        quoteWhatsappHref={barandalesWhatsapp.quote}
        secondaryLinks={[]}
        scrollLinks={primaryLinks}
        wide
      />
      <BarandalesLanding />
      <HomeFloatingQuote
        defaultService={barandalesServiceName}
        hideLauncher
        whatsappHref={barandalesWhatsapp.quote}
      />
    </main>
  );
}
