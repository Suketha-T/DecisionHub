import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:8080";

function AdminDecisions() {
  const { theme } = useTheme();
  const [decisions, setDecisions] = useState([]);
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

  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});

  const headers = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 3500);

    return () => clearTimeout(timer);
  }, [message]);

  const loadDecisions = async () => {
    try {
      const response = await fetch(`${API}/api/admin/decisions`, {
        headers: headers(),
      });

      if (!response.ok) {
        throw new Error("Unable to load decisions.");
      }

      const data = await response.json();
      setDecisions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      notify("Unable to load decisions.", true);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (decisionId) => {
    // Already fetched once — don't refetch every time the decision is reopened.
    if (comments[decisionId]) return;

    setCommentsLoading((current) => ({
      ...current,
      [decisionId]: true,
    }));

    try {
      const response = await fetch(
          `${API}/api/decisions/${decisionId}/comments`,
          {
            headers: headers(),
          }
      );

      if (!response.ok) {
        throw new Error("Unable to load comments.");
      }

      const data = await response.json();

      setComments((current) => ({
        ...current,
        [decisionId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error(err);
      notify("Unable to load comments.", true);
    } finally {
      setCommentsLoading((current) => ({
        ...current,
        [decisionId]: false,
      }));
    }
  };

  const toggleExpand = (decisionId) => {
    setExpandedId((current) => {
      const next = current === decisionId ? null : decisionId;

      if (next) {
        loadComments(next);
      }

      return next;
    });
  };

  const deleteDecision = async (id, title) => {
    try {
      const response = await fetch(`${API}/api/admin/decisions/${id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete decision.");
      }

      notify("Decision deleted.");

      setDecisions((current) =>
          current.filter((d) => d.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const deleteComment = async (decisionId, commentId) => {
    try {
      const response = await fetch(
          `${API}/api/admin/comments/${commentId}`,
          {
            method: "DELETE",
            headers: headers(),
          }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
            data.message || "Unable to delete comment."
        );
      }

      notify("Comment deleted.");

      setComments((current) => ({
        ...current,
        [decisionId]: (current[decisionId] || []).filter(
            (c) => c.id !== commentId
        ),
      }));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const askDeleteDecision = (id, title) => {
    setConfirmDialog({
      open: true,
      title: "Delete Decision",
      message: `Delete "${title}"? This will also remove its options, votes, and comments.`,
      onConfirm: () => deleteDecision(id, title),
    });
  };

  const askDeleteComment = (decisionId, commentId) => {
    setConfirmDialog({
      open: true,
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      onConfirm: () => deleteComment(decisionId, commentId),
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

  const filteredDecisions = decisions.filter((d) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
        d.title?.toLowerCase().includes(term) ||
        d.category?.toLowerCase().includes(term) ||
        d.createdByName?.toLowerCase().includes(term)
    );
  });

  /* =====================================================
     REUSABLE EXPANDED CONTENT
  ===================================================== */

  const DecisionDetails = ({ decision }) => {
    const decisionComments = comments[decision.id] || [];
    const loadingComments = commentsLoading[decision.id];

    return (
        <div className="admin-details-panel">
          {/* OPTIONS */}
          <div className="admin-panel-section-title">
            Options
          </div>

          {decision.options?.length ? (
              <div className="admin-options-list">
                {decision.options.map((option, optionIndex) => (
                    <div
                        className="admin-option-row"
                        key={option.id}
                    >
                <span className="admin-option-rank">
                  {String(optionIndex + 1).padStart(2, "0")}
                </span>

                      <span className="admin-option-text">
                  {option.optionText}
                </span>

                      <span className="admin-option-votes">
                  <span className="admin-option-votes-number">
                    {option.voteCount || 0}
                  </span>
                  <span className="admin-option-votes-label">
                    {Number(option.voteCount) === 1 ? "vote" : "votes"}
                  </span>
                </span>
                    </div>
                ))}
              </div>
          ) : (
              <div className="admin-empty">
                No options on this decision.
              </div>
          )}

          {/* COMMENTS */}
          <div className="admin-panel-section-title">
            Comments
          </div>

          {loadingComments && (
              <div className="admin-empty">
                Loading comments…
              </div>
          )}

          {!loadingComments &&
              decisionComments.length === 0 && (
                  <div className="admin-empty">
                    No comments on this decision.
                  </div>
              )}

          {!loadingComments &&
              decisionComments.length > 0 && (
                  <div className="admin-comments-list">
                    {decisionComments.map((comment) => (
                        <div
                            className="admin-comment-row"
                            key={comment.id}
                        >
                          <div className="admin-comment-content">
                            <div className="admin-comment-body">
                              {comment.content}
                            </div>

                            <div className="admin-comment-meta">
                              {comment.userName || "Unknown user"}

                              {comment.createdAt &&
                                  ` · ${new Date(
                                      comment.createdAt
                                  ).toLocaleString()}`}
                            </div>
                          </div>

                          <button
                              className="admin-comment-delete-btn"
                              onClick={(event) => {
                                event.stopPropagation();

                                askDeleteComment(
                                    decision.id,
                                    comment.id
                                );
                              }}
                          >
                            Delete
                          </button>
                        </div>
                    ))}
                  </div>
              )}
        </div>
    );
  };

  return (
      <DashboardLayout
          pageTitle="Manage Decisions"
          pageSubtitle="View, search, and remove decisions across the platform."
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
        /* =====================================================
           FUTURISTIC ADMIN DECISIONS UI
        ===================================================== */

        .admin-decisions-page {
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
          font-weight: 500;
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

        .admin-page-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          padding: 28px 30px;
          border: 1px solid rgba(139, 92, 246, 0.24);
          border-radius: 24px;
          background:
            radial-gradient(circle at 85% 15%, rgba(168, 85, 247, 0.24), transparent 30%),
            radial-gradient(circle at 15% 100%, rgba(59, 130, 246, 0.14), transparent 32%),
            linear-gradient(135deg, rgba(27, 22, 46, 0.98), rgba(16, 14, 30, 0.98));
          box-shadow:
            0 20px 55px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .admin-page-hero::before {
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

        .admin-hero-content {
          position: relative;
          z-index: 1;
        }

        .admin-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #a78bfa;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .admin-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 14px rgba(167, 139, 250, 0.8);
        }

        .admin-page-title {
          margin: 0;
          color: #fff;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.08;
          letter-spacing: -0.035em;
          font-weight: 500;
        }

        .admin-page-description {
          max-width: 650px;
          margin: 10px 0 0;
          color: #a9a2bd;
          font-size: 13px;
          line-height: 1.7;
        }

        .admin-stat-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .admin-stat-card {
          padding: 15px 17px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          backdrop-filter: blur(12px);
        }

        .admin-stat-label {
          display: block;
          margin-bottom: 6px;
          color: #817b94;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .admin-stat-value {
          color: #f8f7ff;
          font-size: 22px;
          line-height: 1;
          font-weight: 500;
        }

        .admin-toolbar {
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
          font-weight: 500;
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
          -webkit-overflow-scrolling: touch;
        }

        .admin-decisions-table {
          width: 100%;
          min-width: 720px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-decisions-table th,
        .admin-decisions-table td {
          text-align: left;
          padding: 17px 18px;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          color: var(--app-text);
        }

        .admin-decisions-table th {
          color: #777083;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.018);
          white-space: nowrap;
        }

        .admin-decisions-table th:first-child {
          padding-left: 22px;
        }

        .admin-decisions-table td:first-child {
          padding-left: 22px;
          font-weight: 500;
        }

        .admin-decisions-table tbody tr:last-child td {
          border-bottom: none;
        }

        .admin-decision-row {
          cursor: pointer;
          transition:
            background 0.22s ease,
            transform 0.22s ease;
        }

        .admin-decision-row:hover {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.08),
            rgba(139, 92, 246, 0.025)
          );
        }

        .admin-decision-row td:first-child {
          position: relative;
        }

        .admin-decision-row td:first-child::before {
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

        .admin-decision-row:hover td:first-child::before {
          opacity: 1;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          max-width: 180px;
          padding: 6px 10px;
          border: 1px solid rgba(167, 139, 250, 0.16);
          border-radius: 999px;
          background: rgba(139, 92, 246, 0.1);
          color: #b8a7ff;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        
        .admin-votes {
          display: inline-flex;
          align-items: baseline;
          gap: 5px;
          padding: 7px 11px;
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.10),
            rgba(59, 130, 246, 0.05)
          );
          color: #c7bfff;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .admin-votes-number {
          color: #ffffff;
          font-size: 14px;
          line-height: 1;
        }

        .admin-votes-label {
          color: #8f88a0;
          font-size: 10px;
          font-weight: 500;
        }


        .admin-delete-btn {
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 500;
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

        .admin-options-panel {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.07), transparent 30%),
            linear-gradient(180deg, rgba(139, 92, 246, 0.045), rgba(12, 10, 22, 0.12));
        }

        .admin-options-panel td {
          padding: 0 24px 24px !important;
        }

        .admin-details-panel {
          width: 100%;
          box-sizing: border-box;
          padding-top: 6px;
          animation: adminDetailsIn 0.22s ease;
        }

        @keyframes adminDetailsIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-panel-section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: #928aa3;
          margin: 19px 0 10px;
        }

        .admin-panel-section-title::before {
          content: "";
          width: 4px;
          height: 13px;
          border-radius: 4px;
          background: #8b5cf6;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.45);
        }

        .admin-panel-section-title:first-child {
          margin-top: 8px;
        }


        .admin-options-list {
          width: 100%;
          display: grid;
          gap: 11px;
          margin-top: 2px;
        }

        .admin-option-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          min-height: 64px;
          padding: 13px 14px 13px 17px;
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-radius: 16px;
          background:
            linear-gradient(
              105deg,
              rgba(139, 92, 246, 0.07),
              rgba(255, 255, 255, 0.018) 48%,
              rgba(59, 130, 246, 0.035)
            );
          box-shadow:
            0 7px 22px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
          overflow: hidden;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-option-row::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: linear-gradient(180deg, #a78bfa, #6366f1);
          opacity: 0.65;
        }

        .admin-option-row:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.27);
          background:
            linear-gradient(
              105deg,
              rgba(139, 92, 246, 0.11),
              rgba(255, 255, 255, 0.025) 48%,
              rgba(59, 130, 246, 0.05)
            );
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.14),
            0 0 0 1px rgba(139, 92, 246, 0.025);
        }

        .admin-option-text {
          min-width: 0;
          flex: 1;
          padding-left: 3px;
          color: #f2effa;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-option-votes {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-shrink: 0;
          min-width: 68px;
          padding: 8px 10px;
          border: 1px solid rgba(96, 165, 250, 0.12);
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.10),
            rgba(99, 102, 241, 0.10)
          );
          color: #a7caff;
          font-size: 10px;
          line-height: 1;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .admin-option-votes-number {
          color: #ffffff;
          font-size: 15px;
          line-height: 1;
        }

        .admin-option-votes-label {
          color: #91a9cb;
          font-size: 9px;
          font-weight: 500;
        }

        .admin-option-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 27px;
          height: 27px;
          margin-left: -3px;
          border: 1px solid rgba(167, 139, 250, 0.13);
          border-radius: 9px;
          background: rgba(167, 139, 250, 0.065);
          color: #9d8de0;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }


        .admin-comment-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 16px 16px 16px 19px;
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-radius: 15px;
          background:
            linear-gradient(
              110deg,
              rgba(139, 92, 246, 0.055),
              rgba(255, 255, 255, 0.018) 45%,
              rgba(59, 130, 246, 0.028)
            );
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
          overflow: hidden;
        }

        .admin-comment-row::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #a78bfa, #6366f1);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.35);
        }

        .admin-comment-row::after {
          content: "“";
          position: absolute;
          right: 74px;
          top: -5px;
          color: rgba(167, 139, 250, 0.06);
          font-family: Georgia, serif;
          font-size: 72px;
          line-height: 1;
          pointer-events: none;
        }

        .admin-comment-row:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.25);
          box-shadow:
            0 13px 30px rgba(0, 0, 0, 0.16),
            0 0 0 1px rgba(139, 92, 246, 0.035);
        }

        .admin-comment-content {
          min-width: 0;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .admin-comment-body {
          color: #f3f0fb;
          font-size: 13px;
          line-height: 1.65;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-comment-meta {
          display: inline-flex;
          align-items: center;
          margin-top: 9px;
          padding: 5px 9px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.028);
          color: #8f88a0;
          font-size: 9px;
          line-height: 1.3;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-comment-delete-btn {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          min-width: 74px;
          min-height: 34px;
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.07);
          color: #f87171;
          padding: 8px 11px;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-comment-delete-btn:hover {
          background: rgba(239, 68, 68, 0.13);
          border-color: rgba(248, 113, 113, 0.34);
          color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.10);
        }

        .admin-mobile-decisions {
          display: none;
        }

        .admin-decision-card {
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

        .admin-decision-card-main {
          padding: 18px;
        }

        .admin-decision-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-decision-title {
          flex: 1;
          min-width: 0;
          font-size: 16px;
          line-height: 1.4;
          font-weight: 500;
          color: var(--app-text);
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
          font-weight: 500;
        }

        .admin-decision-card-category {
          margin-top: 12px;
        }

        .admin-decision-card-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-info-item {
          min-width: 0;
          padding: 11px 12px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.025);
        }

        .admin-info-label {
          display: block;
          margin-bottom: 5px;
          font-size: 9px;
          font-weight: 500;
          color: #777083;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .admin-info-value {
          display: block;
          font-size: 12px;
          color: var(--app-text);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .admin-mobile-delete {
          width: 100%;
          margin-top: 14px;
          min-height: 42px;
        }

        .admin-mobile-details {
          padding: 0 18px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 8, 18, 0.18);
        }

        .admin-mobile-details .admin-details-panel {
          padding-top: 8px;
        }

        @media (max-width: 768px) {
          .admin-decisions-page {
            max-width: 100%;
          }

          .admin-page-hero {
            padding: 23px 21px;
            border-radius: 20px;
          }

          .admin-stat-grid {
            gap: 9px;
          }

          .admin-stat-card {
            padding: 13px;
          }

          .admin-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 9px;
          }

          .admin-results-count {
            padding-left: 3px;
          }

          .admin-table-wrapper {
            border-radius: 16px;
          }
        }

        @media (max-width: 600px) {
          .admin-decisions-page {
            padding-bottom: 25px;
          }

          .admin-back-link {
            font-size: 12px;
            margin-bottom: 13px;
          }

          .admin-page-hero {
            padding: 21px 18px;
            margin-bottom: 15px;
          }

          .admin-page-title {
            font-size: 27px;
          }

          .admin-page-description {
            font-size: 12px;
          }

          .admin-stat-grid {
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 17px;
          }

          .admin-stat-card {
            padding: 11px 9px;
            border-radius: 12px;
          }

          .admin-stat-label {
            font-size: 8px;
          }

          .admin-stat-value {
            font-size: 18px;
          }

          .admin-search {
            padding: 12px 13px 12px 40px;
          }

          .admin-table-wrapper {
            display: none;
          }

          .admin-mobile-decisions {
            display: block;
          }

          .admin-decision-card-info {
            grid-template-columns: 1fr 1fr;
          }

          .admin-option-row {
            align-items: flex-start;
            gap: 10px;
          }
          .admin-comment-row {
            align-items: stretch;
            gap: 12px;
          }

          .admin-comment-delete-btn {
            align-self: center;
          }

        }

        @media (max-width: 380px) {
          .admin-stat-grid {
            grid-template-columns: 1fr;
          }

          .admin-stat-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .admin-stat-label {
            margin-bottom: 0;
          }

          .admin-decision-card-main {
            padding: 15px;
          }

          .admin-mobile-details {
            padding-left: 15px;
            padding-right: 15px;
          }

          .admin-decision-card-info {
            grid-template-columns: 1fr;
          }

          .admin-option-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .admin-option-votes {
            white-space: normal;
          }
        }

        /* =====================================================
           LIGHT THEME — MATCH ADMIN USERS
           Keeps the purple hero style in dark mode and changes
           all inner surfaces to clean white in light mode.
        ===================================================== */

        .admin-decisions-page.theme-light {
          color: #2b2440;
        }

        .admin-decisions-page.theme-light .admin-page-hero {
          background:
            radial-gradient(circle at 85% 15%, rgba(168, 85, 247, 0.10), transparent 30%),
            radial-gradient(circle at 15% 100%, rgba(99, 102, 241, 0.06), transparent 32%),
            linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%);
          border-color: rgba(139, 92, 246, 0.14);
          box-shadow:
            0 20px 55px rgba(31, 24, 54, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .admin-decisions-page.theme-light .admin-page-hero::before {
          border-color: rgba(139, 92, 246, 0.12);
          box-shadow:
            0 0 0 22px rgba(139, 92, 246, 0.025),
            0 0 0 44px rgba(139, 92, 246, 0.015);
        }

        .admin-decisions-page.theme-light .admin-eyebrow {
          color: #7c3aed;
        }

        .admin-decisions-page.theme-light .admin-eyebrow-dot {
          background: #8b5cf6;
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.45);
        }

        .admin-decisions-page.theme-light .admin-page-title {
          color: #241c35;
        }

        .admin-decisions-page.theme-light .admin-page-description {
          color: #6b6478;
        }

        .admin-decisions-page.theme-light .admin-stat-card {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.12);
          box-shadow: 0 8px 24px rgba(31, 24, 54, 0.07);
          backdrop-filter: none;
        }

        .admin-decisions-page.theme-light .admin-stat-label {
          color: #756d82;
        }

        .admin-decisions-page.theme-light .admin-stat-value {
          color: #2b2440;
        }

        .admin-decisions-page.theme-light .admin-back-link {
          color: #7c3aed;
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.18);
          box-shadow: 0 6px 18px rgba(31, 24, 54, 0.05);
        }

        .admin-decisions-page.theme-light .admin-back-link:hover {
          color: #6d28d9;
          background: #faf8ff;
          border-color: rgba(139, 92, 246, 0.35);
        }

        .admin-decisions-page.theme-light .admin-search {
          background: #ffffff;
          color: #2b2440;
          border-color: rgba(139, 92, 246, 0.16);
          box-shadow: 0 8px 28px rgba(31, 24, 54, 0.06);
        }

        .admin-decisions-page.theme-light .admin-search::placeholder {
          color: #8b8297;
        }

        .admin-decisions-page.theme-light .admin-search:focus {
          background: #ffffff;
          border-color: #8b5cf6;
          box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.09),
            0 12px 30px rgba(31, 24, 54, 0.08);
        }

        .admin-decisions-page.theme-light .admin-search-icon {
          color: #7c6b99;
        }

        .admin-decisions-page.theme-light .admin-results-count {
          color: #756d82;
        }

        .admin-decisions-page.theme-light .admin-results-count strong {
          color: #7c3aed;
        }

        .admin-decisions-page.theme-light .admin-table-wrapper {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.13);
          box-shadow: 0 18px 50px rgba(31, 24, 54, 0.08);
        }

        .admin-decisions-page.theme-light .admin-decisions-table th,
        .admin-decisions-page.theme-light .admin-decisions-table td {
          color: #3a324c;
          border-bottom-color: rgba(91, 72, 125, 0.10);
        }

        .admin-decisions-page.theme-light .admin-decisions-table th {
          color: #70677d;
          background: #faf9fc;
        }

        .admin-decisions-page.theme-light .admin-decision-row:hover {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.07),
            rgba(139, 92, 246, 0.025)
          );
        }

        .admin-decisions-page.theme-light .admin-badge {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.16);
          color: #6d45b8;
        }

        .admin-decisions-page.theme-light .admin-votes {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.08),
            rgba(99, 102, 241, 0.05)
          );
          border-color: rgba(139, 92, 246, 0.14);
          color: #6d5a91;
          box-shadow: none;
        }

        .admin-decisions-page.theme-light .admin-votes-number {
          color: #4c3b68;
        }

        .admin-decisions-page.theme-light .admin-votes-label {
          color: #81778d;
        }

        .admin-decisions-page.theme-light .admin-empty {
          background: #ffffff;
          border-color: rgba(139, 92, 246, 0.20);
          color: #756d82;
          box-shadow: 0 8px 25px rgba(31, 24, 54, 0.05);
        }

        .admin-decisions-page.theme-light .admin-options-panel {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.045), transparent 30%),
            #ffffff;
        }

        .admin-decisions-page.theme-light .admin-panel-section-title {
          color: #756d82;
        }

        .admin-decisions-page.theme-light .admin-option-row {
          background:
            linear-gradient(
              105deg,
              rgba(139, 92, 246, 0.055),
              #ffffff 48%,
              rgba(99, 102, 241, 0.025)
            );
          border-color: rgba(139, 92, 246, 0.13);
          box-shadow: 0 7px 22px rgba(31, 24, 54, 0.06);
        }

        .admin-decisions-page.theme-light .admin-option-row:hover {
          background:
            linear-gradient(
              105deg,
              rgba(139, 92, 246, 0.09),
              #ffffff 48%,
              rgba(99, 102, 241, 0.04)
            );
          box-shadow: 0 12px 28px rgba(31, 24, 54, 0.08);
        }

        .admin-decisions-page.theme-light .admin-option-text {
          color: #3a324c;
        }

        .admin-decisions-page.theme-light .admin-option-rank {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.15);
          color: #7657aa;
        }

        .admin-decisions-page.theme-light .admin-option-votes {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.07),
            rgba(139, 92, 246, 0.07)
          );
          border-color: rgba(99, 102, 241, 0.13);
          color: #66558a;
          box-shadow: none;
        }

        .admin-decisions-page.theme-light .admin-option-votes-number {
          color: #4c3b68;
        }

        .admin-decisions-page.theme-light .admin-option-votes-label {
          color: #7c728c;
        }

        .admin-decisions-page.theme-light .admin-comment-row {
          background:
            linear-gradient(
              110deg,
              rgba(139, 92, 246, 0.045),
              #ffffff 45%,
              rgba(99, 102, 241, 0.02)
            );
          border-color: rgba(139, 92, 246, 0.13);
          box-shadow: 0 8px 24px rgba(31, 24, 54, 0.06);
        }

        .admin-decisions-page.theme-light .admin-comment-row:hover {
          box-shadow:
            0 13px 30px rgba(31, 24, 54, 0.08),
            0 0 0 1px rgba(139, 92, 246, 0.025);
        }

        .admin-decisions-page.theme-light .admin-comment-body {
          color: #3a324c;
        }

        .admin-decisions-page.theme-light .admin-comment-meta {
          background: rgba(139, 92, 246, 0.035);
          border-color: rgba(139, 92, 246, 0.10);
          color: #7b7187;
        }

        .admin-decisions-page.theme-light .admin-decision-card {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.055), transparent 35%),
            #ffffff;
          border-color: rgba(139, 92, 246, 0.14);
          box-shadow: 0 12px 35px rgba(31, 24, 54, 0.07);
        }

        .admin-decisions-page.theme-light .admin-decision-title {
          color: #2f2740;
        }

        .admin-decisions-page.theme-light .admin-expand-icon {
          background: rgba(139, 92, 246, 0.07);
          border-color: rgba(139, 92, 246, 0.18);
          color: #7047b8;
        }

        .admin-decisions-page.theme-light .admin-decision-card-info {
          border-top-color: rgba(91, 72, 125, 0.10);
        }

        .admin-decisions-page.theme-light .admin-info-item {
          background: #faf9fc;
        }

        .admin-decisions-page.theme-light .admin-info-label {
          color: #776e80;
        }

        .admin-decisions-page.theme-light .admin-info-value {
          color: #3a324c;
        }

        .admin-decisions-page.theme-light .admin-mobile-details {
          background: #ffffff;
          border-top-color: rgba(91, 72, 125, 0.10);
        }

      `}</style>

        <div className={`admin-decisions-page ${theme === "light" ? "theme-light" : ""}`}>

          <div className="admin-page-hero">
            <div className="admin-hero-content">
              <div className="admin-eyebrow">
                <span className="admin-eyebrow-dot" />
                Platform control center
              </div>

              <h1 className="admin-page-title">Manage Decisions</h1>

              <p className="admin-page-description">
                Review community decisions, explore voting activity, and keep
                discussions clean and organized.
              </p>

              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <span className="admin-stat-label">Total decisions</span>
                  <span className="admin-stat-value">{decisions.length}</span>
                </div>

                <div className="admin-stat-card">
                  <span className="admin-stat-label">Total votes</span>
                  <span className="admin-stat-value">
                  {decisions.reduce(
                      (sum, decision) => sum + (Number(decision.totalVotes) || 0),
                      0
                  )}
                </span>
                </div>

                <div className="admin-stat-card">
                  <span className="admin-stat-label">Showing</span>
                  <span className="admin-stat-value">
                  {filteredDecisions.length}
                </span>
                </div>
              </div>
            </div>
          </div>
          <Link
              className="admin-back-link"
              to="/admin"
          >
            ← Back to Admin Dashboard
          </Link>

          {/* SEARCH / FILTER TOOLBAR */}
          <div className="admin-toolbar">
            <div className="admin-search-wrapper">
              <span className="admin-search-icon">⌕</span>
              <input
                  className="admin-search"
                  value={search}
                  onChange={(event) =>
                      setSearch(event.target.value)
                  }
                  placeholder="Search by title, category, or creator..."
                  aria-label="Search decisions"
              />
            </div>

            <div className="admin-results-count">
              <strong>{filteredDecisions.length}</strong>{" "}
              {filteredDecisions.length === 1 ? "decision" : "decisions"}
            </div>
          </div>

          {/* LOADING */}
          {loading && (
              <div className="admin-empty">
                Loading decisions…
              </div>
          )}

          {/* NO RESULTS */}
          {!loading &&
              filteredDecisions.length === 0 && (
                  <div className="admin-empty">
                    No decisions found.
                  </div>
              )}

          {/* =====================================================
            DESKTOP / TABLET TABLE
        ===================================================== */}

          {!loading &&
              filteredDecisions.length > 0 && (
                  <div className="admin-table-wrapper">
                    <table className="admin-decisions-table">
                      <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Created By</th>
                        <th>Votes</th>
                        <th></th>
                      </tr>
                      </thead>

                      <tbody>
                      {filteredDecisions.map((decision) => {
                        const isExpanded =
                            expandedId === decision.id;

                        return (
                            <>
                              <tr
                                  key={`row-${decision.id}`}
                                  className="admin-decision-row"
                                  onClick={() =>
                                      toggleExpand(decision.id)
                                  }
                              >
                                <td>
                                  <div>{decision.title}</div>
                                </td>

                                <td>
                            <span className="admin-badge">
                              {decision.category ||
                                  "Uncategorized"}
                            </span>
                                </td>

                                <td>
                                  {decision.createdByName || "—"}
                                </td>

                                <td>
                            <span className="admin-votes">
                              <span className="admin-votes-number">
                                {decision.totalVotes || 0}
                              </span>
                              <span className="admin-votes-label">
                                {Number(decision.totalVotes) === 1 ? "vote" : "votes"}
                              </span>
                            </span>
                                </td>

                                <td>
                                  <button
                                      className="admin-delete-btn"
                                      onClick={(event) => {
                                        event.stopPropagation();

                                        askDeleteDecision(
                                            decision.id,
                                            decision.title
                                        );
                                      }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>

                              {isExpanded && (
                                  <tr
                                      key={`details-${decision.id}`}
                                      className="admin-options-panel"
                                  >
                                    <td colSpan={5}>
                                      <DecisionDetails
                                          decision={decision}
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
            MOBILE CARDS
        ===================================================== */}

          {!loading &&
              filteredDecisions.length > 0 && (
                  <div className="admin-mobile-decisions">
                    {filteredDecisions.map((decision) => {
                      const isExpanded =
                          expandedId === decision.id;

                      return (
                          <div
                              className="admin-decision-card"
                              key={decision.id}
                          >
                            {/* CARD MAIN */}
                            <div
                                className="admin-decision-card-main"
                                onClick={() =>
                                    toggleExpand(decision.id)
                                }
                            >
                              <div className="admin-decision-card-header">
                                <div className="admin-decision-title">
                                  {decision.title}
                                </div>

                                <div className="admin-expand-icon">
                                  {isExpanded ? "−" : "+"}
                                </div>
                              </div>

                              <div className="admin-decision-card-category">
                        <span className="admin-badge">
                          {decision.category ||
                              "Uncategorized"}
                        </span>
                              </div>

                              <div className="admin-decision-card-info">
                                <div className="admin-info-item">
                          <span className="admin-info-label">
                            Created By
                          </span>

                                  <span className="admin-info-value">
                            {decision.createdByName ||
                                "—"}
                          </span>
                                </div>

                                <div className="admin-info-item">
                          <span className="admin-info-label">
                            Votes
                          </span>

                                  <span className="admin-info-value">
                            {decision.totalVotes}
                          </span>
                                </div>
                              </div>

                              <button
                                  className="admin-delete-btn admin-mobile-delete"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    askDeleteDecision(
                                        decision.id,
                                        decision.title
                                    );
                                  }}
                              >
                                Delete Decision
                              </button>
                            </div>

                            {/* MOBILE EXPANDED DETAILS */}
                            {isExpanded && (
                                <div className="admin-mobile-details">
                                  <DecisionDetails
                                      decision={decision}
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

export default AdminDecisions;