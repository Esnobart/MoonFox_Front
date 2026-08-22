import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { resetPassword } from "../../redux/users/operations";
import css from "./Modals.module.css";

function ResetPasswordForm({ resetToken, onSuccess }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    delayError: 1000,
  });

  const onSubmit = async ({ newPassword }) => {
    try {
      const response = await dispatch(
        resetPassword({ resetToken, newPassword }),
      ).unwrap();

      toast.success(response.message || "Password reset successfully.");
      reset();
      onSuccess();
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Set new password</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter a new password for your account
      </Dialog.Description>

      <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
        <input
          className={css.modalInput}
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          {...register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.newPassword && (
          <p className={css.fieldError}>{errors.newPassword.message}</p>
        )}

        <input
          className={css.modalInput}
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value, formValues) =>
              value === formValues.newPassword || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className={css.fieldError}>{errors.confirmPassword.message}</p>
        )}

        <button type="submit" className={css.modalSubmitButton}>
          Save password
        </button>

        {errors.root?.server && (
          <p className={css.fieldError}>{errors.root.server.message}</p>
        )}
      </form>
    </>
  );
}

export default ResetPasswordForm;
