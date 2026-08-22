import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { requestNewPassword } from "../../redux/users/operations";
import css from "./Modals.module.css";
import { Dialog } from "@radix-ui/react-dialog";

function ForgotPassword() {
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

  const onSubmit = async (data) => {
    try {
      await dispatch(requestNewPassword(data)).unwrap();
      toast.success(
        "Password reset instructions have been sent to your email.",
      );
      reset();
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <>
      <Dialog.Title className={css.title}>Forgot Password</Dialog.Title>

      <Dialog.Description className={css.description}>
        Enter your email to receive password reset instructions.
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
        {errors.email && (
          <p className={css.errorText}>{errors.email.message}</p>
        )}

        <button type="submit" className={css.modalSubmitButton}>
          Send Reset Link
        </button>
      </form>
    </>
  );
}

export default ForgotPassword;
