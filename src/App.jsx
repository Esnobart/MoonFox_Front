import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

import "./App.css";
// import Filters from "./Filters/Filters.jsx";
import Header from "./Header/Header.jsx";
import { refreshUser } from "../redux/users/operations";

const HomePage = lazy(() => import("./Pages/HomePage/HomePage.jsx"));

function App() {
  const dispatch = useDispatch();
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken");
  });

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
    <div>
      <Header
        resetToken={resetToken}
        onResetPasswordSuccess={handleResetPasswordSuccess}
      />
      {/* <Filters /> */}
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>

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
