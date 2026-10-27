import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";

import {
  fetchProductById,
  fetchProducts,
} from "../../../redux/products/operations.js";
import {
  fetchedAuthors,
  fetchedCollections,
  fetchedTempProduct,
} from "../../../redux/products/selectors.js";
import { clearTempProduct, productUpdated } from "../../../redux/products/slice.js";
import {
  isRefreshing,
  isUserLogged,
  userData,
} from "../../../redux/users/selectors.js";
import ImageUploadField from "../../Components/ImageUploadField/ImageUploadField.jsx";
import { updateProduct } from "../../api/products.js";
import { updateGuestBasketProduct } from "../../utils/guestBasket.js";
import css from "./EditProductPage.module.css";

const ageRestrictions = ["None", "18+", "21+"];
const maxProductImages = 5;
const relationSelectClasses = {
  control: ({ isFocused }) =>
    `${css.selectControl} ${isFocused ? css.selectFocused : ""}`,
  valueContainer: () => css.selectValueContainer,
  input: () => css.selectInput,
  singleValue: () => css.selectSingleValue,
  placeholder: () => css.selectPlaceholder,
  dropdownIndicator: () => css.selectIndicator,
  menu: () => css.selectMenu,
  menuList: () => css.selectMenuList,
  option: ({ isSelected, isFocused }) =>
    `${css.selectOption} ${isSelected ? css.selectedOption : isFocused ? css.focusedOption : ""}`,
  noOptionsMessage: () => css.selectMessage,
};

const includeCurrentOption = (options, current) =>
  current?._id && !options.some((option) => option._id === current._id)
    ? [current, ...options]
    : options;

const getProductImages = (product) =>
  (product.images ?? []).map((url, index) => ({
    id: "existing-" + index,
    url,
  }));

function ProductEditForm({ product, optionsRejected }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const saveRequest = useRef(null);
  const authors = useSelector(fetchedAuthors);
  const collections = useSelector(fetchedCollections);
  const relationFields = [
    {
      name: "collectionName",
      label: "Collection",
      labelKey: "name",
      options: includeCurrentOption(collections, product.collectionName),
      placeholder: "Search collections...",
      emptyMessage: "No collections found",
      requiredMessage: "Choose a collection.",
    },
    {
      name: "author",
      label: "Author",
      labelKey: "username",
      options: includeCurrentOption(authors, product.author),
      placeholder: "Search authors...",
      emptyMessage: "No authors found",
      requiredMessage: "Choose an author.",
    },
  ];
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: product.name ?? "",
      images: getProductImages(product),
      description: product.description ?? "",
      collectionName: product.collectionName?._id ?? "",
      author: product.author?._id ?? "",
      price: product.price ?? 0,
      inStock: product.inStock ?? 0,
      popular: product.popular ?? 0,
      ageRestriction: product.ageRestriction ?? "None",
    },
  });

  useEffect(() => () => saveRequest.current?.abort(), []);

  const handleSave = async (values) => {
    if (saveRequest.current) return;

    clearErrors("root.server");
    const controller = new AbortController();
    saveRequest.current = controller;

    try {
      const { product: savedProduct } = await updateProduct(product._id, values, {
        signal: controller.signal,
        version: product.__v ?? 0,
      });
      if (controller.signal.aborted) return;

      dispatch(productUpdated(savedProduct));
      updateGuestBasketProduct(savedProduct);
      toast.success("Product updated.");
      navigate(`/products/${product._id}`, { replace: true });
    } catch (error) {
      if (controller.signal.aborted) return;

      const message = error.response?.data?.message;
      setError("root.server", {
        type: "server",
        message:
          typeof message === "string" && message.trim()
            ? message
            : "Could not save this product. Please try again.",
      });
    } finally {
      if (saveRequest.current === controller) saveRequest.current = null;
    }
  };

  return (
    <form
      className={css.form}
      onSubmit={(event) => {
        if (saveRequest.current) {
          event.preventDefault();
          return;
        }

        return handleSubmit(handleSave)(event);
      }}
      aria-busy={isSubmitting}
      noValidate
    >
      <fieldset
        className={css.fields}
        disabled={isSubmitting}
        aria-label="Product details"
      >
        <div className={css.field}>
          <label htmlFor="product-name" className={css.fieldLabel}>Product name</label>
          <input
            id="product-name"
            className={css.input}
            type="text"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "product-name-error" : undefined}
            {...register("name", {
              validate: (value) => Boolean(value.trim()) || "Enter a product name.",
            })}
          />
          {errors.name && (
            <span id="product-name-error" className={css.fieldError} role="alert">
              {errors.name.message}
            </span>
          )}
        </div>

        <Controller
          name="images"
          control={control}
          rules={{
            validate: (images) =>
              images.length <= maxProductImages || "Use up to 5 photos.",
          }}
          render={({ field }) => (
            <ImageUploadField
              images={field.value}
              onChange={field.onChange}
              maxImages={maxProductImages}
              label="Product photos"
            />
          )}
        />
        {errors.images && (
          <p className={css.fieldError} role="alert">{errors.images.message}</p>
        )}

        <label className={css.field}>
          <span>Description</span>
          <textarea
            className={`${css.input} ${css.description}`}
            rows={6}
            {...register("description")}
          />
        </label>

        <div className={css.relationFields}>
          {relationFields.map((relation) => (
            <div key={relation.name} className={css.field}>
              <label
                htmlFor={`product-${relation.name}`}
                className={css.fieldLabel}
              >
                {relation.label}
              </label>
              <Controller
                name={relation.name}
                control={control}
                rules={{ required: relation.requiredMessage }}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId={`product-${relation.name}`}
                    instanceId={`product-${relation.name}`}
                    options={relation.options}
                    getOptionLabel={(option) => option[relation.labelKey]}
                    getOptionValue={(option) => option._id}
                    value={
                      relation.options.find(
                        (option) => option._id === field.value,
                      ) ?? null
                    }
                    onChange={(option) => field.onChange(option?._id ?? "")}
                    placeholder={relation.placeholder}
                    noOptionsMessage={() => relation.emptyMessage}
                    className={css.relationSelect}
                    classNames={relationSelectClasses}
                    components={{ IndicatorSeparator: null }}
                    menuPlacement="auto"
                    maxMenuHeight={220}
                    tabSelectsValue={false}
                    isDisabled={isSubmitting}
                    aria-invalid={Boolean(errors[relation.name])}
                    aria-describedby={
                      errors[relation.name]
                        ? `product-${relation.name}-error`
                        : undefined
                    }
                    isSearchable
                    unstyled
                  />
                )}
              />
              {errors[relation.name] && (
                <p
                  id={`product-${relation.name}-error`}
                  className={css.fieldError}
                  role="alert"
                >
                  {errors[relation.name].message}
                </p>
              )}
            </div>
          ))}
          {optionsRejected && (
            <p className={css.optionsError} role="alert">
              Some collections and authors could not be loaded. Reload the page
              to try again.
            </p>
          )}
        </div>

        <div className={css.numberFields}>
          <div className={css.field}>
            <label htmlFor="product-price" className={css.fieldLabel}>Price (€)</label>
            <input
              id="product-price"
              className={css.input}
              type="number"
              min="0"
              step="0.01"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "product-price-error" : undefined}
              {...register("price", {
                valueAsNumber: true,
                validate: (value) =>
                  (Number.isFinite(value) && value >= 0) ||
                  "Enter a price of 0 or more.",
              })}
            />
            {errors.price && (
              <span id="product-price-error" className={css.fieldError} role="alert">
                {errors.price.message}
              </span>
            )}
          </div>

          <div className={css.field}>
            <label htmlFor="product-stock" className={css.fieldLabel}>In stock</label>
            <input
              id="product-stock"
              className={css.input}
              type="number"
              min="0"
              step="1"
              aria-invalid={Boolean(errors.inStock)}
              aria-describedby={errors.inStock ? "product-stock-error" : undefined}
              {...register("inStock", {
                valueAsNumber: true,
                validate: (value) =>
                  (Number.isSafeInteger(value) && value >= 0) ||
                  "Enter a whole number of 0 or more.",
              })}
            />
            {errors.inStock && (
              <span id="product-stock-error" className={css.fieldError} role="alert">
                {errors.inStock.message}
              </span>
            )}
          </div>

          <div className={css.field}>
            <label htmlFor="product-popular" className={css.fieldLabel}>Popularity</label>
            <input
              id="product-popular"
              className={css.input}
              type="number"
              min="0"
              step="1"
              aria-invalid={Boolean(errors.popular)}
              aria-describedby={errors.popular ? "product-popular-error" : undefined}
              {...register("popular", {
                valueAsNumber: true,
                validate: (value) =>
                  (Number.isSafeInteger(value) && value >= 0) ||
                  "Enter a whole number of 0 or more.",
              })}
            />
            {errors.popular && (
              <span id="product-popular-error" className={css.fieldError} role="alert">
                {errors.popular.message}
              </span>
            )}
          </div>
        </div>

        <fieldset className={css.ageField}>
          <legend>Age restriction</legend>
          <div className={css.ageOptions}>
            {ageRestrictions.map((restriction) => (
              <label key={restriction} className={css.ageOption}>
                <input
                  className={css.radio}
                  type="radio"
                  value={restriction}
                  {...register("ageRestriction", {
                    validate: (value) =>
                      ageRestrictions.includes(value) || "Choose an age restriction.",
                  })}
                />
                <span>{restriction}</span>
              </label>
            ))}
          </div>
          {errors.ageRestriction && (
            <p className={css.fieldError} role="alert">
              {errors.ageRestriction.message}
            </p>
          )}
        </fieldset>
      </fieldset>

      <div className={css.formFooter}>
        {errors.root?.server ? (
          <p id="product-save-note" className={css.serverError} role="alert">
            {errors.root.server.message}
          </p>
        ) : (
          <p id="product-save-note" className={css.note} role="status">
            {isSubmitting ? "Saving changes..." : "Changes apply after saving."}
          </p>
        )}
        <div className={css.actions}>
          <button
            type="button"
            onClick={() => navigate(`/products/${product._id}`, { replace: true })}
            className={css.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={css.saveButton}
            aria-describedby="product-save-note"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

function EditProductPage() {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const user = useSelector(userData);
  const isLogged = useSelector(isUserLogged);
  const authIsRefreshing = useSelector(isRefreshing);
  const product = useSelector(fetchedTempProduct);
  const [loadState, setLoadState] = useState(null);
  const isLoading = loadState?.productId !== productId;
  const isRejected = !isLoading && loadState.productRejected;
  const isAdmin = isLogged && user.role === "Admin";
  const currentProduct = product?._id === productId ? product : null;

  useEffect(() => {
    if (authIsRefreshing || !isAdmin) return;

    let active = true;
    const productRequest = dispatch(fetchProductById(productId));
    const optionsRequest = dispatch(fetchProducts());

    // These requests share Redux loading flags; track both results for this editor.
    Promise.all([productRequest, optionsRequest]).then(
      ([productResult, optionsResult]) => {
        if (!active) return;

        setLoadState({
          productId,
          productRejected: fetchProductById.rejected.match(productResult),
          optionsRejected: fetchProducts.rejected.match(optionsResult),
        });
      },
    );

    return () => {
      active = false;
      productRequest.abort();
      optionsRequest.abort();
      dispatch(clearTempProduct());
    };
  }, [dispatch, productId, authIsRefreshing, isAdmin]);

  if (authIsRefreshing) {
    return (
      <div className={css.state} role="status">
        Checking access...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={`/products/${productId}`} replace />;
  }

  return (
    <section className={css.page}>
      <Helmet>
        <title>
          {currentProduct
            ? `MoonFox | Edit ${currentProduct.name}`
            : "MoonFox | Edit product"}
        </title>
      </Helmet>

      <Link to={`/products/${productId}`} replace className={css.backLink}>
        Back to product
      </Link>

      <header className={css.header}>
        <p className={css.eyebrow}>Admin workspace</p>
        <h1 className={css.title}>Edit product</h1>
        {currentProduct && !isLoading && !isRejected && (
          <p className={css.productName}>{currentProduct.name}</p>
        )}
      </header>

      {(isLoading || (!currentProduct && !isRejected)) && (
        <div className={css.state} role="status">
          Loading editor...
        </div>
      )}

      {isRejected && !isLoading && (
        <div className={css.state} role="alert">
          <h2>This product could not be loaded</h2>
          <p>
            The link may be outdated, or the product is no longer available.
          </p>
        </div>
      )}

      {currentProduct && !isLoading && !isRejected && (
        <ProductEditForm
          key={currentProduct._id}
          product={currentProduct}
          optionsRejected={loadState.optionsRejected}
        />
      )}
    </section>
  );
}

export default EditProductPage;
