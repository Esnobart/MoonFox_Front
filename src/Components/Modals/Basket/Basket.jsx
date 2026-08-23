import * as Dialog from "@radix-ui/react-dialog";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { isUserLogged, userBasket } from "../../../../redux/users/selectors.js";
import css from "./Basket.module.css";

function Basket() {
  const basket = useSelector(userBasket);
  const isLogged = useSelector(isUserLogged);
  const location = useLocation();

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
                        by {item.product.author}
                      </p>
                      <p className={css.productQuantity}>
                        Quantity: {item.quantity}
                      </p>
                      <p className={css.productMeta}>
                        {item.product.collectionName} collection
                      </p>
                      <p className={css.productPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
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
