import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:8080";
const ROLES = ["USER", "MODERATOR", "ADMIN"];

export default function AdminUsers() {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const myEmail = (sessionStorage.getItem("userEmail") || "").toLowerCase();

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  });

  const notify = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/api/admin/users`, {
        headers: headers(),
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      setSavingId(id);

      const response = await fetch(`${API}/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ role }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update role.");
      }

      setUsers((current) =>
          current.map((user) =>
              user.id === id
                  ? {
                    ...user,
                    role: data.role || role,
                  }
                  : user
          )
      );

      notify("Role updated successfully.");
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSavingId(null);
    }
  };

  const askDeleteUser = (id, name) => {
    setConfirmDialog({
      open: true,
      title: "Delete User",
      message: `Delete ${name}? This cannot be undone.`,
      onConfirm: () => deleteUser(id),
    });
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete user.");
      }

      notify("User deleted.");

      setUsers((current) => current.filter((u) => u.id !== id));
    } catch (err) {
      notify(err.message, true);
    } finally {
      setConfirmDialog({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
      });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
        String(user.name || "").toLowerCase().includes(value) ||
        String(user.email || "").toLowerCase().includes(value) ||
        String(user.role || "").toLowerCase().includes(value)
    );
  });

  return (
      <DashboardLayout>
        <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 lg:px-8">
          <Toast message={message} isError={isError} />

          <ConfirmDialog
              open={confirmDialog.open}
              title={confirmDialog.title}
              message={confirmDialog.message}
              confirmText="Delete"
              cancelText="Cancel"
              onCancel={closeConfirmDialog}
              onConfirm={() => {
                if (confirmDialog.onConfirm) {
                  confirmDialog.onConfirm();
                }
              }}
          />

          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Manage Users
                </h1>

                <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                  Manage registered users, roles and account access.
                </p>
              </div>

              <Link
                  to="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[var(--app-card)] px-4 py-2.5 text-sm font-medium text-[var(--app-text)] transition hover:bg-white/5"
              >
                ← Back to Dashboard
              </Link>
            </div>

            <div className="mb-5 rounded-2xl border border-white/10 bg-[var(--app-card)] p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Users</h2>

                  <p className="text-sm text-[var(--app-secondary-text)]">
                    {filteredUsers.length} user
                    {filteredUsers.length === 1 ? "" : "s"} found
                  </p>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-xl border border-white/10 bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-secondary-text)] focus:border-indigo-500 sm:w-72"
                />
              </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-white/10 bg-[var(--app-card)] p-10 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500" />

                  <p className="text-sm text-[var(--app-secondary-text)]">
                    Loading users...
                  </p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[var(--app-card)] p-10 text-center">
                  <h3 className="font-semibold">No users found</h3>

                  <p className="mt-1 text-sm text-[var(--app-secondary-text)]">
                    Try changing your search.
                  </p>
                </div>
            ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[var(--app-card)] shadow-sm md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-[var(--app-secondary-text)]">
                          <th className="px-6 py-4 font-semibold">User</th>
                          <th className="px-6 py-4 font-semibold">Email</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredUsers.map((user) => {
                          const email = String(user.email || "").toLowerCase();
                          const isMe = email === myEmail;

                          return (
                              <tr
                                  key={user.id}
                                  className="border-b border-white/5 last:border-0"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 font-semibold text-indigo-400">
                                      {String(user.name || "U")
                                          .charAt(0)
                                          .toUpperCase()}
                                    </div>

                                    <div>
                                      <p className="font-medium">
                                        {user.name || "Unnamed User"}
                                      </p>

                                      {isMe && (
                                          <span className="mt-1 inline-flex rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
                                      You
                                    </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5 text-sm text-[var(--app-secondary-text)]">
                                  {user.email || "-"}
                                </td>

                                <td className="px-6 py-5">
                                  <select
                                      value={user.role || "USER"}
                                      disabled={savingId === user.id}
                                      onChange={(e) =>
                                          changeRole(user.id, e.target.value)
                                      }
                                      className="rounded-lg border border-white/10 bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none focus:border-indigo-500 disabled:opacity-50"
                                  >
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                          {role}
                                        </option>
                                    ))}
                                  </select>
                                </td>

                                <td className="px-6 py-5">
                              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                Active
                              </span>
                                </td>

                                <td className="px-6 py-5 text-right">
                                  <button
                                      type="button"
                                      disabled={isMe}
                                      onClick={() =>
                                          askDeleteUser(
                                              user.id,
                                              user.name
                                          )
                                      }
                                      className="rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-4 md:hidden">
                    {filteredUsers.map((user) => {
                      const email = String(user.email || "").toLowerCase();
                      const isMe = email === myEmail;

                      return (
                          <div
                              key={user.id}
                              className="rounded-2xl border border-white/10 bg-[var(--app-card)] p-5 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 font-semibold text-indigo-400">
                                  {String(user.name || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {user.name || "Unnamed User"}
                                  </p>

                                  <p className="truncate text-sm text-[var(--app-secondary-text)]">
                                    {user.email || "-"}
                                  </p>
                                </div>
                              </div>

                              {isMe && (
                                  <span className="shrink-0 rounded-full bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400">
                            You
                          </span>
                              )}
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-secondary-text)]">
                                  Role
                                </label>

                                <select
                                    value={user.role || "USER"}
                                    disabled={savingId === user.id}
                                    onChange={(e) =>
                                        changeRole(user.id, e.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[var(--app-bg)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                  {ROLES.map((role) => (
                                      <option key={role} value={role}>
                                        {role}
                                      </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--app-secondary-text)]">
                                  Status
                                </label>

                                <div className="flex h-[42px] items-center">
                            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                              Active
                            </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 flex justify-end border-t border-white/10 pt-4">
                              <button
                                  type="button"
                                  disabled={isMe}
                                  onClick={() =>
                                      askDeleteUser(
                                          user.id,
                                          user.name
                                      )
                                  }
                                  className="rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Delete User
                              </button>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </>
            )}
          </div>

          <style>{`
          select option {
            background: var(--app-card);
            color: var(--app-text);
          }

          @media (max-width: 640px) {
            input,
            select,
            button {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}</style>
        </div>
      </DashboardLayout>
  );
}