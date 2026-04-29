export type NavItem = {
  href: string;
  label: string;
};

export const desktopPrimaryLinks: NavItem[] = [
  { href: "#servicios", label: "Servicios" },
  { href: "#ofertas", label: "Ofertas" },
  { href: "#somos", label: "Somos" },
  { href: "#proyectos", label: "Proyectos" },
];

export const desktopSecondaryLinks: NavItem[] = [
  { href: "#ubicacion", label: "Ubicacion" },
];

export const mobileLinks: NavItem[] = [
  ...desktopPrimaryLinks,
  ...desktopSecondaryLinks,
  { href: "#cotizacion", label: "Crear cotizacion" },
];
