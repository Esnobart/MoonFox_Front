import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { fetchProducts } from "../../../redux/products/operations.js";
import {
  productsByPopularity,
  fetchedCollections,
  fetchedAuthors,
} from "../../../redux/products/selectors.js";
import css from "./HomePage.module.css";

function HomePage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const popularProducts = useSelector(productsByPopularity);
  const collections = useSelector(fetchedCollections);
  const authors = useSelector(fetchedAuthors);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className={css.homePage}>
      <Helmet>
        <title>MoonFox | Home</title>
      </Helmet>

      <section className={css.collabSection}>
        <div className={css.sectionHeader}>
          <h1 className={css.sectionTitle}>Official Artist Collab</h1>
        </div>

        <ul className={`${css.scrollList} ${css.productsList}`}>
          {popularProducts.slice(0, 10).map((product) => (
            <li className={css.productItem} key={product._id}>
              <Link
                to={`/products/${product._id}`}
                state={{ from: location }}
                className={css.productLink}
              >
                <img
                  className={css.productImage}
                  src={product.img}
                  alt={product.name}
                />
                <div className={css.productInfo}>
                  <h2 className={css.productName}>{product.name}</h2>
                  <p>{product.author}</p>
                  <p>{product.collectionName}</p>
                </div>
              </Link>
            </li>
          ))}

          <li className={css.viewAllItem}>
            <Link className={css.viewAllCard} to="/catalog">
              View all
            </Link>
          </li>
        </ul>
      </section>

      <section className={css.collectionsSection}>
        <h2 className={css.darkSectionTitle}>Collections</h2>

        <ul className={`${css.scrollList} ${css.collectionsList}`}>
          {collections.slice(0, 10).map((collection) => (
            <li className={css.collectionItem} key={collection.collectionName}>
              <Link
                to={`/catalog?collection=${encodeURIComponent(
                  collection.collectionName,
                )}`}
                className={css.collectionLink}
              >
                <img
                  className={css.collectionImage}
                  src={collection.products[0]?.img}
                  alt={collection.collectionName}
                />
                <span>{collection.collectionName}</span>
              </Link>
            </li>
          ))}

          <li className={css.viewAllItem}>
            <Link
              className={`${css.viewAllCard} ${css.darkViewAllCard}`}
              to="/catalog"
            >
              View all
            </Link>
          </li>
        </ul>
      </section>

      <section className={css.artistsSection}>
        <h2 className={css.sectionTitle}>Follow the Artists</h2>

        <ul className={`${css.scrollList} ${css.artistsList}`}>
          {authors.slice(0, 10).map((author) => (
            <li className={css.artistItem} key={author.author}>
              <Link
                to={`/catalog?author=${encodeURIComponent(author.author)}`}
                className={css.artistLink}
              >
                <img
                  className={css.artistImage}
                  src={author.products[0]?.img}
                  alt={author.author}
                />
                <span>{author.author}</span>
              </Link>
            </li>
          ))}

          <li className={css.viewAllItem}>
            <Link className={css.viewAllCard} to="/catalog">
              View all
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
