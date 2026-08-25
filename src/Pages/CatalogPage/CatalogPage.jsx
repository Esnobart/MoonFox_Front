import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import SearchBar from "../../Components/SearchBar/SearchBar.jsx";
import { fetchProducts } from "../../../redux/products/operations.js";
import { fetchedProducts } from "../../../redux/products/selectors.js";
import css from "./CatalogPage.module.css";

function CatalogPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useSelector(fetchedProducts);
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || "",
  );
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const collectionFilter = searchParams.get("collection") || "";
  const authorFilter = searchParams.get("author") || "";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedCollection = collectionFilter.toLowerCase();
    const normalizedAuthor = authorFilter.toLowerCase();

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.author,
        product.collectionName,
      ]
        .join(" ")
        .toLowerCase();
      const productCollection = product.collectionName?.toLowerCase() || "";
      const productAuthor = product.author?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCollection =
        !normalizedCollection || productCollection === normalizedCollection;
      const matchesAuthor = !normalizedAuthor || productAuthor === normalizedAuthor;

      return matchesSearch && matchesCollection && matchesAuthor;
    });
  }, [products, searchTerm, collectionFilter, authorFilter]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const handleSearchChange = (nextSearchTerm) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextSearchTerm.trim()) {
      nextSearchParams.set("search", nextSearchTerm);
    } else {
      nextSearchParams.delete("search");
    }

    setSearchParams(nextSearchParams, { replace: true });
    setSearchTerm(nextSearchTerm);
    setVisibleCount(20);
  };

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisibleCount((currentCount) =>
          Math.min(currentCount + 20, filteredProducts.length),
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
