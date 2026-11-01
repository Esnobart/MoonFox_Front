import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import SearchBar from "../../Components/SearchBar/SearchBar.jsx";
import { fetchProducts } from "../../../redux/products/operations.js";
import {
  catalogAuthors,
  catalogProducts,
  catalogProductGroups,
  catalogProductTypes,
  fetchedProducts,
  getProductType,
  productsLoading,
  productsRejected,
} from "../../../redux/products/selectors.js";
import css from "./CatalogPage.module.css";

const catalogTitles = {
  overview: "Explore the catalog",
  all: "All MoonFox works",
  popular: "Popular works",
  collections: "Browse collections",
  authors: "Artists and their works",
};

function getCatalogPageType(searchParams) {
  const requestedType = searchParams.get("type");
  if (["popular", "collections", "authors", "all"].includes(requestedType)) {
    return requestedType;
  }

  const hasFilters = ["search", "author", "collection", "productType", "sort"].some(
    (filter) => searchParams.get(filter)?.trim(),
  );
  return hasFilters ? "all" : "overview";
}

function ProductCard({ product, location }) {
  return (
    <li className={css.productCard}>
      <Link
        to={`/products/${product._id}`}
        state={{ from: location }}
        className={css.productImageLink}
      >
        <img
          src={product.images?.[0] || "/images/product-placeholder.svg"}
          alt={product.name}
          className={css.productImage}
          loading="lazy"
        />
      </Link>

      <div className={css.productInfo}>
        <Link
          to={`/catalog?${new URLSearchParams({ productType: getProductType(product) })}`}
          state={{ from: location }}
          className={css.productType}
        >
          {getProductType(product)}
        </Link>
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

function CatalogOverview({ authors, productTypes, location }) {
  const cards = [
    ...authors.map((author) => ({
      key: `author-${author._id}`,
      title: author.username,
      label: `View works by ${author.username}`,
      to: `/catalog?${new URLSearchParams({ author: author.username })}`,
    })),
    ...productTypes.map((type) => ({
      key: `type-${type.name}`,
      title: type.name,
      label: `Shop ${type.name}`,
      to: `/catalog?${new URLSearchParams({ productType: type.name })}`,
    })),
    {
      key: "all-products",
      title: "All products",
      label: "All products",
      to: "/catalog?type=all",
    },
  ];

  return (
    <ul className={css.catalogGrid} aria-label="Browse artists and product types">
      {cards.map((card) => (
        <li key={card.key}>
          <Link
            to={card.to}
            state={{ from: location }}
            className={css.catalogCard}
            aria-label={card.label}
          >
            <span className={css.catalogCardTitle}>{card.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CatalogPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useSelector(fetchedProducts);
  const popularAuthors = useSelector(catalogAuthors);
  const productTypes = useSelector(catalogProductTypes);
  const isLoading = useSelector(productsLoading);
  const isRejected = useSelector(productsRejected);
  const searchTerm = searchParams.get("search") || "";
  const [pagination, setPagination] = useState({ key: "", count: 20 });
  const loadMoreRef = useRef(null);
  const pageType = getCatalogPageType(searchParams);
  const isOverview = pageType === "overview";
  const isGroupedCatalog =
    pageType === "authors" || pageType === "collections";
  const collectionFilter = searchParams.get("collection") || "";
  const authorFilter = searchParams.get("author") || "";
  const productTypeFilter = searchParams.get("productType") || "";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const normalizedFilters = useMemo(
    () => ({
      search: searchTerm.trim().toLowerCase(),
      collection: collectionFilter.trim().toLowerCase(),
      author: authorFilter.trim().toLowerCase(),
      productType: productTypeFilter.trim().toLowerCase(),
    }),
    [authorFilter, collectionFilter, productTypeFilter, searchTerm],
  );

  const filteredProducts = useSelector(
    (state) => catalogProducts(state, normalizedFilters),
  );
  const catalogGroups = useSelector(
    (state) => catalogProductGroups(state, normalizedFilters, pageType),
  );

  const paginationKey = [
    pageType,
    normalizedFilters.search,
    normalizedFilters.collection,
    normalizedFilters.author,
    normalizedFilters.productType,
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
  };

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMoreProducts || isRejected) return;

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
  }, [filteredProducts.length, hasMoreProducts, isRejected, paginationKey]);

  const isEmpty = isGroupedCatalog
    ? catalogGroups.length === 0
    : filteredProducts.length === 0;
  const activeFilters = [
    ["author", authorFilter],
    ["collection", collectionFilter],
    ["productType", productTypeFilter],
  ].filter(([, value]) => value);
  const title = activeFilters.length === 1
    ? activeFilters[0][1]
    : catalogTitles[pageType];

  return (
    <section className={css.page}>
      <Helmet>
        <title>{`MoonFox | ${title}`}</title>
      </Helmet>

      <div className={css.header}>
        <div>
          <p className={css.eyebrow}>Catalog</p>
          {!isOverview && (
            <Link to="/catalog" className={css.backLink}>← Catalog</Link>
          )}
          <h1 className={css.title}>{title}</h1>
          {isOverview && (
            <p className={css.intro}>
              Discover artists, find your favourite merch, and explore their works.
            </p>
          )}
        </div>

        <SearchBar value={searchTerm} onChange={handleSearchChange} />
      </div>

      {activeFilters.length > 0 && (
        <div className={css.activeFilters} aria-label="Active filters">
          {activeFilters.map(([key, value]) => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete(key);
            return (
              <Link
                key={key}
                to={`/catalog?${nextParams}`}
                className={css.filterChip}
                aria-label={`Remove ${value} filter`}
              >
                {value} <span aria-hidden="true">×</span>
              </Link>
            );
          })}
          <Link to="/catalog?type=all" className={css.backLink}>Clear filters</Link>
        </div>
      )}

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
        <>
          {isOverview && (
            <CatalogOverview
              authors={popularAuthors}
              productTypes={productTypes}
              location={location}
            />
          )}
          <section aria-labelledby="catalog-products-title">
            <div className={css.sectionHeading}>
              <h2 id="catalog-products-title">{isOverview ? "Popular products" : "Products"}</h2>
              <span className={css.sectionNote}>
                {filteredProducts.length} works · Most popular first
              </span>
            </div>
            <ProductList products={visibleProducts} location={location} />
          </section>
        </>
      )}

      {hasMoreProducts && !isRejected && (
        <div className={css.loadMoreTrigger} ref={loadMoreRef}>
          Loading more works...
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
