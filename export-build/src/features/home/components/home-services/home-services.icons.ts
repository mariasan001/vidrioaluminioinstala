import type { IconType } from "react-icons";
import { FaDoorOpen, FaShower } from "react-icons/fa6";
import {
  HiOutlineBuildingOffice2,
  HiOutlineSun,
  HiOutlineViewColumns,
  HiOutlineWindow,
} from "react-icons/hi2";
import type { ServiceTitle } from "./home-services.data";

export const serviceIcons = {
  barandales: HiOutlineViewColumns,
  "canceles de baño": FaShower,
  fachadas: HiOutlineBuildingOffice2,
  pérgolas: HiOutlineSun,
  puertas: FaDoorOpen,
  ventanas: HiOutlineWindow,
} satisfies Record<ServiceTitle, IconType>;
