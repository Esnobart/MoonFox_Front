import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { Link, Navigate, useLocation } from "react-router-dom";

import {
  isRefreshing,
  isUserLogged,
  userData,
} from "../../../redux/users/selectors.js";
import css from "./AdminSubmissionsPage.module.css";

function AdminSubmissionsPage() {
  const location = useLocation();
  const user = useSelector(userData);
  const isLogged = useSelector(isUserLogged);
  const authIsRefreshing = useSelector(isRefreshing);

  if (authIsRefreshing) {
    return <div className={css.state}>Checking access...</div>;
  }

  if (!isLogged || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Product review</title>
      </Helmet>
      <p className={css.eyebrow}>Admin workspace</p>
      <h1>Product verification</h1>
      <Link
        to={`/profile/${encodeURIComponent(user.username)}`}
        state={{ from: location }}
        className={css.backLink}
      >
        Return to profile
      </Link>
    </section>
  );
}

export default AdminSubmissionsPage;
