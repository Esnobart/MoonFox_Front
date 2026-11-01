import { createSelector } from "@reduxjs/toolkit";

// Keep these values aligned with the product type enum in the API.
export const PRODUCT_TYPES = [
  "Polaroids",
  "Stickers",
  "Pins",
  "Keychains",
  "Posters",
  "Other",
];

export const getProductType = (product) => product.type || "Other";

const normalize = (value = "") => value.trim().toLowerCase();
const sortByPopularity = (products) =>
  [...products].sort((first, second) => (second.popular || 0) - (first.popular || 0));

const filterCatalogProducts = (products, filters = {}) => {
  const search = normalize(filters.search);
  const author = normalize(filters.author);
  const collection = normalize(filters.collection);
  const productType = normalize(filters.productType);

  return sortByPopularity(
    products.filter((product) => {
      const authorName = product.author?.username || "Unknown artist";
      const collectionName = product.collectionName?.name || "Independent work";
      const type = getProductType(product);
      const searchableText = normalize(
        [product.name, authorName, collectionName, type].join(" "),
      );

      return (
        (!search || searchableText.includes(search)) &&
        (!author || normalize(authorName) === author) &&
        (!collection || normalize(collectionName) === collection) &&
        (!productType || normalize(type) === productType)
      );
    }),
  );
};

const rankCatalogGroups = (groups) =>
  groups
    .map((group) => ({
      ...group,
      products: sortByPopularity(group.products),
      popularity: group.products.reduce(
        (total, product) => total + (Number(product.popular) || 0),
        0,
      ),
    }))
    .sort((first, second) =>
      second.popularity - first.popularity ||
      (first.username || first.name).localeCompare(second.username || second.name),
    );

export const fetchedProducts = (state) => state.products.products;

export const fetchedTempProduct = (state) => state.products.tempProduct;

export const productsLoading = (state) => state.products.loading;

export const productsRejected = (state) => state.products.rejected;
export const productLoading = (state) => state.products.productLoading;
export const productRejected = (state) => state.products.productRejected;

export const productsByPopularity = createSelector(
  [fetchedProducts],
  (products) => sortByPopularity(products).slice(0, 10),
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

export const catalogAuthors = createSelector([fetchedAuthors], rankCatalogGroups);

export const catalogProductTypes = createSelector([fetchedProducts], (products) => {
  const types = [...new Set([...PRODUCT_TYPES, ...products.map(getProductType)])];
  return rankCatalogGroups(
    types.map((name) => ({
      name,
      products: products.filter((product) => getProductType(product) === name),
    })),
  );
});

const catalogFilters = (_state, filters) => filters;
const catalogPageType = (_state, _filters, pageType) => pageType;

export const catalogProducts = createSelector(
  [fetchedProducts, catalogFilters],
  filterCatalogProducts,
);

export const catalogProductGroups = createSelector(
  [fetchedAuthors, fetchedCollections, catalogFilters, catalogPageType],
  (authors, collections, filters, pageType) => {
    if (pageType !== "authors" && pageType !== "collections") return [];

    const groups = pageType === "authors" ? authors : collections;
    return rankCatalogGroups(
      groups
        .map((group) => ({
          ...group,
          products: filterCatalogProducts(group.products, filters),
        }))
        .filter((group) => group.products.length > 0),
    );
  },
);
