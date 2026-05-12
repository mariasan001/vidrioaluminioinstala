export const analyticsEventNames = {
  clickWhatsapp: "click_whatsapp",
  openQuoteModal: "open_quote_modal",
  serviceView: "service_view",
  submitQuote: "submit_quote",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEventNames)[keyof typeof analyticsEventNames];

type AnalyticsEventPayload = {
  event: AnalyticsEventName;
  [key: string]: unknown;
};

function withPageContext(payload: AnalyticsEventPayload) {
  if (typeof window === "undefined") {
    return payload;
  }

  return {
    ...payload,
    page_location: window.location.href,
    page_path: window.location.pathname,
  };
}

export function pushAnalyticsEvent(payload: AnalyticsEventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(withPageContext(payload));
}

export function trackWhatsappClick(payload: {
  href?: string;
  ctaType: string;
  placement: string;
  service?: string;
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.clickWhatsapp,
    cta_type: payload.ctaType,
    href: payload.href,
    placement: payload.placement,
    service_name: payload.service,
  });
}

export function trackQuoteModalOpen(payload: {
  origin?: string;
  service?: string;
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.openQuoteModal,
    origin: payload.origin,
    service_name: payload.service,
  });
}

export function trackQuoteSubmit(payload: {
  origin?: string;
  photoStatus: string;
  service: string;
  timing: string;
  workType: string;
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.submitQuote,
    origin: payload.origin,
    photo_status: payload.photoStatus,
    service_name: payload.service,
    timing: payload.timing,
    work_type: payload.workType,
  });
}

export function trackServiceView(payload: {
  pathname: string;
  service: string;
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.serviceView,
    service_name: payload.service,
    service_path: payload.pathname,
  });
}
