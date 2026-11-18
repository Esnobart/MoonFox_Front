export const userData = state => state.users.user;

export const getUserImage = (images, index = 0) => {
  if (Array.isArray(images)) return images[index] || null;
  return index === 0 && typeof images === "string" ? images || null : null;
};

export const userBasket = state => state.users.user.basket || [];

export const userWishlist = state => state.users.user.wishlist || [];

export const isUserLogged = state => state.users.isLogged;

export const isRefreshing = state => state.users.isRefreshing;

export const userLoading = state => state.users.userLoading;
