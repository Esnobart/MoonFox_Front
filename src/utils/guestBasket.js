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
          product,
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

// Keep quantities and edits made while the catalogue requests are in flight.
export const refreshGuestBasketProducts = async (fetchProduct) => {
  const results = await Promise.all(getGuestBasket().map(async ({ product }) => {
    try { return [product._id, await fetchProduct(product._id)]; }
    catch { return [product._id, undefined]; }
  }));
  const products = new Map(results);
  const latest = getGuestBasket();
  const updated = latest
    .filter((item) => products.get(item.product._id) !== null)
    .map((item) => products.get(item.product._id)
      ? { ...item, product: products.get(item.product._id) }
      : item);
  return saveGuestBasket(updated);
};

export const updateGuestBasketProduct = (product) => {
  const basket = getGuestBasket();
  if (!basket.some((item) => item.product._id === product._id)) return;
  try {
    saveGuestBasket(basket.map((item) => item.product._id === product._id ? { ...item, product } : item));
  } catch {
    // A storage restriction must not report an already saved product as a failure.
  }
};
