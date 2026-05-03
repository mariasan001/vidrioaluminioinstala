import {
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import type { ContactIconName } from "./home-contact.data";

export const contactIcons = {
  clock: HiOutlineClock,
  location: HiOutlineMapPin,
  phone: HiOutlinePhone,
} satisfies Record<ContactIconName, IconType>;
