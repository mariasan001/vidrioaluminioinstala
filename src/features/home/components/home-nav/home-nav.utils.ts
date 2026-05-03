import type { NavItem } from "./home-nav.data";

export function getNavItemKey(item: NavItem) {
  return `${item.href}-${item.label}`;
}

