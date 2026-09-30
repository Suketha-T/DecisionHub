import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:8080";

function AdminCommunities() {
  const { theme } = useTheme();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 3500);

    return () => clearTimeout(timer);
  }, [message]);

  const loadCommunities = async () => {
    try {
      const response = await fetch(`${API}/api/admin/communities`, {
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to load communities.");
      }

      const data = await response.json();

      setCommunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notify("Unable to load communities.", true);
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunity = async (id, name) => {
    try {
      const response = await fetch(
          `${API}/api/admin/communities/${id}`,
          {
            method: "DELETE",
            headers: headers(),
          }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
            data.message || "Unable to delete community."
        );
      }

      notify("Community deleted.");

      setCommunities((current) =>
          current.filter((c) => c.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const askDeleteCommunity = (id, name) => {
    setConfirmDialog({
      open: true,
      title: "Delete Community",
      message: `Delete "${name}"? This will also remove its decisions and polls.`,
      onConfirm: () => deleteCommunity(id, name),
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const toggleCommunity = (id) => {
    setExpandedId((current) =>
        current === id ? null : id
    );
  };

  const filteredCommunities = communities.filter((c) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
        c.communityName?.toLowerCase().includes(term) ||
        c.ownerName?.toLowerCase().includes(term)
    );
  });

  /* =====================================================
     MEMBERS CONTENT
  ===================================================== */

  const MembersList = ({ community }) => {
    if (community.memberNames?.length) {
      return (
          <div className="admin-members-content">
            <div className="admin-members-title">
              Community members
            </div>
            <div className="admin-members-list">
              {community.memberNames.map((name, index) => (
                  <span
                      className="admin-member-chip"
                      key={`${name}-${index}`}
                  >
              {name}
            </span>
              ))}
            </div>
          </div>
      );
    }

    return (
        <div className="admin-empty">
          No members yet.
        </div>
    );
  };

  return (
      <DashboardLayout
          pageTitle="Manage Communities"
          pageSubtitle="View members, moderate, and remove communities."
      >
        <Toast message={message} isError={isError} />
        <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="Delete"
            cancelText="Cancel"
            onCancel={closeConfirmDialog}
            onConfirm={() => {
              const action = confirmDialog.onConfirm;
              closeConfirmDialog();
              if (action) action();
            }}
        />

        <style>{`
        .admin-communities-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 8px 0 40px;
        }

        .admin-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #b8a7ff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 18px;
          padding: 9px 13px;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.07);
          transition: all 0.22s ease;
        }

        .admin-back-link:hover {
          color: #fff;
          background: rgba(139, 92, 246, 0.16);
          border-color: rgba(167, 139, 250, 0.45);
          transform: translateX(-2px);
        }

        .admin-community-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          padding: 28px 30px;
          border: 1px solid rgba(139, 92, 246, 0.24);
          border-radius: 24px;
          background:
            radial-gradient(circle at 85% 15%, rgba(168, 85, 247, 0.22), transparent 30%),
            radial-gradient(circle at 12% 100%, rgba(59, 130, 246, 0.12), transparent 32%),
            linear-gradient(135deg, rgba(27, 22, 46, 0.98), rgba(16, 14, 30, 0.98));
          box-shadow:
            0 20px 55px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .admin-community-hero::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -55px;
          top: -70px;
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.16);
          box-shadow:
            0 0 0 22px rgba(167, 139, 250, 0.025),
            0 0 0 44px rgba(167, 139, 250, 0.018);
        }

        .admin-community-hero-content {
          position: relative;
          z-index: 1;
        }

        .admin-community-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #a78bfa;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .admin-community-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 14px rgba(167, 139, 250, 0.8);
        }

        .admin-community-page-title {
          margin: 0;
          color: #fff;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.08;
          letter-spacing: -0.035em;
          font-weight: 600;
        }

        .admin-community-page-description {
          max-width: 650px;
          margin: 10px 0 0;
          color: #a9a2bd;
          font-size: 13px;
          line-height: 1.7;
        }

        .admin-community-stat-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .admin-community-stat-card {
          padding: 15px 17px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(12px);
        }

        .admin-community-stat-label {
          display: block;
          margin-bottom: 6px;
          color: #817b94;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-community-stat-value {
          color: #f8f7ff;
          font-size: 22px;
          line-height: 1;
          font-weight: 600;
        }

        .admin-community-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-search-wrapper {
          position: relative;
          flex: 1;
          margin: 0;
        }

        .admin-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #777087;
          font-size: 16px;
          pointer-events: none;
        }

        .admin-search {
          display: block;
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          padding: 13px 15px 13px 43px;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 14px;
          background: rgba(23, 20, 37, 0.88);
          color: var(--app-text);
          font-size: 13px;
          outline: none;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
          transition: all 0.22s ease;
        }

        .admin-search::placeholder {
          color: #706a7e;
        }

        .admin-search:hover {
          border-color: rgba(139, 92, 246, 0.32);
        }

        .admin-search:focus {
          border-color: #8b5cf6;
          background: rgba(27, 23, 45, 0.98);
          box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.1),
            0 12px 35px rgba(0, 0, 0, 0.18);
        }

        .admin-results-count {
          flex-shrink: 0;
          color: #837c91;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-results-count strong {
          color: #c4b5fd;
        }

        .admin-table-wrapper {
          width: 100%;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 20px;
          background: rgba(20, 17, 32, 0.86);
          box-shadow:
            0 18px 50px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .admin-communities-table {
          width: 100%;
          min-width: 760px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-communities-table th,
        .admin-communities-table td {
          text-align: left;
          padding: 17px 18px;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          color: var(--app-text);
        }

        .admin-communities-table th {
          color: #777083;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.018);
          white-space: nowrap;
        }

        .admin-communities-table th:first-child,
        .admin-communities-table td:first-child {
          padding-left: 22px;
        }

        .admin-communities-table td:first-child {
          font-weight: 600;
        }

        .admin-communities-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-community-row {
          cursor: pointer;
          transition: background 0.22s ease;
        }

        .admin-community-row:hover {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.08),
            rgba(139, 92, 246, 0.025)
          );
        }

        .admin-community-row td:first-child {
          position: relative;
        }

        .admin-community-row td:first-child::before {
          content: "";
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: #8b5cf6;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .admin-community-row:hover td:first-child::before {
          opacity: 1;
        }

        .admin-community-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-community-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(167, 139, 250, 0.18);
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.20),
            rgba(59, 130, 246, 0.08)
          );
          color: #c4b5fd;
          font-size: 13px;
          font-weight: 650;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .admin-community-name-text {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-owner-cell {
          color: #c7c0d1;
          font-weight: 650;
        }

        .admin-member-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          padding: 7px 10px;
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.10),
            rgba(59, 130, 246, 0.06)
          );
          color: #c4b5fd;
          font-size: 11px;
          font-weight: 600;
        }

        .admin-delete-btn {
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .admin-delete-btn:hover {
          border-color: rgba(248, 113, 113, 0.38);
          background: rgba(239, 68, 68, 0.16);
          color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: 0 7px 20px rgba(239, 68, 68, 0.1);
        }

        .admin-delete-btn:active {
          transform: scale(0.97);
        }

        .admin-empty {
          padding: 38px 20px;
          border: 1px dashed rgba(139, 92, 246, 0.18);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.018);
          color: var(--app-secondary-text);
          font-size: 13px;
          text-align: center;
        }

        .admin-members-panel {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.07), transparent 30%),
            linear-gradient(180deg, rgba(139, 92, 246, 0.045), rgba(12, 10, 22, 0.12));
        }

        .admin-members-panel td {
          padding: 0 24px 24px !important;
        }

        .admin-members-content {
          padding-top: 8px;
          animation: adminMembersIn 0.22s ease;
        }

        @keyframes adminMembersIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-members-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 8px 0 11px;
          color: #928aa3;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .admin-members-title::before {
          content: "";
          width: 4px;
          height: 13px;
          border-radius: 4px;
          background: #8b5cf6;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.45);
        }

        .admin-members-list {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .admin-member-chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 100%;
          box-sizing: border-box;
          padding: 9px 13px 9px 11px;
          border: 1px solid rgba(139, 92, 246, 0.14);
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              rgba(139, 92, 246, 0.085),
              rgba(255, 255, 255, 0.025)
            );
          color: #e4dfed;
          font-size: 12px;
          font-weight: 700;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
          overflow-wrap: anywhere;
          word-break: break-word;
          transition: all 0.2s ease;
        }

        .admin-member-chip::before {
          content: "";
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 9px rgba(139, 92, 246, 0.55);
        }

        .admin-member-chip:hover {
          transform: translateY(-1px);
          border-color: rgba(139, 92, 246, 0.28);
          background: rgba(139, 92, 246, 0.10);
        }

        .admin-mobile-communities {
          display: none;
        }

        .admin-community-card {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(139, 92, 246, 0.14);
          border-radius: 18px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.08), transparent 35%),
            rgba(20, 17, 32, 0.9);
          margin-bottom: 12px;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.14);
        }

        .admin-community-card-main {
          padding: 18px;
          cursor: pointer;
        }

        .admin-community-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-community-card-name {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-community-card-name-text {
          min-width: 0;
          color: var(--app-text);
          font-size: 16px;
          line-height: 1.4;
          font-weight: 600;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-expand-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.09);
          color: #b8a7ff;
          font-size: 16px;
          font-weight: 600;
        }

        .admin-community-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .admin-info-item {
          min-width: 0;
          padding: 11px 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.025);
        }

        .admin-info-label {
          display: block;
          margin-bottom: 5px;
          font-size: 9px;
          font-weight: 600;
          color: #777083;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .admin-info-value {
          display: block;
          color: var(--app-text);
          font-size: 12px;
          font-weight: 650;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-mobile-delete {
          width: 100%;
          min-height: 42px;
          margin-top: 14px;
        }

        .admin-mobile-members {
          padding: 0 18px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 8, 18, 0.18);
        }

        .admin-mobile-members-title {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-top: 14px;
          margin-bottom: 11px;
          color: #928aa3;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .admin-mobile-members-title::before {
          content: "";
          width: 4px;
          height: 12px;
          border-radius: 4px;
          background: #8b5cf6;
        }

        @media (max-width: 768px) {
          .admin-communities-page {
            max-width: 100%;
          }

          .admin-community-hero {
            padding: 23px 21px;
            border-radius: 20px;
          }

          .admin-community-stat-grid {
            gap: 9px;
          }

          .admin-community-stat-card {
            padding: 13px;
          }

          .admin-community-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 9px;
          }

          .admin-results-count {
            padding-left: 3px;
          }
        }

        @media (max-width: 600px) {
          .admin-communities-page {
            padding-bottom: 25px;
          }

          .admin-community-hero {
            padding: 21px 18px;
            margin-bottom: 15px;
          }

          .admin-community-page-title {
            font-size: 27px;
          }

          .admin-community-page-description {
            font-size: 12px;
          }

          .admin-community-stat-grid {
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 17px;
          }

          .admin-community-stat-card {
            padding: 11px 9px;
            border-radius: 12px;
          }

          .admin-community-stat-label {
            font-size: 8px;
          }

          .admin-community-stat-value {
            font-size: 18px;
          }

          .admin-search {
            padding: 12px 13px 12px 40px;
          }

          .admin-table-wrapper {
            display: none;
          }

          .admin-mobile-communities {
            display: block;
          }

          .admin-community-info {
            grid-template-columns: 1fr 1fr;
          }

          .admin-member-chip {
            font-size: 11px;
            padding: 8px 11px;
          }
        }

        @media (max-width: 380px) {
          .admin-community-stat-grid {
            grid-template-columns: 1fr;
          }

          .admin-community-stat-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .admin-community-stat-label {
            margin-bottom: 0;
          }

          .admin-community-card-main {
            padding: 15px;
          }

          .admin-mobile-members {
            padding-left: 15px;
            padding-right: 15px;
          }

          .admin-community-info {
            grid-template-columns: 1fr;
          }
        }

        /* =====================================================
           LIGHT THEME — MATCH ADMIN USERS / ADMIN DECISIONS
           All inner surfaces become clean white while keeping
           the purple futuristic accents.
        ===================================================== */

        .admin-communities-page.theme-light {
          color: #2b2440;
        }

        .admin-communities-page.theme-light .admin-community-hero {
          background:
            radial-gradient(circle at 85% 15%, rgba(168, 85, 247, 0.10), transparent 30%),
            radial-gradient(circle at 12% 100%, rgba(99, 102, 241, 0.06), transparent 32%),
            linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%);
          border-color: rgba(139, 92, 246, 0.14);
          box-shadow:
            0 20px 55px rgba(31, 24, 54, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .admin-communities-page.theme-light .admin-community-hero::before {
          border-color: rgba(139, 92, 246, 0.12);
          box-shadow:
            0 0 0 22px rgba(139, 92, 246, 0.025),
            0 0 0 44px rgba(139, 92, 246, 0.015);
        }

        .admin-communities-page.theme-light .admin-community-eyebrow {
          color: #7c3aed;
        }

        .admin-communities-page.theme-light .admin-community-eyebrow-dot {
          background: #8b5cf6;
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.45);
        }

        .admin-communities-page.theme-light .admin-community-page-title {
          color: #241c35;
        }

        .admin-communities-page.theme-light .admin-community-page-description {
          color: #6b6478;
        }

        .admin-communities-page.theme-light .admin-community-stat-card {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.12);
          box-shadow: 0 8px 24px rgba(31, 24, 54, 0.07);
          backdrop-filter: none;
        }

        .admin-communities-page.theme-light .admin-community-stat-label {
          color: #756d82;
        }

        .admin-communities-page.theme-light .admin-community-stat-value {
          color: #2b2440;
        }

        .admin-communities-page.theme-light .admin-back-link {
          color: #7c3aed;
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.18);
          box-shadow: 0 6px 18px rgba(31, 24, 54, 0.05);
        }

        .admin-communities-page.theme-light .admin-back-link:hover {
          color: #6d28d9;
          background: #faf8ff;
          border-color: rgba(139, 92, 246, 0.35);
        }

        .admin-communities-page.theme-light .admin-search {
          background: #ffffff;
          color: #2b2440;
          border-color: rgba(139, 92, 246, 0.16);
          box-shadow: 0 8px 28px rgba(31, 24, 54, 0.06);
        }

        .admin-communities-page.theme-light .admin-search::placeholder {
          color: #8b8297;
        }

        .admin-communities-page.theme-light .admin-search:focus {
          background: #ffffff;
          border-color: #8b5cf6;
          box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.09),
            0 12px 30px rgba(31, 24, 54, 0.08);
        }

        .admin-communities-page.theme-light .admin-search-icon {
          color: #7c6b99;
        }

        .admin-communities-page.theme-light .admin-results-count {
          color: #756d82;
        }

        .admin-communities-page.theme-light .admin-results-count strong {
          color: #7c3aed;
        }

        .admin-communities-page.theme-light .admin-table-wrapper {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.13);
          box-shadow: 0 18px 50px rgba(31, 24, 54, 0.08);
        }

        .admin-communities-page.theme-light .admin-communities-table th,
        .admin-communities-page.theme-light .admin-communities-table td {
          color: #3a324c;
          border-bottom-color: rgba(91, 72, 125, 0.10);
        }

        .admin-communities-page.theme-light .admin-communities-table th {
          color: #70677d;
          background: #faf9fc;
        }

        .admin-communities-page.theme-light .admin-community-row:hover {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.07),
            rgba(139, 92, 246, 0.025)
          );
        }

        .admin-communities-page.theme-light .admin-community-avatar {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.10),
            rgba(99, 102, 241, 0.06)
          );
          border-color: rgba(139, 92, 246, 0.16);
          color: #6d45b8;
          box-shadow: none;
        }

        .admin-communities-page.theme-light .admin-community-name-text {
          color: #3a324c;
        }

        .admin-communities-page.theme-light .admin-owner-cell {
          color: #625970;
        }

        .admin-communities-page.theme-light .admin-member-count {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.08),
            rgba(99, 102, 241, 0.05)
          );
          border-color: rgba(139, 92, 246, 0.14);
          color: #6d5595;
        }

        .admin-communities-page.theme-light .admin-empty {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.20);
          color: #756d82;
          box-shadow: 0 8px 25px rgba(31, 24, 54, 0.05);
        }

        .admin-communities-page.theme-light .admin-members-panel {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.045), transparent 30%),
            #ffffff;
        }

        .admin-communities-page.theme-light .admin-members-title {
          color: #756d82;
        }

        .admin-communities-page.theme-light .admin-member-chip {
          background:
            linear-gradient(
              135deg,
              rgba(139, 92, 246, 0.055),
              #ffffff
            );
          border-color: rgba(139, 92, 246, 0.13);
          color: #4b405d;
          box-shadow: 0 4px 14px rgba(31, 24, 54, 0.04);
        }

        .admin-communities-page.theme-light .admin-member-chip:hover {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.25);
        }

        .admin-communities-page.theme-light .admin-community-card {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.055), transparent 35%),
            #ffffff;
          border-color: rgba(139, 92, 246, 0.14);
          box-shadow: 0 12px 35px rgba(31, 24, 54, 0.07);
        }

        .admin-communities-page.theme-light .admin-community-card-name-text {
          color: #2f2740;
        }

        .admin-communities-page.theme-light .admin-expand-icon {
          background: rgba(139, 92, 246, 0.07);
          border-color: rgba(139, 92, 246, 0.18);
          color: #7047b8;
        }

        .admin-communities-page.theme-light .admin-info-item {
          background: #faf9fc;
          border-color: rgba(91, 72, 125, 0.09);
        }

        .admin-communities-page.theme-light .admin-info-label {
          color: #776e80;
        }

        .admin-communities-page.theme-light .admin-info-value {
          color: #3a324c;
        }

        .admin-communities-page.theme-light .admin-mobile-members {
          background: #ffffff;
          border-top-color: rgba(91, 72, 125, 0.10);
        }

        .admin-communities-page.theme-light .admin-mobile-members-title {
          color: #756d82;
        }

        /* Delete buttons stay intentionally red in both themes. */

      `}</style>

        <div className={`admin-communities-page ${theme === "light" ? "theme-light" : ""}`}>

          <div className="admin-community-hero">
            <div className="admin-community-hero-content">
              <div className="admin-community-eyebrow">
                <span className="admin-community-eyebrow-dot" />
                Community control center
              </div>

              <h1 className="admin-community-page-title">
                Manage Communities
              </h1>

              <p className="admin-community-page-description">
                Review community ownership, member activity, and keep your
                platform organized with a cleaner moderation workspace.
              </p>

              <div className="admin-community-stat-grid">
                <div className="admin-community-stat-card">
                <span className="admin-community-stat-label">
                  Total communities
                </span>
                  <span className="admin-community-stat-value">
                  {communities.length}
                </span>
                </div>

                <div className="admin-community-stat-card">
                <span className="admin-community-stat-label">
                  Total members
                </span>
                  <span className="admin-community-stat-value">
                  {communities.reduce(
                      (sum, community) =>
                          sum + (Number(community.memberCount) || 0),
                      0
                  )}
                </span>
                </div>

                <div className="admin-community-stat-card">
                <span className="admin-community-stat-label">
                  Showing
                </span>
                  <span className="admin-community-stat-value">
                  {filteredCommunities.length}
                </span>
                </div>
              </div>
            </div>
          </div>
          {/* BACK */}
          <Link
              className="admin-back-link"
              to="/admin"
          >
            ← Back to Admin Dashboard
          </Link>

          {/* SEARCH / FILTER TOOLBAR */}
          <div className="admin-community-toolbar">
            <div className="admin-search-wrapper">
              <span className="admin-search-icon">⌕</span>
              <input
                  className="admin-search"
                  value={search}
                  onChange={(event) =>
                      setSearch(event.target.value)
                  }
                  placeholder="Search by community name or owner..."
                  aria-label="Search communities"
              />
            </div>

            <div className="admin-results-count">
              <strong>{filteredCommunities.length}</strong>{" "}
              {filteredCommunities.length === 1 ? "community" : "communities"}
            </div>
          </div>

          {/* LOADING */}
          {loading && (
              <div className="admin-empty">
                Loading communities…
              </div>
          )}

          {/* NO RESULTS */}
          {!loading &&
              filteredCommunities.length === 0 && (
                  <div className="admin-empty">
                    No communities found.
                  </div>
              )}

          {/* =====================================================
            DESKTOP / TABLET TABLE
        ===================================================== */}

          {!loading &&
              filteredCommunities.length > 0 && (
                  <div className="admin-table-wrapper">
                    <table className="admin-communities-table">
                      <thead>
                      <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Members</th>
                        <th></th>
                      </tr>
                      </thead>

                      <tbody>
                      {filteredCommunities.map((community) => {
                        const isExpanded =
                            expandedId === community.id;

                        return (
                            <>
                              <tr
                                  key={`row-${community.id}`}
                                  className="admin-community-row"
                                  onClick={() =>
                                      toggleCommunity(community.id)
                                  }
                              >
                                <td>
                                  <div className="admin-community-name-cell">
                              <span className="admin-community-avatar">
                                {(community.communityName || "C").trim().charAt(0).toUpperCase()}
                              </span>
                                    <span className="admin-community-name-text">
                                {community.communityName}
                              </span>
                                  </div>
                                </td>

                                <td>
                            <span className="admin-owner-cell">
                              {community.ownerName || "—"}
                            </span>
                                </td>

                                <td>
                            <span className="admin-member-count">
                              {community.memberCount || 0}{" "}
                              {Number(community.memberCount) === 1 ? "member" : "members"}
                            </span>
                                </td>

                                <td>
                                  <button
                                      className="admin-delete-btn"
                                      onClick={(event) => {
                                        event.stopPropagation();

                                        askDeleteCommunity(
                                            community.id,
                                            community.communityName
                                        );
                                      }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>

                              {isExpanded && (
                                  <tr
                                      key={`members-${community.id}`}
                                      className="admin-members-panel"
                                  >
                                    <td colSpan={4}>
                                      <MembersList
                                          community={community}
                                      />
                                    </td>
                                  </tr>
                              )}
                            </>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
              )}

          {/* =====================================================
            MOBILE COMMUNITY CARDS
        ===================================================== */}

          {!loading &&
              filteredCommunities.length > 0 && (
                  <div className="admin-mobile-communities">
                    {filteredCommunities.map((community) => {
                      const isExpanded =
                          expandedId === community.id;

                      return (
                          <div
                              className="admin-community-card"
                              key={community.id}
                          >
                            {/* CARD MAIN */}
                            <div
                                className="admin-community-card-main"
                                onClick={() =>
                                    toggleCommunity(community.id)
                                }
                            >
                              <div className="admin-community-card-header">
                                <div className="admin-community-card-name">
                          <span className="admin-community-avatar">
                            {(community.communityName || "C").trim().charAt(0).toUpperCase()}
                          </span>
                                  <div className="admin-community-card-name-text">
                                    {community.communityName}
                                  </div>
                                </div>

                                <div className="admin-expand-icon">
                                  {isExpanded ? "−" : "+"}
                                </div>
                              </div>

                              <div className="admin-community-info">
                                <div className="admin-info-item">
                          <span className="admin-info-label">
                            Owner
                          </span>

                                  <span className="admin-info-value">
                            {community.ownerName || "—"}
                          </span>
                                </div>

                                <div className="admin-info-item">
                          <span className="admin-info-label">
                            Members
                          </span>

                                  <span className="admin-info-value">
                            <span className="admin-member-count">
                              {community.memberCount || 0}{" "}
                              {Number(community.memberCount) === 1 ? "member" : "members"}
                            </span>
                          </span>
                                </div>
                              </div>

                              <button
                                  className="admin-delete-btn admin-mobile-delete"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    askDeleteCommunity(
                                        community.id,
                                        community.communityName
                                    );
                                  }}
                              >
                                Delete Community
                              </button>
                            </div>

                            {/* MOBILE MEMBERS */}
                            {isExpanded && (
                                <div className="admin-mobile-members">
                                  <div className="admin-mobile-members-title">
                                    Members
                                  </div>

                                  <MembersList
                                      community={community}
                                  />
                                </div>
                            )}
                          </div>
                      );
                    })}
                  </div>
              )}
        </div>
      </DashboardLayout>
  );
}

export default AdminCommunities;