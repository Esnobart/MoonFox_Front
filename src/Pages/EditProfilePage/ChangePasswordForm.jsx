import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { requestNewPassword } from "../../../redux/users/operations.js";
import css from "./EditProfilePage.module.css";

function ChangePasswordForm({ email }) {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async () => {
    clearErrors("root.server");

    try {
      const response = await dispatch(requestNewPassword({ email })).unwrap();
      toast.success(
        response.message || "Password reset instructions have been sent to your email.",
      );
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={css.fields}>
        <div className={css.sectionHeading}>
          <h2>Change password</h2>
          <p>We’ll email you a link to set a new password.</p>
        </div>
        <p className={css.email}>{email}</p>
      </div>
      <div className={css.formFooter}>
        {errors.root?.server ? (
          <p className={css.error} role="alert">
            {errors.root.server.message}
          </p>
        ) : (
          <p className={css.note}>Follow the link in your email to continue.</p>
        )}
        <button
          type="submit"
          className={css.saveButton}
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
