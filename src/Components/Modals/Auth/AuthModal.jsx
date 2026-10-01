import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import ForgotPasswordForm from "./ForgotPasswordForm.jsx";
import ResetPasswordForm from "./ResetPasswordForm.jsx";

function UserAuthModal({ resetToken, onResetPasswordSuccess }) {
  const [mode, setMode] = useState(resetToken ? "resetPassword" : "login");
  const [open, setOpen] = useState(Boolean(resetToken));

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) setMode("login");
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={css.UserIconButton}
          aria-label="Open account menu"
        >
          <img
            src="/icons/user.svg"
            width="24"
            height="24"
            alt=""
            aria-hidden="true"
          />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={css.DialogOverlay} />

        <Dialog.Content className={css.DialogContent}>
          {mode === "login" && (
            <LoginForm
              onLoginSuccess={() => setOpen(false)}
              onSignupClick={() => setMode("signup")}
              onForgotPasswordClick={() => setMode("forgotPassword")}
            />
          )}

          {mode === "signup" && (
            <SignupForm onLoginClick={() => setMode("login")} />
          )}

          {mode === "forgotPassword" && (
            <ForgotPasswordForm onLoginClick={() => setMode("login")} />
          )}

          {mode === "resetPassword" && (
            <ResetPasswordForm
              resetToken={resetToken}
              onSuccess={() => {
                onResetPasswordSuccess();
                setMode("login");
                setOpen(false);
              }}
            />
          )}

          <Dialog.Close asChild>
            <button
              type="button"
              className={css.close}
              aria-label="Close modal"
            >
              x
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default UserAuthModal;
