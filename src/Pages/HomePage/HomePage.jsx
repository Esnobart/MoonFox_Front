import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { fetchProducts } from "../../../redux/products/operations.js";
import {
  fetchedAuthors,
  fetchedCollections,
  productsByPopularity,
} from "../../../redux/products/selectors.js";
import css from "./HomePage.module.css";

function Arrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const getWheelScrollDelta = (event, list) => {
  const rawDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

  if (event.deltaMode === 1) {
    return rawDelta * 32;
  }

  if (event.deltaMode === 2) {
    return rawDelta * list.clientWidth;
  }

  return rawDelta;
};

const scrollHorizontalListWithWheel = (event) => {
  const list = event.target.closest("[data-horizontal-scroll]");

  if (!list) {
    return;
  }

  const maxScrollLeft = list.scrollWidth - list.clientWidth;

  if (maxScrollLeft <= 0) {
    return;
  }

  const previousScrollLeft = list.scrollLeft;
  const scrollDelta = getWheelScrollDelta(event, list);
  const nextScrollLeft = Math.max(
    0,
    Math.min(previousScrollLeft + scrollDelta, maxScrollLeft),
  );

  event.preventDefault();
  list.scrollLeft = nextScrollLeft;
};

function HomePage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const popularProducts = useSelector(productsByPopularity);
  const homeCollections = useSelector(fetchedCollections);
  const featuredAuthors = useSelector(fetchedAuthors).slice(0, 10);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    document.addEventListener("wheel", scrollHorizontalListWithWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      document.removeEventListener(
        "wheel",
        scrollHorizontalListWithWheel,
        true,
      );
    };
  }, []);

  return (
    <section className={css.homePage}>
      <Helmet>
        <title>MoonFox | Home</title>
      </Helmet>

      <section className={css.collabSection}>
        <div className={css.sectionHeader}>
          <h1 className={css.sectionTitle}>Official Artist Collab</h1>
        </div>

        <ul
          className={`${css.scrollList} ${css.productsList}`}
          data-horizontal-scroll
        >
          {popularProducts.map((product) => (
            <li className={css.productItem} key={product._id}>
              <Link
                to={`/products/${product._id}`}
                state={{ from: location }}
                className={css.productImageLink}
              >
                <img
                  className={css.productImage}
                  src={product.img}
                  alt={product.name}
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
                <Link
                  to={`/profile/${encodeURIComponent(product.author?.username || "")}`}
                  state={{ from: location }}
                  className={css.productMetaLink}
                >
                  {product.author?.username || "Unknown artist"}
                </Link>
                <Link
                  to={`/catalog?collection=${encodeURIComponent(product.collectionName?.name || "")}`}
                  state={{ from: location }}
                  className={css.productMetaLink}
                >
                  {product.collectionName?.name || "Independent work"}
                </Link>
                <p className={css.productPrice}>
                  {`$${Number(product.price || 0).toFixed(2)}`}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className={css.viewAllRow}>
          <Link
            to="/catalog?type=popular"
            state={{ from: location }}
            className={css.viewAllLink}
          >
            View all
          </Link>
        </div>
      </section>

      <section className={css.section} aria-labelledby="home-collections-title">
        <div className={css.inner}>
          <div className={css.header}>
            <h2 id="home-collections-title" className={css.sectionTitle}>
              Collections
            </h2>
            <span className={css.headerLine} aria-hidden="true" />
          </div>

          <ul
            id="home-collections-board"
            className={css.board}
            aria-label="Featured collections"
          >
            {homeCollections.map((collection) => (
              <li key={collection._id} className={css.collection}>
                <h3 className={css.collectionTitle}>{collection.name}</h3>

                <ul
                  className={css.products}
                  aria-label={`${collection.name} products`}
                >
                  {collection.products.slice(0, 4).map((product) => (
                    <li className={css.product} key={product._id}>
                      <Link
                        to={`/products/${product._id}`}
                        state={{ from: location }}
                        className={css.productLink}
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                          className={css.productImage}
                          loading="lazy"
                          decoding="async"
                          width="320"
                          height="320"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/catalog?collection=${encodeURIComponent(collection.name)}`}
                  state={{ from: location }}
                  className={css.collectionButton}
                  aria-label={`View all ${collection.name} products`}
                >
                  View all
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>

          <div className={css.footer}>
            <Link
              to="/catalog?type=collections"
              state={{ from: location }}
              className={css.catalogLink}
            >
              All collections <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className={css.artistsSection}>
        <div className={css.sectionHeader}>
          <h2 className={css.sectionTitle}>Follow the Artists</h2>
        </div>

        <ul
          className={`${css.scrollList} ${css.artistsList}`}
          data-horizontal-scroll
        >
          {featuredAuthors.map((author) => (
            <li className={css.artistItem} key={author._id}>
              <Link
                to={`/profile/${encodeURIComponent(author.username)}`}
                state={{ from: location }}
                className={css.artistLink}
              >
                {author.avatar ? (
                  <img
                    className={css.artistImage}
                    src={author.avatar}
                    alt={author.username}
                  />
                ) : (
                  <span className={css.artistFallback} aria-hidden="true">
                    {author.username.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{author.username}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={css.viewAllRow}>
          <Link
            to="/catalog?type=authors"
            state={{ from: location }}
            className={css.viewAllLink}
          >
            View all
          </Link>
        </div>
      </section>
    </section>
  );
}

export default HomePage;
