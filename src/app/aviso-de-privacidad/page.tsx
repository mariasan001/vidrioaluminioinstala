import type { Metadata } from "next";
import { absoluteUrl, businessInfo } from "@/features/home/home-seo";
import styles from "./aviso.module.css";

const title = "Aviso de privacidad | Aluminio y Vidrio Instala";
const description =
  "Aviso de privacidad de Aluminio y Vidrio Instala sobre los datos que recabamos al cotizar por formulario, teléfono o WhatsApp.";
const path = "/aviso-de-privacidad";

export const metadata: Metadata = {
  title: { absolute: "Aviso de privacidad | Instala Toluca" },
  description,
  alternates: { canonical: absoluteUrl(path) },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: absoluteUrl(path),
    siteName: businessInfo.name,
    type: "website",
    locale: "es_MX",
  },
};

export default function AvisoDePrivacidadPage() {
  return (
    <main className={styles.page}>
      <p className={styles.banner}>
        Borrador para revisión del cliente. Este texto es una plantilla conforme a la LFPDPPP y no sustituye asesoría legal.
      </p>
      <h1>Aviso de privacidad</h1>
      <p>
        {businessInfo.name} ({/* PENDIENTE: dato real */}
        <strong>PENDIENTE: razón social</strong>), con domicilio en {businessInfo.address.street},{" "}
        {businessInfo.address.neighborhood}, {businessInfo.address.postalCode} {businessInfo.address.city},{" "}
        {businessInfo.address.region}, es responsable del tratamiento de sus datos personales.
      </p>
      <h2>Datos que recabamos</h2>
      <p>Cuando nos llama, escribe por WhatsApp o envía el formulario de cotización, podemos pedir:</p>
      <ul>
        <li>Nombre</li>
        <li>Teléfono</li>
        <li>Servicio que necesita</li>
        <li>Mensaje, medidas, colonia y fotografías que usted decida enviar</li>
      </ul>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Responder su solicitud de cotización o información.</li>
        <li>Agendar medición e instalación en Toluca, Metepec y alrededores.</li>
        <li>Dar seguimiento al trabajo que nos pidió.</li>
      </ul>
      <p>No usamos sus datos para enviar publicidad de terceros.</p>
      <h2>Transferencias</h2>
      <p>
        No vendemos sus datos. WhatsApp y el teléfono son medios que usted elige para contactarnos. El sitio usa Google
        Tag Manager para medir clics y envíos de formulario.
      </p>
      <h2>Derechos ARCO</h2>
      <p>
        Puede solicitar acceso, rectificación, cancelación u oposición al uso de sus datos, y limitar su uso o
        revocar el consentimiento. Para ejercer estos derechos, llame o escriba por WhatsApp al {businessInfo.phoneDisplay}.
        {/* PENDIENTE: dato real */}
      </p>
      <p>
        Correo para solicitudes ARCO: <strong>PENDIENTE: correo del responsable</strong>.
      </p>
      <h2>Cambios</h2>
      <p>
        Si este aviso cambia, publicaremos la versión nueva en esta misma página: {absoluteUrl(path)}.
      </p>
      <p>
        <a href="/">Volver al inicio</a>
      </p>
    </main>
  );
}
