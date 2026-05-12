import Script from "next/script";
import { getGtmNoScriptUrl, getGtmScriptUrl, gtmId, isGtmEnabled } from "./gtm";

export function GoogleTagManagerScript() {
  if (!isGtmEnabled) {
    return null;
  }

  return (
    <>
      <noscript>
        <iframe
          src={getGtmNoScriptUrl()}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>

      <Script id="gtm-data-layer" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js", gtm_id: "${gtmId}" });`}
      </Script>
      <Script id="gtm-loader" src={getGtmScriptUrl()} strategy="afterInteractive" />
    </>
  );
}
