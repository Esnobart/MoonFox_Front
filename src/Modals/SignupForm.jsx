import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";
import { useDispatch } from "react-redux";
import { signUp } from "../../redux/users/operations";

function SignupForm({ onLoginClick }) {
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      await dispatch(signUp(data)).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Sign up</Dialog.Title>

      <Dialog.Description className={css.description}>
        Create a new account
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit}>
        <input
          className={css.modalInput}
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="username"
          required
        />

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
          autoComplete="new-password"
          required
        />

        <button type="submit" className={css.modalSubmitButton}>
          Sign up
        </button>
      </form>

      <p className={css.modalText}>
        Have an account?{" "}
        <button type="button" className={css.modalLink} onClick={onLoginClick}>
          Sign in
        </button>
      </p>
    </>
  );
}

export default SignupForm;
