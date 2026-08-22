import { Helmet } from "react-helmet-async";

import Products from "../../Components/Products/Products";
import {
  productsByPopularity,
  fetchedCollections,
  fetchedAuthors,
} from "../../redux/products/selectors";

function HomePage() {
  return (
    <div>
      <Helmet>
        <title>MoonFox | Home</title>
      </Helmet>
      <section>
        <h1>Official Artist Collabs</h1>
        <ul>
          {productsByPopularity.map((product) => (
            <li key={product.id}>
              <Products location={location} data={product} />
            </li>
          ))}
        </ul>
        <button onClick={() => (window.location.href = "/products")}>
          View More
        </button>
      </section>

      <section>
        <h1>Collections</h1>
        <ul>
          {fetchedCollections.map((product) => (
            <li key={product.id}>
              <Products location={location} data={product} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h1>Follow the Artists</h1>
        <ul>
          {fetchedAuthors.map((product) => (
            <li key={product.id}>
              <Products location={location} data={product} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
