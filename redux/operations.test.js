import assert from "node:assert/strict";
import test from "node:test";
import { configureStore } from "@reduxjs/toolkit";

import api from "./api.js";
import { updateProduct, fetchProducts } from "./products/operations.js";
import { productsReducer } from "./products/slice.js";
import { requestNewPassword, updateProfile } from "./users/operations.js";
import { usersReducer } from "./users/slice.js";

const user = {
  _id: "user-1",
  username: "old-name",
  avatar: null,
  email: "private@example.test",
  role: "Creator",
  wishlist: [{ _id: "product-1", name: "Old product" }],
  basket: [{ product: { _id: "product-1", name: "Old product" }, quantity: 2 }],
};

function createStore() {
  return configureStore({
    reducer: { users: usersReducer, products: productsReducer },
    preloadedState: {
      users: { ...usersReducer(undefined, { type: "init" }), user, isLogged: true },
      products: {
        ...productsReducer(undefined, { type: "init" }),
        products: [{ _id: "product-1", name: "Old product" }],
        tempProduct: { _id: "product-1", name: "Old product" },
        listRequestId: "old-list-request",
      },
    },
  });
}

function captureRequest(t, response = {}) {
  const requests = [];
  const original = api.defaults.adapter;
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return { data: response, status: 200, statusText: "OK", headers: {}, config };
  };
  t.after(() => { api.defaults.adapter = original; });
  return requests;
}

test("profile saves upload a file without email, role or password fields", async (t) => {
  const store = createStore();
  const response = { user: { _id: user._id, username: "new-name", avatar: "/new.png" } };
  const requests = captureRequest(t, response);
  const result = await store.dispatch(updateProfile({
    username: " new-name ",
    avatar: new File(["image"], "avatar.png", { type: "image/png" }),
    email: "ignored@example.test", role: "Admin", password: "never-send",
  })).unwrap();

  assert.deepEqual(result, response);
  assert.equal(requests[0].url, "users/current");
  assert.equal(requests[0].method, "patch");
  assert.equal(requests[0].withCredentials, true);
  assert.deepEqual([...requests[0].data.keys()], ["username", "avatar"]);
  assert.equal(requests[0].data.get("username"), "new-name");
  assert.equal(requests[0].data.get("avatar").name, "avatar.png");
});

test("partial profile edits omit unchanged fields", async (t) => {
  const store = createStore();
  const requests = captureRequest(t, { user });
  await store.dispatch(updateProfile({
    avatar: new File(["image"], "avatar.png", { type: "image/png" }),
  })).unwrap();
  await store.dispatch(updateProfile({ username: "new-name" })).unwrap();

  assert.deepEqual([...requests[0].data.keys()], ["avatar"]);
  assert.deepEqual([...requests[1].data.keys()], ["username"]);
});

test("profile fulfillment preserves private data, wishlist and basket", async (t) => {
  const store = createStore();
  captureRequest(t, { user: {
    _id: user._id, username: "new-name", avatar: "/new.png",
    email: "unexpected@example.test", role: "Admin", password: "never-store",
  } });
  await store.dispatch(updateProfile({ username: "new-name" })).unwrap();

  assert.deepEqual(store.getState().users.user, {
    ...user, username: "new-name", avatar: "/new.png",
  });
  assert.equal(store.getState().users.userLoading, false);
  assert.equal(store.getState().users.isLogged, true);
});

test("a stale profile response cannot overwrite another account", () => {
  const state = createStore().getState().users;
  const result = usersReducer(state, updateProfile.fulfilled({
    user: { _id: "other-user", username: "other-name", avatar: "/other.png" },
  }, "request-id", {}));
  assert.deepEqual(result, state);
});

test("rejected profile saves expose the server message and preserve current data", async (t) => {
  const store = createStore();
  captureRequest(t);
  api.defaults.adapter = async () => {
    const error = new Error("Conflict");
    error.response = { status: 409, data: { message: "Username is already taken." } };
    throw error;
  };

  await assert.rejects(
    store.dispatch(updateProfile({ username: "taken" })).unwrap(),
    (error) => error === "Username is already taken.",
  );
  assert.deepEqual(store.getState().users.user, user);
  assert.equal(store.getState().users.userLoading, false);
});

test("invalid profile responses do not report a successful save", async (t) => {
  const store = createStore();
  captureRequest(t, {});
  const result = await store.dispatch(updateProfile({ username: "new-name" }));
  assert.equal(updateProfile.rejected.match(result), true);
  assert.deepEqual(store.getState().users.user, user);
});

test("password recovery reuses the existing email endpoint", async (t) => {
  const store = createStore();
  const requests = captureRequest(t, { message: "Reset link sent." });
  await store.dispatch(requestNewPassword({ email: user.email })).unwrap();

  assert.equal(requests[0].url, "users/forgot-password");
  assert.equal(requests[0].method, "post");
  assert.deepEqual(JSON.parse(requests[0].data), { email: user.email });
});

test("product saves retain image order and update the catalog, basket and wishlist", async (t) => {
  const store = createStore();
  const product = { _id: "product-1", name: "New product", price: 25 };
  const requests = captureRequest(t, { product });
  await store.dispatch(updateProduct({
    productId: product._id,
    version: 3,
    values: {
      name: " New product ", description: " New description ",
      collectionName: "collection-1", author: user._id,
      price: 25, inStock: 2, popular: 1, ageRestriction: "None",
      images: [
        { url: "/existing.png" },
        { file: new File(["image"], "new.png", { type: "image/png" }) },
      ],
    },
  })).unwrap();

  assert.equal(requests[0].url, "products/product-1");
  assert.equal(requests[0].method, "patch");
  const data = JSON.parse(requests[0].data.get("data"));
  assert.equal(data.version, 3);
  assert.equal(data.name, "New product");
  assert.deepEqual(data.images, [{ url: "/existing.png" }, { fileIndex: 0 }]);
  assert.equal(requests[0].data.get("newImages").name, "new.png");
  assert.deepEqual(store.getState().products.products, [product]);
  assert.deepEqual(store.getState().products.tempProduct, product);
  assert.deepEqual(store.getState().users.user.wishlist, [product]);
  assert.deepEqual(store.getState().users.user.basket, [{ product, quantity: 2 }]);

  store.dispatch(fetchProducts.fulfilled([{ ...product, name: "Stale" }], "old-list-request"));
  assert.deepEqual(store.getState().products.products, [product]);
});
