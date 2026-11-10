import { productAction, type CatalogProduct } from "./use-live-products";
import styles from "./live-product-cards.module.css";

const whatsapp = "https://wa.me/527293813723";

export function LiveProductCards({ products }: { products: CatalogProduct[] }) {
  return (
    <div className={styles.track}>
      {products.map((product) => {
        const text = `Hola, me interesa ${product.titulo}. ¿Me pueden dar precio?`;
        const href = `${whatsapp}?text=${encodeURIComponent(text)}`;
        return (
          <a key={product.id} className={styles.card} href={href} target="_blank" rel="noopener noreferrer" data-tipo={product.titulo} data-ubicacion="tipos">
            {product.imagen ? <img className={styles.photo} src={product.imagen} alt={product.titulo} /> : <span className={styles.photo} />}
            <span className={styles.body}>
              <h3>{product.titulo}</h3>
              {product.descripcion ? <p>{product.descripcion}</p> : null}
              {product.caracteristicas ? <p className={styles.detail}>{product.caracteristicas}</p> : null}
              <span className={styles.action}>{productAction(product)}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
