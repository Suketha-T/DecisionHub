import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const API = "http://localhost:8080";

function Communities() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);

  const [form, setForm] = useState({
    communityName: "",
    description: "",
  });

  const [opened, setOpened] = useState(null);
  const [communityDecisions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: null,
  });

  const headers = () => ({
    Authorization:
        "Bearer " + sessionStorage.getItem("token"),
  });

  const notify = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };


  /* =========================
     LOAD COMMUNITIES
  ========================= */

  const load = async () => {
    try {
      const response = await fetch(
          API + "/api/communities",
          {
            headers: headers(),
          }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to load communities."
        );
      }

      setCommunities(data);

    } catch (error) {
      notify(
          error.message ||
          "Unable to load communities.",
          true
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);


  /* =========================
     CLEAR TOAST
  ========================= */

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(
        () => setMessage(""),
        3500
    );

    return () => clearTimeout(timer);
  }, [message]);


  /* =========================
     CREATE COMMUNITY
  ========================= */

  const create = async (event) => {
    event.preventDefault();

    if (!form.communityName.trim()) {
      return notify(
          "Community name is required.",
          true
      );
    }

    try {
      const response = await fetch(
          API + "/api/communities",
          {
            method: "POST",
            headers: {
              ...headers(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to create community."
        );
      }

      setForm({
        communityName: "",
        description: "",
      });

      notify(
          "Community created successfully."
      );

      load();

    } catch (error) {
      notify(
          error.message ||
          "Unable to create community.",
          true
      );
    }
  };


  /* =========================
     JOIN / LEAVE
  ========================= */

  const membership = async (community) => {
    if (community.joined) {
      setConfirmDialog({
        open: true,
        title: "Leave Community",
        message: `Are you sure you want to leave "${community.communityName}"?`,
        confirmText: "Leave",
        onConfirm: () => performMembershipAction(community, "leave"),
      });
      return;
    }

    await performMembershipAction(community, "join");
  };


  const performMembershipAction = async (community, action) => {
    try {

      const response = await fetch(
          API +
          "/api/communities/" +
          community.id +
          "/" +
          action,
          {
            method: "POST",
            headers: headers(),
          }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to update membership."
        );
      }

      notify(
          community.joined
              ? "Community left successfully."
              : "Community joined successfully."
      );

      if (
          opened?.id === community.id &&
          community.joined
      ) {
        setOpened(null);
      }

      load();

    } catch (error) {
      notify(
          error.message ||
          "Unable to update membership.",
          true
      );
    }
  };


  /* =========================
     VIEW COMMUNITY
  ========================= */

  const viewCommunity = async (community) => {
    if (!community.joined) {
      return notify(
          "Join this community to enter its workspace.",
          true
      );
    }

    navigate(
        `/communities/${community.id}`
    );
  };


  /* =========================
     DELETE COMMUNITY
  ========================= */

  const deleteCommunity = async (community) => {
    try {
      const response = await fetch(
          `${API}/api/communities/${community.id}`,
          {
            method: "DELETE",
            headers: headers(),
          }
      );

      const data = await response
          .json()
          .catch(() => ({}));

      console.log(
          "Delete status:",
          response.status
      );

      console.log(
          "Delete response:",
          data
      );

      if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to delete community."
        );
      }

      notify(
          "Community deleted."
      );

      load();

    } catch (error) {
      console.error(
          "Delete community error:",
          error
      );

      notify(
          error.message ||
          "Unable to delete community.",
          true
      );
    }
  };


  const askDeleteCommunity = (community) => {
    setConfirmDialog({
      open: true,
      title: "Delete Community",
      message: `Delete "${community.communityName}"? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: () => deleteCommunity(community),
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      onConfirm: null,
    });
  };


  return (
      <DashboardLayout
          pageTitle="Communities"
          pageSubtitle="Discover people, ideas, and shared decisions in one place."
      >

        <Toast
            message={message}
            isError={isError}
        />

        <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText={confirmDialog.confirmText}
            cancelText="Cancel"
            onCancel={closeConfirmDialog}
            onConfirm={() => {
              const action = confirmDialog.onConfirm;
              closeConfirmDialog();
              if (action) action();
            }}
        />


        <style>{`

        /* =========================
           MAIN PAGE
        ========================= */

        .communities-page {
          max-width: 1400px;

          margin: 0 auto;

          padding:
            4px 0 42px;

          color:
            var(--app-text);
        }


        /* =========================
           HERO
        ========================= */

        .communities-hero {
          position: relative;

          overflow: hidden;

          display: flex;

          flex-direction: column;

          gap: 0;

          padding:
            32px 32px 30px;

          border:
            1px solid
            var(--app-border);

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              var(--app-card),
              var(--app-card-2)
            );

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .communities-hero::after {
          content: "";

          position: absolute;

          right: -80px;
          top: -80px;

          width: 230px;
          height: 230px;

          border-radius: 50%;

          background:
            rgba(99, 102, 241, 0.12);

          filter:
            blur(50px);

          pointer-events:
            none;
        }


        /* =========================
           HERO CONTENT
        ========================= */

        .communities-hero-content {
          position: relative;

          z-index: 1;
        }


        .communities-kicker {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            10px 16px;

          border:
            1px solid
            rgba(139, 92, 246, .35);

          border-radius:
            30px;

          color:
            #8b5cf6;

          background:
            rgba(139, 92, 246, .08);

          font-size:
            11px;

          font-weight:
            700;

          letter-spacing:
            1.5px;

          text-transform:
            uppercase;
        }


        .communities-kicker::before {
          content: "";

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background:
            #8b5cf6;

          box-shadow:
            0 0 10px
            rgba(139, 92, 246, .7);
        }


        .communities-hero h2 {
          max-width:
            760px;

          margin:
            24px 0 10px;

          color:
            var(--app-text);

          font-size:
            clamp(
              30px,
              4vw,
              48px
            );

          line-height:
            1.12;

          letter-spacing:
            -1.4px;
        }


        .communities-hero p {
          max-width:
            780px;

          margin:
            0;

          color:
            var(--app-secondary-text);

          font-size:
            14px;

          line-height:
            1.75;
        }


        /* =========================
           CREATE COMMUNITY
        ========================= */

        .community-create {
          position: relative;

          z-index: 2;

          width: 100%;

          box-sizing:
            border-box;

          margin-top:
            28px;

          padding:
            20px;

          border:
            1px solid
            var(--app-border);

          border-radius:
            15px;

          background:
            rgba(
              255,
              255,
              255,
              .025
            );

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .community-create:hover {
          border-color:
            rgba(
              139,
              92,
              246,
              .35
            );
        }


        .community-create label {
          display: block;

          margin-bottom:
            5px;

          color:
            var(--app-text);

          font-size:
            15px;

          font-weight:
            700;
        }


        .community-create-subtitle {
          display: block;

          margin-bottom:
            15px;

          color:
            var(--app-secondary-text);

          font-size:
            11px;

          line-height:
            1.5;
        }


        .create-fields {
          display: grid;

          grid-template-columns:
            minmax(180px, .8fr)
            minmax(260px, 1.5fr)
            auto;

          gap:
            10px;

          align-items:
            stretch;
        }


        .create-fields input {
          min-width:
            0;

          height:
            45px;

          box-sizing:
            border-box;

          border:
            1px solid
            var(--app-border);

          border-radius:
            9px;

          outline:
            none;

          background:
            var(--app-bg);

          color:
            var(--app-text);

          padding:
            0 13px;

          font-size:
            11px;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }


        .create-fields input::placeholder {
          color:
            var(--app-secondary-text);
        }


        .create-fields input:focus {
          border-color:
            #7351b6;

          box-shadow:
            0 0 0 2px
            rgba(
              115,
              81,
              182,
              .10
            );
        }


        .create-fields button {
          min-width:
            150px;

          height:
            45px;

          border:
            0;

          border-radius:
            9px;

          color:
            white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #7c3aed
            );

          padding:
            0 18px;

          font-size:
            11px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            box-shadow 0.2s ease;
        }


        .create-fields button:hover {
          transform:
            translateY(-1px);

          opacity:
            .95;

          box-shadow:
            0 8px 20px
            rgba(
              99,
              102,
              241,
              .22
            );
        }


        /* =========================
           SECTION HEADER
        ========================= */

        .community-section-head {
          display: flex;

          justify-content:
            space-between;

          align-items:
            end;

          margin:
            30px 0 14px;
        }


        .community-section-head h3 {
          margin:
            0;

          color:
            var(--app-text);

          font-size:
            19px;
        }


        .community-section-head span {
          color:
            var(--app-secondary-text);

          font-size:
            11px;
        }


        /* =========================
           COMMUNITY GRID
        ========================= */

        .community-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap:
            17px;
        }


        /* =========================
           COMMUNITY CARD
        ========================= */

        .community-card {
          position: relative;

          overflow: hidden;

          padding:
            21px;

          border:
            1px solid
            var(--app-border);

          border-radius:
            15px;

          background:
            var(--app-card);

          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            background 0.25s ease;
        }


        .community-card:hover {
          transform:
            translateY(-3px);

          border-color:
            #564075;

          box-shadow:
            0 15px 32px
            rgba(
              0,
              0,
              0,
              .15
            );
        }


        /* =========================
           CARD TOP
        ========================= */

        .community-card-top {
          display: flex;

          align-items:
            center;

          justify-content:
            space-between;
        }


        .community-mark {
          display: flex;

          align-items:
            center;

          justify-content:
            center;

          width:
            37px;

          height:
            37px;

          border:
            1px solid
            #473263;

          border-radius:
            10px;

          color:
            #8b5cf6;

          background:
            var(--app-card-2);

          font-size:
            15px;

          font-weight:
            800;
        }


        .community-state {
          border-radius:
            20px;

          padding:
            5px 8px;

          font-size:
            9px;

          font-weight:
            700;
        }


        .community-state.joined {
          color:
            #16a34a;

          border:
            1px solid
            rgba(
              22,
              163,
              74,
              .25
            );

          background:
            rgba(
              22,
              163,
              74,
              .10
            );
        }


        .community-state.open {
          color:
            #8b5cf6;

          border:
            1px solid
            rgba(
              139,
              92,
              246,
              .25
            );

          background:
            rgba(
              139,
              92,
              246,
              .10
            );
        }


        /* =========================
           CARD CONTENT
        ========================= */

        .community-card h3 {
          margin:
            17px 0 7px;

          color:
            var(--app-text);

          font-size:
            17px;
        }


        .community-card p {
          min-height:
            41px;

          margin:
            0;

          color:
            var(--app-secondary-text);

          font-size:
            12px;

          line-height:
            1.6;
        }


        .community-owner {
          display:
            block;

          margin-top:
            12px;

          color:
            var(--app-secondary-text);

          font-size:
            10px;
        }


        /* =========================
           ACTIONS
        ========================= */

        .community-actions {
          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap:
            7px;

          margin-top:
            17px;

          padding-top:
            14px;

          border-top:
            1px solid
            var(--app-border);
        }


        .member-count {
          color:
            var(--app-secondary-text);

          font-size:
            10px;
        }


        .community-buttons {
          display: flex;

          gap:
            7px;
        }


        .community-buttons button {
          border-radius:
            8px;

          padding:
            8px 10px;

          font-size:
            10px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }


        .community-buttons button:hover {
          transform:
            translateY(-1px);

          opacity:
            .9;
        }


        .view-community {
          color:
            var(--app-text);

          border:
            1px solid
            var(--app-border);

          background:
            var(--app-card-2);
        }


        .join-community {
          color:
            white;

          border:
            0;

          background:
            #6840be;
        }


        .leave-community {
          color:
            #dc2626;

          border:
            1px solid
            rgba(
              220,
              38,
              38,
              .35
            );

          background:
            rgba(
              220,
              38,
              38,
              .08
            );
        }


        /* =========================
           COMMUNITY DETAIL
        ========================= */

        .community-detail {
          margin-top:
            22px;

          padding:
            23px;

          border:
            1px solid
            var(--app-border);

          border-radius:
            16px;

          background:
            var(--app-card);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .detail-top {
          display: flex;

          justify-content:
            space-between;

          gap:
            18px;
        }


        .detail-top h3 {
          margin:
            0;

          color:
            var(--app-text);

          font-size:
            19px;
        }


        .detail-top p {
          margin:
            6px 0 0;

          color:
            var(--app-secondary-text);

          font-size:
            11px;
        }


        .close-detail {
          border:
            0;

          color:
            #8b5cf6;

          background:
            transparent;

          font-size:
            11px;

          cursor:
            pointer;
        }


        /* =========================
           DECISION STRIP
        ========================= */

        .decision-strip {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap:
            10px;

          margin-top:
            17px;
        }


        .decision-strip > div {
          padding:
            13px;

          border:
            1px solid
            var(--app-border);

          border-radius:
            10px;

          background:
            var(--app-card-2);

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        .decision-strip strong {
          display:
            block;

          color:
            var(--app-text);

          font-size:
            12px;
        }


        .decision-strip span {
          display:
            block;

          margin-top:
            6px;

          color:
            var(--app-secondary-text);

          font-size:
            10px;

          line-height:
            1.45;
        }


        /* =========================
           EMPTY STATE
        ========================= */

        .communities-empty {
          padding:
            52px;

          border:
            1px dashed
            var(--app-border);

          border-radius:
            16px;

          color:
            var(--app-secondary-text);

          background:
            var(--app-card);

          text-align:
            center;

          font-size:
            13px;

          transition:
            background 0.25s ease,
            border-color 0.25s ease;
        }


        /* =========================
           TABLET
        ========================= */

        @media (max-width: 1000px) {

          .community-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .decision-strip {
            grid-template-columns:
              1fr 1fr;
          }

          .create-fields {
            grid-template-columns:
              1fr 1fr;
          }

          .create-fields button {
            grid-column:
              span 2;

            width:
              100%;
          }
        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {

          .communities-page {
            padding:
              4px 0 30px;
          }


          .communities-hero {
            padding:
              24px 19px 22px;

            border-radius:
              15px;
          }


          .communities-hero h2 {
            margin-top:
              20px;

            font-size:
              30px;

            letter-spacing:
              -.8px;
          }


          .communities-hero p {
            font-size:
              13px;
          }


          .community-create {
            margin-top:
              22px;

            padding:
              16px;
          }


          .create-fields {
            grid-template-columns:
              1fr;
          }


          .create-fields button {
            grid-column:
              auto;

            width:
              100%;
          }


          .community-grid,
          .decision-strip {
            grid-template-columns:
              1fr;
          }


          .community-section-head {
            margin-top:
              22px;
          }


          .community-card {
            padding:
              18px;
          }


          .community-actions {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .community-buttons {
            width:
              100%;
          }


          .community-buttons button {
            flex:
              1;
          }


          .detail-top {
            flex-direction:
              column;
          }
        }

      `}</style>


        <div className="communities-page">


          {/* =========================
            HERO
        ========================= */}

          <section className="communities-hero">

            {/* HERO CONTENT */}

            <div className="communities-hero-content">

            <span className="communities-kicker">
              Build your community
            </span>


              <h2>
                Create a space where ideas come
                together.
              </h2>


              <p>
                Start your own community, bring
                people together around a shared
                topic, and make better decisions
                through collaboration.
              </p>

            </div>


            {/* =========================
              CREATE COMMUNITY
          ========================= */}

            <form
                className="community-create"
                onSubmit={create}
            >

              <label>
                Start a new community
              </label>


              <span className="community-create-subtitle">
              Give your community a name and
              describe what members can discuss
              or decide together.
            </span>


              <div className="create-fields">

                <input
                    value={
                      form.communityName
                    }
                    onChange={(event) =>
                        setForm({
                          ...form,
                          communityName:
                          event.target.value,
                        })
                    }
                    placeholder="Community name"
                    maxLength="100"
                />


                <input
                    value={
                      form.description
                    }
                    onChange={(event) =>
                        setForm({
                          ...form,
                          description:
                          event.target.value,
                        })
                    }
                    placeholder="What is this community about?"
                    maxLength="500"
                />


                <button type="submit">
                  Create Community
                </button>

              </div>

            </form>

          </section>


          {/* =========================
            SECTION HEADER
        ========================= */}

          <div className="community-section-head">

            <h3>
              Explore communities
            </h3>


            <span>
            {loading
                ? "Loading…"
                : communities.length +
                " available"}
          </span>

          </div>


          {/* =========================
            LOADING
        ========================= */}

          {loading && (
              <div className="communities-empty">
                Loading communities…
              </div>
          )}


          {/* =========================
            EMPTY
        ========================= */}

          {!loading &&
              communities.length === 0 && (

                  <div className="communities-empty">
                    No communities yet.
                    <br />
                    Be the first to create one.
                  </div>

              )}


          {/* =========================
            COMMUNITY CARDS
        ========================= */}

          {!loading &&
              communities.length > 0 && (

                  <div className="community-grid">

                    {communities.map(
                        (community) => (

                            <article
                                className="community-card"
                                key={community.id}
                            >

                              {/* CARD TOP */}

                              <div className="community-card-top">

                      <span className="community-mark">
                        DH
                      </span>


                                <span
                                    className={
                                        "community-state " +
                                        (
                                            community.joined
                                                ? "joined"
                                                : "open"
                                        )
                                    }
                                >
                        {community.joined
                            ? "Joined"
                            : "Open"}
                      </span>

                              </div>


                              {/* TITLE */}

                              <h3>
                                {
                                  community.communityName
                                }
                              </h3>


                              {/* DESCRIPTION */}

                              <p>
                                {
                                    community.description ||
                                    "A space to share ideas and make decisions together."
                                }
                              </p>


                              {/* OWNER */}

                              <span className="community-owner">
                      Created by{" "}
                                {
                                    community.ownerName ||
                                    "Community owner"
                                }
                    </span>


                              {/* ACTIONS */}

                              <div className="community-actions">

                      <span className="member-count">

                        {
                            community.memberCount ||
                            0
                        }{" "}

                        members

                      </span>


                                <div className="community-buttons">

                                  <button
                                      type="button"
                                      className="view-community"
                                      onClick={() =>
                                          viewCommunity(
                                              community
                                          )
                                      }
                                  >
                                    View
                                  </button>


                                  <button
                                      type="button"
                                      className={
                                        community.joined
                                            ? "leave-community"
                                            : "join-community"
                                      }
                                      onClick={() =>
                                          membership(
                                              community
                                          )
                                      }
                                  >
                                    {community.joined
                                        ? "Leave"
                                        : "Join"}
                                  </button>


                                  {community.owner && (

                                      <button
                                          type="button"
                                          className="leave-community"
                                          onClick={() =>
                                              askDeleteCommunity(
                                                  community
                                              )
                                          }
                                      >
                                        Delete
                                      </button>

                                  )}

                                </div>

                              </div>

                            </article>

                        )
                    )}

                  </div>

              )}


          {/* =========================
            COMMUNITY DETAIL
        ========================= */}

          {opened && (

              <section className="community-detail">

                <div className="detail-top">

                  <div>

                    <h3>
                      {
                        opened.communityName
                      }
                    </h3>


                    <p>

                      Members:{" "}

                      {
                          opened.memberNames?.join(
                              ", "
                          ) ||
                          "No members yet"
                      }

                    </p>

                  </div>


                  <button
                      type="button"
                      className="close-detail"
                      onClick={() =>
                          setOpened(null)
                      }
                  >
                    Close panel
                  </button>

                </div>


                <div className="decision-strip">

                  {communityDecisions.length ? (

                      communityDecisions.map(
                          (decision) => (

                              <div
                                  key={decision.id}
                              >

                                <strong>
                                  {
                                    decision.title
                                  }
                                </strong>


                                <span>
                        {
                          decision.description
                        }
                      </span>

                              </div>

                          )
                      )

                  ) : (

                      <div>

                        <strong>
                          No decisions yet
                        </strong>


                        <span>
                    Community members can
                    create a decision from
                    the Create Decision page.
                  </span>

                      </div>

                  )}

                </div>

              </section>

          )}

        </div>

      </DashboardLayout>
  );
}

export default Communities;