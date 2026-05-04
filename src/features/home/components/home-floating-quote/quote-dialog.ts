const openQuoteDialogEventName = "vidrioaluminio:open-quote-dialog";

export function openQuoteDialog() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(openQuoteDialogEventName));
}

export { openQuoteDialogEventName };
