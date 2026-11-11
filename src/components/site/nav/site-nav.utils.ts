import type { NavItem } from "./site-nav.data";

export function getNavItemKey(item: NavItem, index: number) {
  return `${item.href}-${item.label}-${index}`;
}
