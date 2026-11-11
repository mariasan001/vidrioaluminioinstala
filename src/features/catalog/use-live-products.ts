export type CatalogProduct = {
  id: string;
  pagina: string;
  titulo: string;
  descripcion: string;
  caracteristicas: string;
  imagen: string;
  accion: "preguntar" | "precio" | "color";
  precio: string;
  color: string;
};

const noProducts: CatalogProduct[] = [];

export function productAction(product: CatalogProduct) {
  if (product.accion === "precio" && product.precio) return product.precio;
  if (product.accion === "color" && product.color) return product.color;
  return "Preguntar precio →";
}

/** Catalog is static for now: no fetching or polling. */
export function useLiveProducts(): CatalogProduct[] {
  return noProducts;
}
