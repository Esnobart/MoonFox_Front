import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

import css from "./Modals.module.css";
import { signIn } from "../../redux/users/operations";

function LoginForm({ onSignupClick, onForgotPasswordClick }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    delayError: 1000,
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(signIn(data)).unwrap();
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Sign in</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter your account details
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
        <input
          className={css.modalInput}
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
          placeholder="Email"
          autoComplete="email"
        />
        {errors.email && (
          <p className={css.fieldError}>{errors.email.message}</p>
        )}

        <input
          className={css.modalInput}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className={css.errorText}>{errors.password.message}</p>
        )}

        <button type="submit" className={css.modalSubmitButton}>
          Sign in
        </button>
        {errors.root?.server && (
          <p className={css.fieldError}>{errors.root.server.message}</p>
        )}
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
