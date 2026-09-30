import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

/* =========================
   ICONS
========================= */

const EyeIcon = ({ visible }) => {
  if (visible) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c7 0 10 7 10 7a17.4 17.4 0 0 1-3.1 4.2" />
      <path d="M6.1 6.1C3.4 8.2 2 12 2 12s3.5 7 10 7a10.7 10.7 0 0 0 4-.8" />
    </svg>
  );
};

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 15H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const VoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

/* =========================
   MAIN PROFILE COMPONENT
========================= */

const Profile = () => {
  /* =========================
     PROFILE STATE
  ========================= */

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     PASSWORD STATE
  ========================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  /* =========================
     DELETE ACCOUNT STATE
  ========================= */

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* =========================
     TOAST
  ========================= */

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  /* =========================
     AUTH HEADER
  ========================= */

  const headers = () => ({
    Authorization: "Bearer " + sessionStorage.getItem("token"),
    "Content-Type": "application/json",
  });

  /* =========================
     LOAD PROFILE
  ========================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:8080/api/users/profile",
          {
            method: "GET",
            headers: headers(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (error) {
        console.error("Profile loading error:", error);

        showToast("Unable to load your profile.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================
     UPDATE PROFILE
  ========================= */

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile((prev) => ({
        ...prev,
        ...data,
      }));

      sessionStorage.setItem("userName", data.name || name.trim());

      showToast("Profile updated successfully.", "success");
    } catch (error) {
      console.error("Profile update error:", error);

      showToast(
        error.message || "Unable to update your profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        "New password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    if (currentPassword === newPassword) {
      showToast(
        "New password must be different from your current password.",
        "error"
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "http://localhost:8080/api/users/change-password",
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to change password"
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      showToast("Password changed successfully.", "success");
    } catch (error) {
      console.error("Password change error:", error);

      showToast(
        error.message || "Unable to change password.",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  /* =========================
     DELETE ACCOUNT
  ========================= */

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Please enter your password.", "error");
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        "http://localhost:8080/api/users/delete-account",
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            password: deletePassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete account"
        );
      }

      showToast(
        "Account deleted successfully.",
        "success"
      );

      sessionStorage.clear();

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      console.error("Delete account error:", error);

      showToast(
        error.message || "Unable to delete account.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />

            <p className="text-sm text-[var(--app-secondary-text)]">
              Loading profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================
     USER INITIAL
  ========================= */

  const userInitial =
    (name || profile?.name || "U").charAt(0).toUpperCase();

  /* =========================
     STATS
  ========================= */

  const decisionsCreated =
    profile?.decisionsCreated ??
    profile?.decisionCount ??
    profile?.totalDecisions ??
    0;

  const votesCast =
      profile?.votesParticipated ??
      profile?.votesCast ??
      profile?.voteCount ??
      profile?.totalVotes ??
      0;

  const communitiesJoined =
      profile?.joinedCommunities ??
      profile?.communitiesJoined ??
      profile?.communityCount ??
      profile?.totalCommunities ??
      0;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div>
          <p className="mb-1 text-sm font-medium text-violet-500">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
            Profile Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--app-secondary-text)] sm:text-base">
            Manage your personal information, security settings,
            and account preferences.
          </p>
        </div>

        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-sm">
          <div className="h-28 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 sm:h-36" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--app-card)] bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-bold text-white shadow-lg sm:h-28 sm:w-28 sm:text-4xl">
                  {userInitial}
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-[var(--app-text)]">
                    {name || "User"}
                  </h2>

                  <div className="mt-1 flex items-center gap-2 text-sm text-[var(--app-secondary-text)]">
                    <MailIcon />
                    <span>{email || "No email available"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active Account
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Decisions */}
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
                <CheckIcon />
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-secondary-text)]">
                Created
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--app-text)]">
              {decisionsCreated}
            </p>

            <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
              Decisions created
            </p>
          </div>

          {/* Votes */}
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <VoteIcon />
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-secondary-text)]">
                Participation
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--app-text)]">
              {votesCast}
            </p>

            <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
              Votes cast
            </p>
          </div>

          {/* Communities */}
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <UsersIcon />
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-secondary-text)]">
                Community
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[var(--app-text)]">
              {communitiesJoined}
            </p>

            <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
              Communities joined
            </p>
          </div>
        </div>

        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* =========================
              PERSONAL INFORMATION
          ========================= */}

          <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
                <UserIcon />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--app-text)]">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                  Update your basic profile information.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="space-y-5"
            >

              {/* Name */}

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-[var(--app-text)]"
                >
                  Full Name
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-secondary-text)]">
                    <UserIcon />
                  </div>

                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-3 pl-12 pr-4 text-sm text-[var(--app-text)] outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-medium text-[var(--app-text)]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-secondary-text)]">
                    <MailIcon />
                  </div>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-3 pl-12 pr-4 text-sm text-[var(--app-secondary-text)] outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-[var(--app-secondary-text)]">
                  Email address cannot be changed here.
                </p>
              </div>

              {/* Save */}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* =========================
              SECURITY
          ========================= */}

          <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <ShieldIcon />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--app-text)]">
                  Security
                </h2>

                <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                  Keep your account secure by using a strong password.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="space-y-5"
            >

              {/* =========================
                  CURRENT PASSWORD
              ========================= */}

              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-medium text-[var(--app-text)]"
                >
                  Current Password
                </label>

                <div className="relative w-full">
                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="block w-full min-w-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 pr-14 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-secondary-text)] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      setShowCurrentPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-secondary-text)] transition hover:bg-violet-500/10 hover:text-violet-500"
                    aria-label={
                      showCurrentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      visible={showCurrentPassword}
                    />
                  </button>
                </div>
              </div>

              {/* =========================
                  NEW PASSWORD
              ========================= */}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-[var(--app-text)]"
                >
                  New Password
                </label>

                <div className="relative w-full">
                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="block w-full min-w-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 pr-14 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-secondary-text)] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      setShowNewPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-secondary-text)] transition hover:bg-violet-500/10 hover:text-violet-500"
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      visible={showNewPassword}
                    />
                  </button>
                </div>

                <p className="mt-2 text-xs text-[var(--app-secondary-text)]">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* =========================
                  CONFIRM PASSWORD
              ========================= */}

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-[var(--app-text)]"
                >
                  Confirm New Password
                </label>

                <div className="relative w-full">
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="block w-full min-w-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 pr-14 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-secondary-text)] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-secondary-text)] transition hover:bg-violet-500/10 hover:text-violet-500"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      visible={showConfirmPassword}
                    />
                  </button>
                </div>

                {confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-500">
                      Passwords do not match.
                    </p>
                  )}

                {confirmPassword &&
                  newPassword === confirmPassword && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                      <CheckIcon />
                      Passwords match.
                    </p>
                  )}
              </div>

              {/* Change password */}

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full rounded-xl bg-[var(--app-text)] px-5 py-3 text-sm font-semibold text-[var(--app-card)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </section>
        </div>

        {/* =========================
            ACCOUNT SECURITY INFO
        ========================= */}

        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <LockIcon />
              </div>

              <div>
                <h2 className="font-bold text-[var(--app-text)]">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                  Your account is protected with password-based
                  authentication.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
              Secure
            </div>
          </div>
        </section>

        {/* =========================
            DANGER ZONE
        ========================= */}

        <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-500/10 p-3 text-red-500">
                <TrashIcon />
              </div>

              <div>
                <h2 className="font-bold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>

                <p className="mt-1 max-w-xl text-sm text-[var(--app-secondary-text)]">
                  Deleting your account is permanent. Your account
                  data and access will be removed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeletePassword("");
                setShowDeletePassword(false);
                setShowDeleteModal(true);
              }}
              className="shrink-0 rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* =========================
          DELETE MODAL
      ========================= */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <TrashIcon />
            </div>

            <h2 className="text-xl font-bold text-[var(--app-text)]">
              Delete your account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--app-secondary-text)]">
              This action cannot be undone. All account-related
              data may be permanently removed.
            </p>

            <div className="mt-6">
              <label
                htmlFor="delete-password"
                className="mb-2 block text-sm font-medium text-[var(--app-text)]"
              >
                Enter your password
              </label>

              <div className="relative">
                <input
                  id="delete-password"
                  type={
                    showDeletePassword
                      ? "text"
                      : "password"
                  }
                  value={deletePassword}
                  onChange={(e) =>
                    setDeletePassword(e.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 pr-14 text-sm text-[var(--app-text)] outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    setShowDeletePassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-secondary-text)] hover:bg-red-500/10 hover:text-red-500"
                >
                  <EyeIcon
                    visible={showDeletePassword}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-[var(--app-border)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-bg)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          TOAST
      ========================= */}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Profile;