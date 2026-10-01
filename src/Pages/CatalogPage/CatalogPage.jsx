import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import SearchBar from "../../Components/SearchBar/SearchBar.jsx";
import { fetchProducts } from "../../../redux/products/operations.js";
import {
  fetchedAuthors,
  fetchedCollections,
  fetchedProducts,
  productsLoading,
  productsRejected,
} from "../../../redux/products/selectors.js";
import css from "./CatalogPage.module.css";

const catalogTitles = {
  all: "All MoonFox works",
  popular: "Popular works",
  collections: "Browse collections",
  authors: "Artists and their works",
};

const supportedPageTypes = new Set(["popular", "collections", "authors"]);

const productMatchesFilters = (
  product,
  normalizedSearch,
  normalizedCollection,
  normalizedAuthor,
) => {
  const authorName = product.author?.username || "Unknown artist";
  const collectionName =
    product.collectionName?.name || "Independent work";
  const searchableText = [product.name, authorName, collectionName]
    .join(" ")
    .toLowerCase();

  return (
    (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
    (!normalizedCollection ||
      collectionName.toLowerCase() === normalizedCollection) &&
    (!normalizedAuthor || authorName.toLowerCase() === normalizedAuthor)
  );
};

function ProductCard({ product, location }) {
  return (
    <li className={css.productCard}>
      <Link
        to={`/products/${product._id}`}
        state={{ from: location }}
        className={css.productImageLink}
      >
        <img
          src={product.img}
          alt={product.name}
          className={css.productImage}
        />
      </Link>

      <div className={css.productInfo}>
        <Link
          to={`/products/${product._id}`}
          state={{ from: location }}
          className={css.productNameLink}
        >
          <h2 className={css.productName}>{product.name}</h2>
        </Link>

        <div className={css.productMeta}>
          <Link
            to={`/profile/${encodeURIComponent(product.author?.username || "")}`}
            state={{ from: location }}
          >
            {product.author?.username || "Unknown artist"}
          </Link>
          <Link
            to={`/catalog?collection=${encodeURIComponent(product.collectionName?.name || "")}`}
            state={{ from: location }}
          >
            {product.collectionName?.name || "Independent work"}
          </Link>
        </div>
      </div>
    </li>
  );
}

function ProductList({ products, location, grouped = false }) {
  return (
    <ul
      className={`${css.productsList} ${grouped ? css.groupProductsList : ""}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          location={location}
        />
      ))}
    </ul>
  );
}

function CatalogGroup({ group, type, location }) {
  const isAuthor = type === "authors";
  const name = isAuthor ? group.username : group.name;
  const destination = isAuthor
    ? `/profile/${encodeURIComponent(group.username)}`
    : `/catalog?collection=${encodeURIComponent(group.name)}`;
  const workLabel =
    group.products.length === 1 ? "1 work" : `${group.products.length} works`;

  return (
    <section className={css.catalogGroup}>
      <Link
        to={destination}
        state={{ from: location }}
        className={`${css.groupBanner} ${
          isAuthor ? css.authorBanner : css.collectionBanner
        }`}
      >
        {isAuthor ? (
          group.avatar ? (
            <img src={group.avatar} alt="" className={css.groupAvatar} />
          ) : (
            <span className={css.groupAvatarFallback} aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
          )
        ) : (
          group.coverImg && (
            <img src={group.coverImg} alt="" className={css.groupCover} />
          )
        )}

        <div className={css.groupHeading}>
          <p>{isAuthor ? "Artist" : "Collection"}</p>
          <h2>{name}</h2>
        </div>
        <span className={css.groupCount}>{workLabel}</span>
      </Link>

      <ProductList products={group.products} location={location} grouped />
    </section>
  );
}

function CatalogPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useSelector(fetchedProducts);
  const authors = useSelector(fetchedAuthors);
  const collections = useSelector(fetchedCollections);
  const isLoading = useSelector(productsLoading);
  const isRejected = useSelector(productsRejected);
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || "",
  );
  const [pagination, setPagination] = useState({ key: "", count: 20 });
  const loadMoreRef = useRef(null);
  const requestedPageType = searchParams.get("type") || "";
  const pageType = supportedPageTypes.has(requestedPageType)
    ? requestedPageType
    : "all";
  const isGroupedCatalog =
    pageType === "authors" || pageType === "collections";
  const collectionFilter = searchParams.get("collection") || "";
  const authorFilter = searchParams.get("author") || "";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const normalizedFilters = useMemo(
    () => ({
      search: searchTerm.trim().toLowerCase(),
      collection: collectionFilter.trim().toLowerCase(),
      author: authorFilter.trim().toLowerCase(),
    }),
    [authorFilter, collectionFilter, searchTerm],
  );

  const filteredProducts = useMemo(() => {
    const matchingProducts = products.filter((product) =>
      productMatchesFilters(
        product,
        normalizedFilters.search,
        normalizedFilters.collection,
        normalizedFilters.author,
      ),
    );

    if (pageType !== "popular") {
      return matchingProducts;
    }

    return [...matchingProducts].sort(
      (firstProduct, secondProduct) =>
        (secondProduct.popular || 0) - (firstProduct.popular || 0),
    );
  }, [normalizedFilters, pageType, products]);

  const catalogGroups = useMemo(() => {
    if (!isGroupedCatalog) {
      return [];
    }

    const groups = pageType === "authors" ? authors : collections;

    return groups
      .map((group) => ({
        ...group,
        products: group.products.filter((product) =>
          productMatchesFilters(
            product,
            normalizedFilters.search,
            normalizedFilters.collection,
            normalizedFilters.author,
          ),
        ),
      }))
      .filter((group) => group.products.length > 0);
  }, [
    authors,
    collections,
    isGroupedCatalog,
    normalizedFilters,
    pageType,
  ]);

  const paginationKey = [
    pageType,
    normalizedFilters.search,
    normalizedFilters.collection,
    normalizedFilters.author,
  ].join("|");
  const visibleCount =
    pagination.key === paginationKey ? pagination.count : 20;

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );
  const hasMoreProducts =
    !isGroupedCatalog && visibleCount < filteredProducts.length;

  const handleSearchChange = (nextSearchTerm) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextSearchTerm.trim()) {
      nextSearchParams.set("search", nextSearchTerm);
    } else {
      nextSearchParams.delete("search");
    }

    setSearchParams(nextSearchParams, { replace: true });
    setSearchTerm(nextSearchTerm);
  };

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setPagination((currentPagination) => {
          const currentCount =
            currentPagination.key === paginationKey
              ? currentPagination.count
              : 20;

          return {
            key: paginationKey,
            count: Math.min(currentCount + 20, filteredProducts.length),
          };
        });
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [filteredProducts.length, hasMoreProducts, paginationKey]);

  const isEmpty = isGroupedCatalog
    ? catalogGroups.length === 0
    : filteredProducts.length === 0;

  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Catalog</title>
      </Helmet>

      <div className={css.header}>
        <div>
          <p className={css.eyebrow}>Catalog</p>
          <h1 className={css.title}>{catalogTitles[pageType]}</h1>
        </div>

        <SearchBar value={searchTerm} onChange={handleSearchChange} />
      </div>

      {isLoading && products.length === 0 ? (
        <p className={css.catalogState}>Loading works...</p>
      ) : isRejected ? (
        <p className={css.catalogState}>The catalog could not be loaded.</p>
      ) : isEmpty ? (
        <p className={css.catalogState}>No works match these filters.</p>
      ) : isGroupedCatalog ? (
        <div className={css.catalogGroups}>
          {catalogGroups.map((group) => (
            <CatalogGroup
              key={group._id}
              group={group}
              type={pageType}
              location={location}
            />
          ))}
        </div>
      ) : (
        <ProductList products={visibleProducts} location={location} />
      )}

      {hasMoreProducts && (
        <div className={css.loadMoreTrigger} ref={loadMoreRef}>
          Loading more works...
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
