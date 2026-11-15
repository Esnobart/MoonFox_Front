import api from "../../../../redux/api.js";
import css from "./Modals.module.css";

const providers = [
  { id: "x", name: "X", icon: "twitter.svg", buttonClass: css.xAuthButton },
  {
    id: "google",
    name: "Google",
    icon: "google.svg",
    buttonClass: css.googleAuthButton,
  },
];

function SocialAuthButtons({ mode = "signin" }) {
  const action = mode === "signup" ? "Sign up" : "Sign in";

  return (
    <>
      <div className={css.socialAuthButtons}>
        {providers.map((provider) => (
          // Submit in the browser so the backend redirect opens the provider.
          <form
            key={provider.id}
            action={api.getUri({ url: `users/auth/${provider.id}` })}
            method="post"
          >
            <button
              type="submit"
              className={`${css.socialAuthButton} ${provider.buttonClass}`}
            >
              <img
                src={`/icons/${provider.icon}`}
                className={css.socialAuthIcon}
                width="20"
                height="20"
                alt=""
              />
              {action} with {provider.name}
            </button>
          </form>
        ))}
      </div>
      <div className={css.authDivider} aria-hidden="true">
        <span>or</span>
      </div>
    </>
  );
}

export default SocialAuthButtons;
