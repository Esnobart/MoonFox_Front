import { Helmet } from "react-helmet-async";

import css from "./CatalogPage.module.css";

function CatalogPage() {
  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Catalog</title>
      </Helmet>

      <p className={css.eyebrow}>Catalog</p>
      <h1 className={css.title}>All MoonFox works</h1>
      <p className={css.text}>
        The catalog page is ready for product cards, filters, collections, and
        artists.
      </p>
    </section>
  );
}

export default CatalogPage;
