import AuthModal from "../Modals/AuthModal.jsx";
import css from "./Header.module.css";

function Header({ resetToken, onResetPasswordSuccess }) {
  return (
    <header className={css.headerContainer}>
      <div className={css.headerLogoContainer}>
        <img src="icons/logo3.png" alt="Logo" className={css.headerLogo} />
        <h1 className={css.headerTitle}>
          Moon<a className={css.headerText}>Fox</a>
        </h1>
      </div>

      <div className={css.headerButtons}>
        <AuthModal
          resetToken={resetToken}
          onResetPasswordSuccess={onResetPasswordSuccess}
        />
        <button type="button" className={css.BasketIconButton}>
          <img src="icons/basket.svg" alt="Basket" className={css.basketIcon} />
        </button>
      </div>
    </header>
  );
}

export default Header;
