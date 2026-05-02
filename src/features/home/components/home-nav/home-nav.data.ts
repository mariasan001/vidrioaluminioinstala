export type NavItem = {
  href: string;
  label: string;
  sectionId?: string;
};

export const desktopPrimaryLinks: NavItem[] = [
  { href: "#inicio", label: "Inicio", sectionId: "inicio" },
  { href: "#somos", label: "Somos", sectionId: "somos" },
  { href: "#servicios", label: "Servicios", sectionId: "servicios" },
  { href: "#proyectos", label: "Proyectos", sectionId: "proyectos" },
  { href: "#calidad", label: "Calidad", sectionId: "calidad" },
];

export const desktopSecondaryLinks: NavItem[] = [
  { href: "#ubicacion", label: "Ubicacion", sectionId: "ubicacion" },
];

export const scrollSpyLinks = [
  ...desktopPrimaryLinks,
  ...desktopSecondaryLinks,
].filter((item) => item.sectionId);

export const mobileLinks: NavItem[] = [
  ...desktopPrimaryLinks,
  ...desktopSecondaryLinks,
  { href: "#cotizacion", label: "Crear cotizacion" },
];
