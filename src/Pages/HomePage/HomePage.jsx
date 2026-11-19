import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import ArtistMarquee from "../../Components/ArtistMarquee/ArtistMarquee.jsx";
import {
  createSmoothScroll,
  getWheelScrollDelta,
} from "../../utils/horizontalScroll.js";
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

function HomeSectionHeader({
  title,
  id,
  to,
  label,
  location,
  primary = false,
}) {
  const Heading = primary ? "h1" : "h2";

  return (
    <div className={css.sectionHeader}>
      <Heading id={id} className={css.sectionTitle}>
        {title}
      </Heading>
      <Link
        to={to}
        state={{ from: location }}
        className={css.sectionLink}
        aria-label={label}
      >
        View all <Arrow />
      </Link>
    </div>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const popularListRef = useRef(null);
  const popularProducts = useSelector(productsByPopularity);
  const homeCollections = useSelector(fetchedCollections);
  const featuredAuthors = useSelector(fetchedAuthors);
  const artistRows = [
    featuredAuthors.filter((_, index) => index % 2 === 0),
    featuredAuthors.length > 1
      ? featuredAuthors.filter((_, index) => index % 2 === 1)
      : featuredAuthors,
  ];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const list = popularListRef.current;
    const bounds = list.getBoundingClientRect();
    const cards = [...list.children];

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.dataset.productReveal =
        rect.right > bounds.left && rect.left < bounds.right
          ? "visible"
          : "pending";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            entry.target.dataset.productReveal = "pending";
          } else if (
            entry.intersectionRatio >= 0.01 &&
            entry.target.dataset.productReveal === "pending"
          ) {
            entry.target.dataset.productReveal = "entering";
          }
        });
      },
      { root: list, threshold: [0, 0.01] },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [popularProducts]);

  useEffect(() => {
    const scrollers = new Map();
    const scrollHorizontalListWithWheel = (event) => {
      if (event.ctrlKey) return;

      const list = event.target.closest?.("[data-horizontal-scroll]");
      if (!list || list.scrollWidth <= list.clientWidth) return;

      if (!scrollers.has(list)) {
        let remainder = 0;
        scrollers.set(
          list,
          createSmoothScroll((delta) => {
            const maxScrollLeft = list.scrollWidth - list.clientWidth;
            const nextScrollLeft = Math.max(
              0,
              Math.min(list.scrollLeft + delta + remainder, maxScrollLeft),
            );
            list.scrollLeft = nextScrollLeft;
            remainder = nextScrollLeft - list.scrollLeft;
          }),
        );
      }

      event.preventDefault();
      scrollers.get(list).scrollBy(getWheelScrollDelta(event, list));
    };

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
      scrollers.forEach((scroller) => scroller.cancel());
    };
  }, []);

  return (
    <section className={css.homePage}>
      <Helmet>
        <title>MoonFox | Home</title>
      </Helmet>

      <section className={css.homeSection} aria-labelledby="home-popular-title">
        <HomeSectionHeader
          title="Official Artist Collab"
          id="home-popular-title"
          to="/catalog?type=popular"
          label="View all popular works"
          location={location}
          primary
        />

        <ul
          ref={popularListRef}
          className={`${css.scrollList} ${css.productsList}`}
          data-horizontal-scroll
        >
          {popularProducts.map((product) => (
            <li className={css.productItem} key={product._id}>
              <div className={css.productCard}>
                <Link
                  to={`/products/${product._id}`}
                  state={{ from: location }}
                  className={css.productImageLink}
                >
                  <img
                    className={css.productImage}
                    src={
                      product.images?.[0] || "/images/product-placeholder.svg"
                    }
                    alt={product.name}
                    width="320"
                    height="320"
                    decoding="async"
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
                    className={`${css.productMetaLink} ${css.productAuthor}`}
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
                    {`€${Number(product.price || 0).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className={css.homeSection}
        aria-labelledby="home-collections-title"
      >
        <HomeSectionHeader
          title="Collections"
          id="home-collections-title"
          to="/catalog?type=collections"
          label="View all collections"
          location={location}
        />
        <div className={css.inner}>
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
                          src={
                            product.images?.[0] ||
                            "/images/product-placeholder.svg"
                          }
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
        </div>
      </section>

      <section className={css.homeSection} aria-labelledby="home-artists-title">
        <HomeSectionHeader
          title="Follow the Artists"
          id="home-artists-title"
          to="/catalog?type=authors"
          label="View all artists"
          location={location}
        />

        <div className={css.artistMarquees}>
          {artistRows.map(
            (authors, index) =>
              authors.length > 0 && (
                <ArtistMarquee
                  key={index}
                  authors={authors}
                  location={location}
                  direction={index === 0 ? "right" : "left"}
                  label={`Featured artists, row ${index + 1}`}
                />
              ),
          )}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
