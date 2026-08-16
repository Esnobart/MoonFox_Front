import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import css from "./Modals.module.css";
import { signUp } from "../../redux/users/operations";

function SignupForm({ onLoginClick }) {
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
      const responce = await dispatch(signUp(data)).unwrap();

      toast.success(responce.message || "Account created successfully!");
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Sign up</Dialog.Title>

      <Dialog.Description className={css.description}>
        Create a new account
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
        <input
          className={css.modalInput}
          type="text"
          placeholder="Username"
          autoComplete="username"
          {...register("username", { required: "Username is required" })}
        />
        {errors.username && (
          <p className={css.errorText}>{errors.username.message}</p>
        )}

        <input
          className={css.modalInput}
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <p id="signup-email-error" className={css.fieldError}>
            {errors.email.message}
          </p>
        )}

        <input
          className={css.modalInput}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <p className={css.errorText}>{errors.password.message}</p>
        )}

        <button type="submit" className={css.modalSubmitButton}>
          Sign up
        </button>
        {errors.root?.server && (
          <p className={css.fieldError}>{errors.root.server.message}</p>
        )}
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
