import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { requestNewPassword } from "../../redux/users/operations";
import css from "./Modals.module.css";

function ForgotPasswordForm({ onLoginClick }) {
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
      const response = await dispatch(requestNewPassword(data)).unwrap();
      toast.success(response.message || "Reset link sent successfully!");
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Reset password</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter your email to receive reset instructions
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
        <input
          className={css.modalInput}
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid email address",
            },
          })}
        />

        <button type="submit" className={css.modalSubmitButton}>
          Send reset link
        </button>
        {errors.email && (
          <p className={css.fieldError}>{errors.email.message}</p>
        )}
      </form>

      <button type="button" className={css.modalLink} onClick={onLoginClick}>
        Back to sign in
      </button>
      {errors.root?.server && (
        <p className={css.fieldError}>{errors.root.server.message}</p>
      )}
    </>
  );
}

export default ForgotPasswordForm;
