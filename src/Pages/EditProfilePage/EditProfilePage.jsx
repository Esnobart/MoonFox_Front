import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  isRefreshing,
  isUserLogged,
  userData,
} from "../../../redux/users/selectors.js";
import { updateProfile } from "../../../redux/users/operations.js";
import AvatarUploadField from "../../Components/AvatarUploadField/AvatarUploadField.jsx";
import ChangePasswordForm from "./ChangePasswordForm.jsx";
import css from "./EditProfilePage.module.css";

function ProfileEditForm({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profilePath = `/profile/${encodeURIComponent(user.username)}`;
  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      username: user.username ?? "",
      avatar: user.avatar ? { url: user.avatar } : null,
    },
  });

  const onSubmit = async ({ username, avatar }) => {
    clearErrors("root.server");

    try {
      const { user: savedUser } = await dispatch(
        updateProfile({
          username: username.trim() !== user.username ? username : undefined,
          avatar: avatar?.file,
        }),
      ).unwrap();

      toast.success("Profile updated.");
      navigate(`/profile/${encodeURIComponent(savedUser.username)}`, { replace: true });
    } catch (err) {
      setError("root.server", {
        type: "server",
        message: err,
      });
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={css.fields} disabled={isSubmitting}>
        <legend className={css.srOnly}>Profile details</legend>
        <div className={css.profileFields}>
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <AvatarUploadField
                value={field.value}
                onChange={field.onChange}
                username={user.username}
                disabled={isSubmitting}
              />
            )}
          />
          <div className={css.details}>
            <div className={css.field}>
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                type="text"
                className={css.input}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username", {
                  setValueAs: (value) => value.trim(),
                  required: "Enter a username.",
                })}
              />
              {errors.username && (
                <p id="username-error" className={css.error} role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className={css.field}>
              <span className={css.fieldLabel}>Email</span>
              <p className={css.email}>{user.email}</p>
              <p className={css.note}>Email changes are not available yet.</p>
            </div>
          </div>
        </div>
      </fieldset>
      <div className={css.formFooter}>
        {errors.root?.server ? (
          <p id="profile-save-note" className={css.error} role="alert">
            {errors.root.server.message}
          </p>
        ) : (
          <p id="profile-save-note" className={css.note} role="status">
            {isSubmitting ? "Saving changes..." : "Changes apply after saving."}
          </p>
        )}
        <div className={css.actions}>
          <button
            type="button"
            className={css.cancelButton}
            disabled={isSubmitting}
            onClick={() => navigate(profilePath, { replace: true })}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={css.saveButton}
            disabled={isSubmitting || !isDirty}
            aria-describedby="profile-save-note"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ProfileEditor({ user, username }) {
  // The parent remounts this guard on account or route changes. Keep ownership
  // stable while a successful rename updates Redux before navigation completes.
  const [isOwner] = useState(
    () => user.username?.trim().toLowerCase() === username?.trim().toLowerCase(),
  );
  if (!isOwner) {
    return <Navigate to={`/profile/${encodeURIComponent(username)}`} replace />;
  }

  return (
    <section className={css.page}>
      <Helmet>
        <title>MoonFox | Edit profile</title>
      </Helmet>
      <Link
        to={`/profile/${encodeURIComponent(user.username)}`}
        replace
        className={css.backLink}
      >
        Back to profile
      </Link>
      <header className={css.header}>
        <p className={css.eyebrow}>Account settings</p>
        <h1 className={css.title}>Edit profile</h1>
      </header>
      <div className={css.forms}>
        <ProfileEditForm key={user._id} user={user} />
        <ChangePasswordForm key={`password-${user._id}`} email={user.email} />
      </div>
    </section>
  );
}

function EditProfilePage() {
  const { username } = useParams();
  const user = useSelector(userData);
  const isLogged = useSelector(isUserLogged);
  const authIsRefreshing = useSelector(isRefreshing);

  if (authIsRefreshing) {
    return <div className={css.state} role="status">Checking access...</div>;
  }

  if (!isLogged) {
    return <Navigate to={`/profile/${encodeURIComponent(username)}`} replace />;
  }

  return <ProfileEditor key={`${user._id}:${username}`} user={user} username={username} />;
}

export default EditProfilePage;
