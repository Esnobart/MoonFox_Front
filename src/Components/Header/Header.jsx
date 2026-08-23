import { Link } from "react-router-dom";

import AuthModal from "../Modals/Auth/AuthModal.jsx";
import Basket from "../Modals/Basket/Basket.jsx";
import css from "./Header.module.css";

function Header({ resetToken, onResetPasswordSuccess }) {
  return (
    <header className={css.headerContainer}>
      <Link to="/" className={css.headerLogoContainer}>
        <img src="/icons/logo3.png" alt="Logo" className={css.headerLogo} />
        <h1 className={css.headerTitle}>
          Moon<span className={css.headerText}>Fox</span>
        </h1>
      </Link>

      <div className={css.headerButtons}>
        <AuthModal
          resetToken={resetToken}
          onResetPasswordSuccess={onResetPasswordSuccess}
        />
        <Basket />
      </div>
    </header>
  );
}

export default Header;
