import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchProductById } from "../../../redux/products/operations.js";
import {
  fetchedTempProduct,
  productLoading,
  productRejected,
} from "../../../redux/products/selectors.js";
import { clearTempProduct } from "../../../redux/products/slice.js";
import {
  addProductToBasket,
  addProductToWishlist,
  removeProductFromWishlist,
} from "../../../redux/users/operations.js";
import {
  isRefreshing,
  isUserLogged,
  userData,
  userLoading,
  userWishlist,
} from "../../../redux/users/selectors.js";
import { addGuestBasketProduct } from "../../utils/guestBasket.js";
import css from "./ProductPage.module.css";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

const getProductId = (product) =>
  typeof product === "string" ? product : product?._id;

function ProductPage() {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quantityState, setQuantityState] = useState({
    productId: null,
    value: 1,
  });
  const [photoState, setPhotoState] = useState({ productId: null, url: null });
  const product = useSelector(fetchedTempProduct);
  const images = product?.images ?? [];
  const activePhoto =
    photoState.productId === productId && images.includes(photoState.url)
      ? photoState.url
      : images[0];
  const isLoading = useSelector(productLoading);
  const isRejected = useSelector(productRejected);
  const isLogged = useSelector(isUserLogged);
  const user = useSelector(userData);
  const authIsRefreshing = useSelector(isRefreshing);
  const isAdmin = isLogged && !authIsRefreshing && user.role === "Admin";
  const isUserActionLoading = useSelector(userLoading);
  const wishlist = useSelector(userWishlist);
  const quantity =
    quantityState.productId === productId ? quantityState.value : 1;
  const isSaved = wishlist.some(
    (wishlistProduct) => getProductId(wishlistProduct) === product?._id,
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/catalog", { replace: true });
  };

  const decreaseQuantity = () => {
    setQuantityState({
      productId,
      value: Math.max(1, quantity - 1),
    });
  };

  const increaseQuantity = () => {
    setQuantityState({
      productId,
      value: Math.min(product.inStock, quantity + 1),
    });
  };

  const handleAddToBasket = async () => {
    if (!isLogged) {
      addGuestBasketProduct(product, quantity);
      toast.success("Added to basket.");
      return;
    }

    try {
      await dispatch(
        addProductToBasket({ productId: product._id, quantity }),
      ).unwrap();
      toast.success("Added to basket.");
    } catch (error) {
      toast.error(error || "Could not add this work to basket.");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLogged) {
      toast.info("Please sign in to save works to your wishlist.");
      return;
    }

    try {
      if (isSaved) {
        await dispatch(removeProductFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist.");
      } else {
        await dispatch(addProductToWishlist(product._id)).unwrap();
        toast.success("Saved to wishlist.");
      }
    } catch (error) {
      toast.error(error || "Could not update wishlist.");
    }
  };

  useEffect(() => {
    const request = dispatch(fetchProductById(productId));

    return () => {
      request.abort();
      dispatch(clearTempProduct());
    };
  }, [dispatch, productId]);

  return (
    <section className={css.page}>
      <Helmet>
        <title>
          {product ? `MoonFox | ${product.name}` : "MoonFox | Product"}
        </title>
      </Helmet>

      <div className={css.toolbar}>
        <button
          type="button"
          className={css.backButton}
          onClick={handleBack}
        >
          Back
        </button>
        {isAdmin && product && !isLoading && !isRejected && (
          <Link
            to={`/products/${product._id}/edit`}
            className={css.editLink}
          >
            Edit product
          </Link>
        )}
      </div>

      {isLoading && (
        <div className={css.stateBlock}>
          <p className={css.eyebrow}>Product</p>
          <h1 className={css.title}>Loading work...</h1>
        </div>
      )}

      {isRejected && !isLoading && (
        <div className={css.stateBlock}>
          <p className={css.eyebrow}>Product</p>
          <h1 className={css.title}>This work could not be loaded</h1>
          <p className={css.text}>
            The link may be outdated, or the product is not available anymore.
          </p>
          <Link
            to="/catalog"
            state={{ from: location }}
            className={css.catalogLink}
          >
            Return to catalog
          </Link>
        </div>
      )}

      {product && !isLoading && !isRejected && (
        <article className={css.productLayout}>
          <aside className={css.infoPanel}>
            <p className={css.eyebrow}>Official Artist Collab</p>
            <h1 className={css.title}>{product.name}</h1>

            <div className={css.metaList}>
              <Link
                to={`/profile/${encodeURIComponent(product.author.username)}`}
                state={{ from: location }}
                className={css.metaItem}
              >
                <span>Artist</span>
                <strong>{product.author.username}</strong>
              </Link>

              <Link
                to={`/catalog?collection=${encodeURIComponent(product.collectionName.name)}`}
                state={{ from: location }}
                className={css.metaItem}
              >
                <span>Collection</span>
                <strong>{product.collectionName.name}</strong>
              </Link>
            </div>

            <p className={css.description}>
              {product.description ||
                "A collectible MoonFox work for fans and artists."}
            </p>
          </aside>

          <div className={css.imageStage}>
            <img
              className={css.productImage}
              src={activePhoto || "/images/product-placeholder.svg"}
              alt={activePhoto ? product.name : product.name + ": no photo"}
            />
            {images.length > 1 && (
              <div className={css.thumbnails} role="group" aria-label="Product photos">
                {images.map((url, index) => (
                  <button
                    key={url + "-" + index}
                    type="button"
                    className={css.thumbnailButton}
                    aria-label={"Show photo " + (index + 1)}
                    aria-pressed={activePhoto === url}
                    onClick={() => setPhotoState({ productId, url })}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className={css.buyPanel}>
            <div>
              <p className={css.price}>{formatPrice(product.price)}</p>
              <p className={product.inStock > 0 ? css.stock : css.soldOut}>
                {product.inStock > 0
                  ? `${product.inStock} in stock`
                  : "Sold out"}
              </p>
            </div>

            {product.ageRestriction && product.ageRestriction !== "None" && (
              <p className={css.ageBadge}>{product.ageRestriction}</p>
            )}

            <div className={css.actions}>
              <div className={css.quantityControl} aria-label="Quantity">
                <button
                  type="button"
                  className={css.quantityButton}
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isUserActionLoading}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className={css.quantityValue}>{quantity}</span>
                <button
                  type="button"
                  className={css.quantityButton}
                  onClick={increaseQuantity}
                  disabled={quantity >= product.inStock || isUserActionLoading}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={css.primaryButton}
                disabled={product.inStock <= 0 || isUserActionLoading}
                onClick={handleAddToBasket}
              >
                Add to basket
              </button>
              <button
                type="button"
                className={`${css.secondaryButton} ${isSaved ? css.savedButton : ""}`}
                disabled={isUserActionLoading}
                onClick={handleWishlistToggle}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>

            <dl className={css.detailsList}>
              <div>
                <dt>Product ID</dt>
                <dd>{product._id}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  {product.inStock > 0
                    ? "Ready to ship"
                    : "Currently unavailable"}
                </dd>
              </div>
            </dl>
          </aside>
        </article>
      )}
    </section>
  );
}

export default ProductPage;
