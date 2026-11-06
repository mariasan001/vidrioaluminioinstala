export const analyticsEventNames = {
  clickPhone: "click_phone",
  clickLlamada: "click_llamada",
  clickWhatsapp: "click_whatsapp",
  openQuoteModal: "open_quote_modal",
  serviceView: "service_view",
  submitQuote: "submit_quote",
  envioFormulario: "envio_formulario",
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

export function trackPhoneClick(payload: {
  href?: string;
  placement: string;
  service?: string;
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.clickPhone,
    href: payload.href,
    placement: payload.placement,
    service_name: payload.service,
  });
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

export function trackFormSubmit(payload: {
  servicio: string;
  ubicacion: "hero" | "sticky" | "seccion" | "contacto" | "footer" | "tipos";
}) {
  pushAnalyticsEvent({
    event: analyticsEventNames.envioFormulario,
    servicio: payload.servicio,
    ubicacion: payload.ubicacion,
  });
}

export function trackQuoteSubmit(payload: {
  origin?: string;
  photoStatus: string;
  service: string;
  timing: string;
  workType: string;
}) {
  const normalized = payload.service.trim().toLowerCase();
  const servicio = normalized.includes("cancel")
    ? "canceles"
    : normalized.includes("ventana")
      ? "ventanas"
      : normalized.includes("barandal")
        ? "barandales"
        : "";

  pushAnalyticsEvent({
    event: analyticsEventNames.envioFormulario,
    servicio,
    ubicacion: "contacto",
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
