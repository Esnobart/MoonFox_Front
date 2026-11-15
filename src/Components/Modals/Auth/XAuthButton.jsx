import api from "../../../../redux/api.js";
import css from "./Modals.module.css";

function XAuthButton({ children }) {
  return (
    <>
      {/* Submit in the browser so the backend redirect navigates to X. */}
      <form
        className={css.xAuthForm}
        action={api.getUri({ url: "users/auth/x" })}
        method="post"
      >
        <button type="submit" className={css.xAuthButton}>
          <img src="/icons/twitter.svg" className={css.xAuthIcon} alt="" />
          {children}
        </button>
      </form>
      <div className={css.authDivider} aria-hidden="true">
        <span>or</span>
      </div>
    </>
  );
}

export default XAuthButton;
