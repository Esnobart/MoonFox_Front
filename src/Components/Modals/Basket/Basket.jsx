import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  addProductToBasket,
  refreshBasket,
  removeProductFromBasket,
  updateBasketProductQuantity,
} from "../../../../redux/users/operations.js";
import {
  isUserLogged,
  userBasket,
  userLoading,
} from "../../../../redux/users/selectors.js";
import {
  GUEST_BASKET_EVENT,
  getGuestBasket,
  refreshGuestBasketProducts,
  removeGuestBasketProduct,
  saveGuestBasket,
  updateGuestBasketQuantity,
} from "../../../utils/guestBasket.js";
import api from "../../../../redux/api.js";
import css from "./Basket.module.css";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

function Basket() {
  const dispatch = useDispatch();
  const accountBasket = useSelector(userBasket);
  const isLogged = useSelector(isUserLogged);
  const isLoading = useSelector(userLoading);
  const location = useLocation();
  const [guestBasket, setGuestBasket] = useState(getGuestBasket);
  const mergeAttempted = useRef(false);
  const basket = isLogged ? accountBasket : guestBasket;
  const itemCount = basket.reduce((total, item) => total + item.quantity, 0);
  const subtotal = basket.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  useEffect(() => {
    const handleGuestBasketChange = (event) => {
      setGuestBasket(event.detail || getGuestBasket());
    };
    const handleStorageChange = () => setGuestBasket(getGuestBasket());

    window.addEventListener(GUEST_BASKET_EVENT, handleGuestBasketChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(GUEST_BASKET_EVENT, handleGuestBasketChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isLogged) {
      mergeAttempted.current = false;
      return;
    }

    if (mergeAttempted.current || guestBasket.length === 0) {
      return;
    }

    mergeAttempted.current = true;

    const mergeGuestBasket = async () => {
      const failedItems = [];

      for (const item of guestBasket) {
        try {
          await dispatch(
            addProductToBasket({
              productId: item.product._id,
              quantity: item.quantity,
            }),
          ).unwrap();
        } catch {
          failedItems.push(item);
        }
      }

      saveGuestBasket(failedItems);

      if (failedItems.length === 0) {
        toast.success("Guest basket moved to your account.");
      } else {
        toast.warning("Some basket items could not be moved to your account.");
      }
    };

    mergeGuestBasket();
  }, [dispatch, guestBasket, isLogged]);

  const updateQuantity = async (productId, quantity) => {
    if (!isLogged) {
      updateGuestBasketQuantity(productId, quantity);
      return;
    }

    try {
      await dispatch(
        updateBasketProductQuantity({ productId, quantity }),
      ).unwrap();
    } catch (error) {
      toast.error(error || "Could not update basket.");
    }
  };

  const removeProduct = async (productId) => {
    if (!isLogged) {
      removeGuestBasketProduct(productId);
      return;
    }

    try {
      await dispatch(removeProductFromBasket(productId)).unwrap();
    } catch (error) {
      toast.error(error || "Could not remove this work from basket.");
    }
  };

  return (
    <Dialog.Root onOpenChange={(open) => {
      if (!open) return;
      if (isLogged) {
        dispatch(refreshBasket());
      } else {
        refreshGuestBasketProducts(async (id) => {
          try { return (await api.get('products/' + encodeURIComponent(id))).data; }
          catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
          }
        }).catch(() => toast.error("Could not refresh basket details."));
      }
    }}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={css.basketIconButton}
          aria-label={`Open basket, ${itemCount} items`}
        >
          <img src="/icons/basket.svg" alt="" className={css.basketIcon} />
          {itemCount > 0 && (
            <span className={css.basketBadge} aria-hidden="true">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={css.dialogOverlay} />

        <Dialog.Content className={css.dialogContent}>
          <header className={css.dialogHeader}>
            <div>
              <Dialog.Title className={css.title}>Your basket</Dialog.Title>
              <Dialog.Description className={css.description}>
                {isLogged
                  ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
                  : "Saved on this device"}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button type="button" className={css.close} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </Dialog.Close>
          </header>

          <div className={css.dialogBody}>
            {basket.length === 0 ? (
              <div className={css.emptyState}>
                <p>Your basket is empty.</p>
                <Dialog.Close asChild>
                  <Link to="/catalog" className={css.catalogLink}>
                    Browse catalog
                  </Link>
                </Dialog.Close>
              </div>
            ) : (
              <ul className={css.basketList}>
                {basket.map((item) => {
                  const productId = item.product._id;
                  const maxQuantity =
                    Number(item.product.inStock) || item.quantity;

                  return (
                    <li className={css.basketItem} key={item._id || productId}>
                      <Dialog.Close asChild>
                        <Link
                          to={`/products/${productId}`}
                          state={{ from: location }}
                          className={css.imageLink}
                        >
                          <img
                            src={item.product.images?.[0] || "/images/product-placeholder.svg"}
                            alt={item.product.name}
                            className={css.productImage}
                          />
                        </Link>
                      </Dialog.Close>

                      <div className={css.productInfo}>
                        <div className={css.productHeading}>
                          <div>
                            <h3 className={css.productName}>
                              <Dialog.Close asChild>
                                <Link
                                  to={`/products/${productId}`}
                                  state={{ from: location }}
                                  className={css.productLink}
                                >
                                  {item.product.name}
                                </Link>
                              </Dialog.Close>
                            </h3>
                            <p className={css.productMeta}>
                              {item.product.author?.username || "MoonFox artist"}
                              {item.product.collectionName?.name
                                ? ` / ${item.product.collectionName.name}`
                                : ""}
                            </p>
                          </div>
                          <p className={css.productPrice}>
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>

                        <div className={css.productActions}>
                          <div
                            className={css.productControls}
                            aria-label={`${item.product.name} quantity`}
                          >
                            <button
                              type="button"
                              className={css.quantityButton}
                              disabled={item.quantity <= 1 || (isLogged && isLoading)}
                              onClick={() =>
                                updateQuantity(productId, item.quantity - 1)
                              }
                              aria-label={`Decrease ${item.product.name} quantity`}
                            >
                              -
                            </button>
                            <span className={css.productQuantity}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className={css.quantityButton}
                              disabled={
                                item.quantity >= maxQuantity ||
                                (isLogged && isLoading)
                              }
                              onClick={() =>
                                updateQuantity(productId, item.quantity + 1)
                              }
                              aria-label={`Increase ${item.product.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className={css.removeButton}
                            disabled={isLogged && isLoading}
                            onClick={() => removeProduct(productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {basket.length > 0 && (
            <footer className={css.dialogFooter}>
              <div className={css.subtotalRow}>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className={css.footerNote}>
                Shipping and taxes are calculated at checkout.
              </p>
              <Dialog.Close asChild>
                <button type="button" className={css.continueButton}>
                  Continue shopping
                </button>
              </Dialog.Close>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Basket;
