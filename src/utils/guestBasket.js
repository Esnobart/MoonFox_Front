const GUEST_BASKET_KEY = "moonfox_guest_basket";

export const GUEST_BASKET_EVENT = "moonfox:guest-basket-change";

export const getGuestBasket = () => {
  try {
    const basket = JSON.parse(localStorage.getItem(GUEST_BASKET_KEY));
    return Array.isArray(basket) ? basket : [];
  } catch {
    return [];
  }
};

export const saveGuestBasket = (basket) => {
  localStorage.setItem(GUEST_BASKET_KEY, JSON.stringify(basket));
  window.dispatchEvent(
    new CustomEvent(GUEST_BASKET_EVENT, { detail: basket }),
  );
  return basket;
};

export const addGuestBasketProduct = (product, quantity) => {
  const basket = getGuestBasket();
  const productIndex = basket.findIndex(
    (item) => item.product._id === product._id,
  );
  const maxQuantity = Number(product.inStock) || quantity;

  if (productIndex === -1) {
    return saveGuestBasket([
      ...basket,
      { product, quantity: Math.min(quantity, maxQuantity) },
    ]);
  }

  const nextBasket = basket.map((item, index) =>
    index === productIndex
      ? {
          ...item,
          quantity: Math.min(item.quantity + quantity, maxQuantity),
        }
      : item,
  );

  return saveGuestBasket(nextBasket);
};

export const updateGuestBasketQuantity = (productId, quantity) =>
  saveGuestBasket(
    getGuestBasket().map((item) =>
      item.product._id === productId ? { ...item, quantity } : item,
    ),
  );

export const removeGuestBasketProduct = (productId) =>
  saveGuestBasket(
    getGuestBasket().filter((item) => item.product._id !== productId),
  );
