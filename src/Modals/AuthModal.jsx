import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";

import css from "./Modals.module.css";
import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import ForgotPasswordForm from "./ForgotPasswordForm.jsx";
import { logOut } from "../../redux/users/operations";
import { isUserLogged, userData } from "../../redux/users/selectors";

function UserAuthModal() {
  const [mode, setMode] = useState("login");
  const dispatch = useDispatch();
  const isLogged = useSelector(isUserLogged);
  const user = useSelector(userData);

  const handleOpenChange = (open) => {
    if (!open) setMode("login");
  };

  const handleLogout = () => {
    dispatch(logOut());
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
          {isLogged ? (
            <>
              <Dialog.Title className={css.title}>Account</Dialog.Title>
              <Dialog.Description className={css.description}>
                {user?.username || user?.email}
              </Dialog.Description>

              <button
                type="button"
                className={css.modalSubmitButton}
                onClick={handleLogout}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
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
            </>
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
