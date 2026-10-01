import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchProducts } from "../../../redux/products/operations.js";
import {
  fetchedProducts,
  productsLoading,
  productsRejected,
} from "../../../redux/products/selectors.js";
import { fetchUserProfile } from "../../../redux/profile/operations.js";
import {
  profileError,
  profileLoading,
  viewedProfile,
} from "../../../redux/profile/selectors.js";
import { clearProfile } from "../../../redux/profile/slice.js";
import { logOut } from "../../../redux/users/operations.js";
import {
  isRefreshing,
  isUserLogged,
  userData,
} from "../../../redux/users/selectors.js";
import ProductSubmissionModal from "../../Components/Modals/ProductSubmission/ProductSubmissionModal.jsx";
import css from "./ProfilePage.module.css";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;
const normalizeUsername = (username = "") => username.trim().toLowerCase();

function ProductGrid({ products, location, emptyMessage }) {
  if (products.length === 0) {
    return <p className={css.emptyState}>{emptyMessage}</p>;
  }

  return (
    <ul className={css.productsList}>
      {products.map((product) => (
        <li key={product._id} className={css.productCard}>
          <Link
            to={`/products/${product._id}`}
            state={{ from: location }}
            className={css.productLink}
          >
            <img
              src={product.img}
              alt={product.name}
              className={css.productImage}
            />
            <div className={css.productInfo}>
              <div>
                <h3>{product.name}</h3>
                <p>{product.collectionName?.name || "Independent work"}</p>
              </div>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProfilePage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useParams();
  const publicProfile = useSelector(viewedProfile);
  const isPublicProfileLoading = useSelector(profileLoading);
  const publicProfileError = useSelector(profileError);
  const currentUser = useSelector(userData);
  const isLogged = useSelector(isUserLogged);
  const isAuthRefreshing = useSelector(isRefreshing);
  const allProducts = useSelector(fetchedProducts);
  const areProductsLoading = useSelector(productsLoading);
  const productsError = useSelector(productsRejected);
  const isOwnProfile =
    !isAuthRefreshing &&
    isLogged &&
    normalizeUsername(currentUser.username) === normalizeUsername(username);
  const profile = isOwnProfile ? currentUser : publicProfile;
  const isCreator = profile?.role === "Creator";
  const isAdmin = profile?.role === "Admin";

  const products = useMemo(() => {
    if (!profile || !isCreator) {
      return [];
    }

    if (!isOwnProfile) {
      return profile.products || [];
    }

    return allProducts.filter(
      (product) => product.author?._id === currentUser._id,
    );
  }, [allProducts, currentUser._id, isCreator, isOwnProfile, profile]);

  const wishlist = useMemo(
    () =>
      isOwnProfile
        ? (currentUser.wishlist || []).filter(
            (product) => typeof product === "object" && product?._id,
          )
        : [],
    [currentUser.wishlist, isOwnProfile],
  );

  useEffect(() => {
    if (isAuthRefreshing) {
      return;
    }

    if (isOwnProfile) {
      dispatch(clearProfile());

      if (currentUser.role === "Creator") {
        dispatch(fetchProducts());
      }

      return;
    }

    dispatch(fetchUserProfile(username));

    return () => {
      dispatch(clearProfile());
    };
  }, [
    currentUser.role,
    dispatch,
    isAuthRefreshing,
    isOwnProfile,
    username,
  ]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/catalog", { replace: true });
  };

  const handleLogout = async () => {
    try {
      await dispatch(logOut()).unwrap();
      navigate("/");
    } catch (error) {
      toast.error(error || "Could not sign out.");
    }
  };

  if (isAuthRefreshing || (!isOwnProfile && isPublicProfileLoading)) {
    return <div className={css.state}>Loading profile...</div>;
  }

  if (!profile || (!isOwnProfile && publicProfileError)) {
    return (
      <section className={css.state}>
        <h1>Profile not found</h1>
        <p>{publicProfileError || "This profile is not available."}</p>
        <Link to="/catalog" className={css.outlineButton}>
          Browse catalog
        </Link>
      </section>
    );
  }

  const initial = profile.username.charAt(0).toUpperCase();
  const displayRole = isCreator ? "Artist" : profile.role;

  return (
    <section className={css.page}>
      <Helmet>
        <title>{`MoonFox | ${profile.username}`}</title>
      </Helmet>

      <button type="button" className={css.backButton} onClick={handleBack}>
        Back
      </button>

      <header className={css.profileHeader}>
        <div className={css.profileIdentity}>
          <div className={css.avatar}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={`${profile.username} avatar`} />
            ) : (
              <span aria-hidden="true">{initial}</span>
            )}
          </div>

          <div className={css.identity}>
            <p className={css.role}>{displayRole}</p>
            <h1>{profile.username}</h1>
            {isOwnProfile && (
              <p className={css.privateDetail}>{currentUser.email}</p>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <div className={css.profileActions}>
            {isCreator && <ProductSubmissionModal />}
            {isAdmin && (
              <Link
                to="/admin/submissions"
                state={{ from: location }}
                className={css.primaryButton}
              >
                Review submissions
              </Link>
            )}
            <button
              type="button"
              className={css.outlineButton}
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      {isCreator && (
        <section className={css.profileSection}>
          <div className={css.sectionHeader}>
            <div>
              <p className={css.eyebrow}>Published works</p>
              <h2>
                {products.length === 1 ? "1 work" : `${products.length} works`}
              </h2>
            </div>
            <Link to="/catalog" className={css.textLink}>
              Browse catalog
            </Link>
          </div>

          {isOwnProfile && areProductsLoading && products.length === 0 ? (
            <p className={css.emptyState}>Loading published works...</p>
          ) : isOwnProfile && productsError ? (
            <p className={css.emptyState}>Published works could not be loaded.</p>
          ) : (
            <ProductGrid
              products={products}
              location={location}
              emptyMessage="No published works yet."
            />
          )}
        </section>
      )}

      {isOwnProfile && (
        <section className={css.profileSection}>
          <div className={css.sectionHeader}>
            <div>
              <p className={css.eyebrow}>Saved for later</p>
              <h2>Wishlist</h2>
            </div>
          </div>

          <ProductGrid
            products={wishlist}
            location={location}
            emptyMessage="Your wishlist is empty."
          />
        </section>
      )}

      {!isCreator && !isOwnProfile && (
        <p className={css.memberNote}>MoonFox community member.</p>
      )}
    </section>
  );
}

export default ProfilePage;
