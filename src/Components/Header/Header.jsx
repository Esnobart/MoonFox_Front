import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import AuthModal from "../Modals/Auth/AuthModal.jsx";
import Basket from "../Modals/Basket/Basket.jsx";
import {
  isRefreshing,
  isUserLogged,
  userData,
} from "../../../redux/users/selectors.js";
import css from "./Header.module.css";

function Header({ resetToken, onResetPasswordSuccess }) {
  const location = useLocation();
  const user = useSelector(userData);
  const isLogged = useSelector(isUserLogged);
  const authIsRefreshing = useSelector(isRefreshing);

  return (
    <header className={css.headerContainer}>
      <Link to="/" className={css.headerLogoContainer}>
        <img src="/icons/logo3.png" alt="Logo" className={css.headerLogo} />
        <h1 className={css.headerTitle}>
          Moon<span className={css.headerText}>Fox</span>
        </h1>
      </Link>

      <div className={css.headerButtons}>
        {authIsRefreshing && !resetToken ? (
          <button
            type="button"
            className={css.accountIconButton}
            aria-label="Checking account"
            disabled
          >
            <img src="/icons/user.svg" width="24" height="24" alt="" />
          </button>
        ) : isLogged && !resetToken ? (
          <Link
            to={`/profile/${encodeURIComponent(user.username)}`}
            state={{ from: location }}
            className={css.accountIconButton}
            aria-label="Open your profile"
          >
            <img src="/icons/user.svg" width="24" height="24" alt="" />
          </Link>
        ) : (
          <AuthModal
            resetToken={resetToken}
            onResetPasswordSuccess={onResetPasswordSuccess}
          />
        )}
        <Basket />
      </div>
    </header>
  );
}

export default Header;
