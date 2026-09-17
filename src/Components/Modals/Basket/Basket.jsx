import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  removeProductFromBasket,
  updateBasketProductQuantity,
} from "../../../../redux/users/operations.js";
import { isUserLogged, userBasket } from "../../../../redux/users/selectors.js";
import css from "./Basket.module.css";

function Basket() {
  const dispatch = useDispatch();
  const basket = useSelector(userBasket);
  const isLogged = useSelector(isUserLogged);
  const location = useLocation();

  const updateQuantity = async (productId, quantity) => {
    try {
      await dispatch(updateBasketProductQuantity({ productId, quantity })).unwrap();
    } catch (error) {
      toast.error(error || "Could not update basket.");
    }
  };

  const removeProduct = async (productId) => {
    try {
      await dispatch(removeProductFromBasket(productId)).unwrap();
      toast.success("Removed from basket.");
    } catch (error) {
      toast.error(error || "Could not remove this work from basket.");
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={css.basketIconButton}
          aria-label="Open basket"
        >
          <img src="/icons/basket.svg" alt="" className={css.basketIcon} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={css.dialogOverlay} />

        <Dialog.Content className={css.dialogContent}>
          <Dialog.Title className={css.title}>Basket</Dialog.Title>

          {!isLogged ? (
            <Dialog.Description className={css.description}>
              Sign in to see your basket.
            </Dialog.Description>
          ) : basket.length === 0 ? (
            <Dialog.Description className={css.description}>
              Your basket is empty.
            </Dialog.Description>
          ) : (
            <ul className={css.basketList}>
              {basket.map((item) => {
                const productId = item.product._id;
                const maxQuantity = Number(item.product.inStock) || item.quantity;

                return (
                  <li className={css.basketItem} key={item._id}>
                    <img
                      src={item.product.img}
                      alt=""
                      className={css.productImage}
                    />

                    <div className={css.productInfo}>
                      <h3 className={css.productName}>
                        <Dialog.Close asChild>
                          <Link
                            to={`/products/${item.product._id}`}
                            state={{ from: location }}
                            className={css.productLink}
                          >
                            {item.product.name}
                          </Link>
                        </Dialog.Close>
                      </h3>

                      <p className={css.productMeta}>
                        by {item.product.author?.username || "Unknown"}
                      </p>
                      <p className={css.productMeta}>
                        {item.product.collectionName?.name || "Unknown"}{" "}
                        collection
                      </p>
                      <div className={css.productControls}>
                        <button
                          type="button"
                          className={css.quantityButton}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          aria-label={`Decrease ${item.product.name} quantity`}
                        >
                          -
                        </button>
                        <span className={css.productQuantity}>{item.quantity}</span>
                        <button
                          type="button"
                          className={css.quantityButton}
                          disabled={item.quantity >= maxQuantity}
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          aria-label={`Increase ${item.product.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <p className={css.productPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        className={css.removeButton}
                        onClick={() => removeProduct(productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Dialog.Close asChild>
            <button type="button" className={css.close} aria-label="Close">
              x
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Basket;
