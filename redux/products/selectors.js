import { createSelector } from "@reduxjs/toolkit";

export const fetchedProducts = (state) => state.products.products;

export const fetchedTempProduct = (state) => state.products.tempProduct;

export const productsLoading = (state) => state.products.loading;

export const productsRejected = (state) => state.products.rejected;
export const productLoading = (state) => state.products.productLoading;
export const productRejected = (state) => state.products.productRejected;

export const productsByPopularity = createSelector(
  [fetchedProducts],
  (products) =>
    [...products]
      .sort(
        (firstProduct, secondProduct) =>
          (secondProduct.popular || 0) - (firstProduct.popular || 0),
      )
      .slice(0, 10),
);

export const fetchedAuthors = createSelector([fetchedProducts], (products) => {
  const authors = new Map();

  products.forEach((product) => {
    const author = product.author;

    if (!author?._id) return;

    const currentAuthor = authors.get(author._id) || {
      ...author,
      products: [],
    };

    currentAuthor.products.push(product);
    authors.set(author._id, currentAuthor);
  });

  return [...authors.values()].sort((firstAuthor, secondAuthor) =>
    firstAuthor.username.localeCompare(secondAuthor.username),
  );
});

export const fetchedCollections = createSelector(
  [fetchedProducts],
  (products) => {
    const collections = new Map();

    products.forEach((product) => {
      const collection = product.collectionName;

      if (!collection?._id) return;

      const currentCollection = collections.get(collection._id) || {
        ...collection,
        products: [],
      };

      currentCollection.products.push(product);
      collections.set(collection._id, currentCollection);
    });

    return [...collections.values()].sort((firstCollection, secondCollection) =>
      firstCollection.name.localeCompare(secondCollection.name),
    );
  },
);
