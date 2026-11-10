"use client";

import { useEffect, useState } from "react";

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

function samePage(left: string, right: string) {
  const normal = (value: string) => {
    if (value === "/") return "/";
    return value.replace(/\/$/, "");
  };

  return normal(left || "/") === normal(right || "/");
}

export function productAction(product: CatalogProduct) {
  if (product.accion === "precio" && product.precio) return product.precio;
  if (product.accion === "color" && product.color) return product.color;
  return "Preguntar precio →";
}

export function useLiveProducts() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);

  useEffect(() => {
    let alive = true;
    const path = window.location.pathname;

    const pull = () => {
      fetch("/data/catalogo.json", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!alive || !data) return;
          const rows = Array.isArray(data.productos) ? data.productos : [];
          setProducts(rows.filter((item: CatalogProduct) => samePage(item.pagina, path)));
        })
        .catch(() => {});
    };

    pull();
    const timer = window.setInterval(pull, 4000);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return products;
}
