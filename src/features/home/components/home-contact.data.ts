import {
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";

export const contactCards = [
  {
    title: "Ubicacion",
    value: "Lago Winnipeg 101",
    detail: "El Seminario Primera Secc, 50170 Toluca de Lerdo, Mex.",
    href: "#ubicacion",
    action: "Ver direccion",
    Icon: HiOutlineMapPin,
  },
  {
    title: "Llamanos",
    value: "729 381 3723",
    detail: "Contacto directo para atencion y cotizaciones.",
    href: "tel:7293813723",
    action: "Llamar ahora",
    Icon: HiOutlinePhone,
  },
  {
    title: "Horarios",
    value: "Lunes a sabado",
    detail: "8:00am - 6:00pm. Domingo: No abrimos.",
    href: "#ubicacion",
    action: "Horario de atencion",
    Icon: HiOutlineClock,
  },
] as const;
