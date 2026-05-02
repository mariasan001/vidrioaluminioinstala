export type NavItem = {
  href: string;
  label: string;
};

export const desktopPrimaryLinks: NavItem[] = [
  { href: "#inicio", label: "Inicio" },
  { href: "#somos", label: "Somos" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#calidad", label: "Calidad" },
];

export const desktopSecondaryLinks: NavItem[] = [
  { href: "#ubicacion", label: "Ubicacion" },
];

export const mobileLinks: NavItem[] = [
  ...desktopPrimaryLinks,
  ...desktopSecondaryLinks,
  { href: "#cotizacion", label: "Crear cotizacion" },
];
