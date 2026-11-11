import { whatsappUrl } from "@/content/site";

/** Open a WhatsApp chat with a message; falls back to navigation if popups are blocked. */
export function openWhatsapp(message: string, options?: { returnKey?: string }) {
  const href = whatsappUrl(message);
  const popup = window.open(href, "_blank", "noopener,noreferrer");

  if (popup) {
    try {
      popup.opener = null;
    } catch {
      // Ignore cross-window opener restrictions.
    }
    return href;
  }

  if (options?.returnKey) {
    try {
      sessionStorage.setItem(options.returnKey, "true");
    } catch {
      // Ignore storage failures.
    }
  }

  window.location.assign(href);
  return href;
}
