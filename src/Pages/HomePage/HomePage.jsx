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
    <div>
      <Helmet>
        <title>MoonFox | Home</title>
      </Helmet>
      <section>
        <h1>Official Artist Collabs</h1>
        <ul>
          {popularProducts.map((product) => (
            <li key={product._id}>
              <Link
                to={`/products/${product._id}`}
                state={{ from: location }}
              >
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/catalog">View all</Link>
      </section>

      <section>
        <h1>Collections</h1>
        <ul>
          {collections.map((collection) => (
            <li key={collection.collectionName}>{collection.collectionName}</li>
          ))}
        </ul>
      </section>

      <section>
        <h1>Follow the Artists</h1>
        <ul>
          {authors.map((author) => (
            <li key={author.author}>{author.author}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
