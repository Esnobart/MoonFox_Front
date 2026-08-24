import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import SearchBar from "../../Components/SearchBar/SearchBar.jsx";
import { fetchProducts } from "../../../redux/products/operations.js";
import { fetchedProducts } from "../../../redux/products/selectors.js";
import css from "./CatalogPage.module.css";

const PRODUCTS_PER_PAGE = 20;

function CatalogPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const products = useSelector(fetchedProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return products;

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.author,
        product.collectionName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const handleSearchChange = (nextSearchTerm) => {
    setSearchTerm(nextSearchTerm);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisibleCount((currentCount) =>
          Math.min(currentCount + PRODUCTS_PER_PAGE, filteredProducts.length),
        );
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [filteredProducts.length, hasMoreProducts]);

  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Catalog</title>
      </Helmet>

      <div className={css.header}>
        <div>
          <p className={css.eyebrow}>Catalog</p>
          <h1 className={css.title}>All MoonFox works</h1>
        </div>

        <SearchBar value={searchTerm} onChange={handleSearchChange} />
      </div>

      <ul className={css.productsList}>
        {visibleProducts.map((product) => (
          <li className={css.productCard} key={product._id}>
            <Link
              to={`/products/${product._id}`}
              state={{ from: location }}
              className={css.productLink}
            >
              <img
                src={product.img}
                alt={product.name}
                className={css.productImage}
              />

              <div className={css.productInfo}>
                <h2 className={css.productName}>{product.name}</h2>

                <div className={css.productMeta}>
                  <span>{product.author}</span>
                  <span>{product.collectionName}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasMoreProducts && (
        <div className={css.loadMoreTrigger} ref={loadMoreRef}>
          Loading more works...
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
