import {
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";

export const contactCards = [
  {
    title: "Ubicación",
    value: "Lago Winnipeg 101",
    detail: "El Seminario Primera Secc, 50170 Toluca de Lerdo, Méx.",
    href: "#ubicacion",
    action: "Ver dirección",
    Icon: HiOutlineMapPin,
  },
  {
    title: "Llámanos",
    value: "729 381 3723",
    detail: "Contacto directo para atención y cotizaciones.",
    href: "tel:7293813723",
    action: "Llamar ahora",
    Icon: HiOutlinePhone,
  },
  {
    title: "Horarios",
    value: "Lunes a sábado",
    detail: "8:00 a. m. - 6:00 p. m. Domingo: No abrimos.",
    href: "#ubicacion",
    action: "Horario de atención",
    Icon: HiOutlineClock,
  },
] as const;
