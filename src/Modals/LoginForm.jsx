import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";
import { useDispatch } from "react-redux";
import { signIn } from "../../redux/users/operations";

function LoginForm({ onSignupClick, onForgotPasswordClick }) {
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      await dispatch(signIn(data)).unwrap();
    } catch (err) {
      console.log(err);
    }
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
