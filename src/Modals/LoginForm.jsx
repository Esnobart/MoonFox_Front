import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";

function LoginForm({ onSignupClick, onForgotPasswordClick }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    // Здесь позже будет запрос на backend.
  };

  return (
    <>
      <Dialog.Title className={css.title}>Sign in</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter your account details
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit}>
        <input
          className={css.modalInput}
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
        />

        <input
          className={css.modalInput}
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        <button type="submit" className={css.modalSubmitButton}>
          Sign in
        </button>
      </form>

      <div className={css.modalLinks}>
        <button
          type="button"
          className={css.modalLink}
          onClick={onForgotPasswordClick}
        >
          Forgot your password?
        </button>

        <span aria-hidden="true">|</span>

        <button type="button" className={css.modalLink} onClick={onSignupClick}>
          Create an account
        </button>
      </div>
    </>
  );
}

export default LoginForm;
