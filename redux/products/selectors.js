import { createSelector } from "@reduxjs/toolkit";

export const fetchedProducts = state => state.products.products;

export const productsByPopularity = createSelector(
    [fetchedProducts],
    products => [...products].sort((a, b) => (b.popular ?? 0) - (a.popular ?? 0))
);

const groupProductsBy = (products, fieldName) => {
    const groupedProducts = products.reduce((groups, product) => {
        const groupName = product[fieldName] || "Unknown";

        if (!groups[groupName]) {
            groups[groupName] = {
                [fieldName]: groupName,
                products: []
            };
        }

        groups[groupName].products.push(product);

        return groups;
    }, {});

    return Object.values(groupedProducts).sort((a, b) =>
        String(a[fieldName]).localeCompare(String(b[fieldName]))
    );
};

export const fetchedAuthors = createSelector(
    [fetchedProducts],
    products => groupProductsBy(products, "author")
);

export const fetchedCollections = createSelector(
    [fetchedProducts],
    products => groupProductsBy(products, "collectionName")
);

export const fetchedTempProduct = state => state.products.tempProduct;
