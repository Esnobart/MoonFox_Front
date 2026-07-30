import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";

function ForgotPasswordForm({ onLoginClick }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Dialog.Title className={css.title}>Reset password</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter your email to receive reset instructions
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

        <button type="submit" className={css.modalSubmitButton}>
          Send reset link
        </button>
      </form>

      <button type="button" className={css.modalLink} onClick={onLoginClick}>
        Back to sign in
      </button>
    </>
  );
}

export default ForgotPasswordForm;
