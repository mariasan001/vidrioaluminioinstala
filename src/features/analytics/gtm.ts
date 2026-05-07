const defaultGtmScriptUrl = "https://www.googletagmanager.com/gtm.js";
const defaultGtmNoScriptUrl = "https://www.googletagmanager.com/ns.html";

export const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";
export const gtmScriptUrl =
  process.env.NEXT_PUBLIC_GTM_SCRIPT_URL?.trim() || defaultGtmScriptUrl;
export const gtmAuth = process.env.NEXT_PUBLIC_GTM_AUTH?.trim() ?? "";
export const gtmPreview = process.env.NEXT_PUBLIC_GTM_PREVIEW?.trim() ?? "";
export const isGtmEnabled = Boolean(gtmId);

function buildGtmUrl(baseUrl: string) {
  const url = new URL(baseUrl);

  if (gtmId) {
    url.searchParams.set("id", gtmId);
  }

  if (gtmAuth) {
    url.searchParams.set("gtm_auth", gtmAuth);
  }

  if (gtmPreview) {
    url.searchParams.set("gtm_preview", gtmPreview);
    url.searchParams.set("gtm_cookies_win", "x");
  }

  return url.toString();
}

export function getGtmScriptUrl() {
  return buildGtmUrl(gtmScriptUrl);
}

export function getGtmNoScriptUrl() {
  return buildGtmUrl(defaultGtmNoScriptUrl);
}
