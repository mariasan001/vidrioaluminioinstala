import { trackQuoteModalOpen } from "@/features/analytics";

export type QuoteDialogOptions = {
  origin?: string;
  service?: string;
  whatsappHref?: string;
};

const openQuoteDialogEventName = "vidrioaluminio:open-quote-dialog";

export function openQuoteDialog(options?: QuoteDialogOptions) {
  if (typeof window === "undefined") {
    return;
  }

  trackQuoteModalOpen({
    origin: options?.origin,
    service: options?.service,
  });

  window.dispatchEvent(
    new CustomEvent<QuoteDialogOptions>(openQuoteDialogEventName, {
      detail: options,
    }),
  );
}

export { openQuoteDialogEventName };
