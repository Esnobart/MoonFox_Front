import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import "./App.css";
import Footer from "./Components/Footer/Footer.jsx";
import Header from "./Components/Header/Header.jsx";
import { refreshUser } from "../redux/users/operations";

const CatalogPage = lazy(() => import("./Pages/CatalogPage/CatalogPage.jsx"));
const HomePage = lazy(() => import("./Pages/HomePage/HomePage.jsx"));
const ProductPage = lazy(() => import("./Pages/ProductPage/ProductPage.jsx"));
const EditProductPage = lazy(() =>
  import("./Pages/EditProductPage/EditProductPage.jsx"),
);
const ProfilePage = lazy(() => import("./Pages/ProfilePage/ProfilePage.jsx"));
const AdminSubmissionsPage = lazy(() =>
  import("./Pages/AdminSubmissionsPage/AdminSubmissionsPage.jsx"),
);

function App() {
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken");
  });

  useLayoutEffect(() => {
    // Reset new link destinations, while leaving history and live filters alone.
    if (navigationType === "PUSH") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, search, navigationType]);

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");

    if (verified === "true") {
      toast.success(
        "Your email has been successfully verified. You can now log in.",
      );

      params.delete("verified");
    }

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    window.history.replaceState({}, "", newUrl);
  }, []);

  const handleResetPasswordSuccess = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("resetToken");

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    window.history.replaceState({}, "", newUrl);
    setResetToken(null);
  };

  return (
    <div className="appShell">
      <Header
        resetToken={resetToken}
        onResetPasswordSuccess={handleResetPasswordSuccess}
      />
      <main className="appMain">
        <Suspense fallback={<div className="pageLoader">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route
              path="/products/:productId/edit"
              element={<EditProductPage />}
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route
              path="/admin/submissions"
              element={<AdminSubmissionsPage />}
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
