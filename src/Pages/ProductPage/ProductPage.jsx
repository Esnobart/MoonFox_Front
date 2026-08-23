import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import css from "./ProductPage.module.css";

function ProductPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;
  const backPath = from
    ? `${from.pathname}${from.search || ""}${from.hash || ""}`
    : "/";

  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Product</title>
      </Helmet>

      <button
        type="button"
        className={css.backButton}
        onClick={() => navigate(backPath)}
      >
        Back
      </button>

      <p className={css.eyebrow}>Product</p>
      <h1 className={css.title}>Product page</h1>
      <p className={css.text}>Route for product id: {productId}</p>
    </section>
  );
}

export default ProductPage;
