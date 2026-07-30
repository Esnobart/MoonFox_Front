import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import css from "./Modals.module.css";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import ForgotPasswordForm from "./ForgotPasswordForm.jsx";

function UserAuthModal() {
  const [mode, setMode] = useState("login");

  const handleOpenChange = (open) => {
    if (!open) setMode("login");
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={css.UserIconButton}
          aria-label="Open account menu"
        >
          <img src="/icons/user.svg" alt="" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={css.DialogOverlay} />

        <Dialog.Content className={css.DialogContent}>
          {mode === "login" && (
            <LoginForm
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

          <Dialog.Close asChild>
            <button
              type="button"
              className={css.close}
              aria-label="Close modal"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default UserAuthModal;
