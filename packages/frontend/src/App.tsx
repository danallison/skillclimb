import { useState, useEffect } from "react";
import { useCurrentUser, useDevLogin, useLogout, useCreateSession, useSession, useStartPlacement, useProgress, useSkillTrees } from "./api/hooks.js";
import { useSessionStore } from "./store/sessionStore.js";
import { usePlacementStore } from "./store/placementStore.js";
import { colors, buttonStyles } from "./styles/theme.js";
import SessionView from "./components/SessionView.js";
import ProgressView from "./components/ProgressView.js";
import PlacementView from "./components/PlacementView.js";

type View = "loading" | "login" | "skillTreeSelect" | "progress" | "session" | "placement";

export default function App() {
  const { userId, selectedSkillTreeId, savedSessionId, savedItemIndex, session, setUserId, setSelectedSkillTreeId, setSession, resumeSession, reset: resetSession, logout: storeLogout } = useSessionStore();
  const placementStore = usePlacementStore();
  const { data: currentUser, isLoading: authLoading, error: authError } = useCurrentUser();
  const devLogin = useDevLogin();
  const logoutMutation = useLogout();
  const createSession = useCreateSession();
  const startPlacement = useStartPlacement();
  const { data: skillTreesData } = useSkillTrees();
  const [email, setEmail] = useState("");

  // Sync auth state to store
  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.id);
    } else if (!authLoading) {
      setUserId(null);
    }
  }, [currentUser, authLoading, setUserId]);

  const isAuthenticated = !!currentUser && !authError;

  const [view, setView] = useState<View>("loading");

  // Update view when auth state changes
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setView("login");
    } else if (view === "login" || view === "loading") {
      if (savedSessionId && !session) {
        setView("session");
      } else if (!selectedSkillTreeId) {
        setView("skillTreeSelect");
      } else {
        setView("progress");
      }
    }
  }, [authLoading, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fetch progress data so it's cached when ProgressView mounts
  useProgress(view === "progress" ? selectedSkillTreeId : undefined);

  // Restore in-progress session from store's saved state
  const sessionIdToRestore = view === "session" && !session ? savedSessionId : null;
  const { data: restoredSession } = useSession(sessionIdToRestore);

  useEffect(() => {
    if (restoredSession && !session) {
      resumeSession(restoredSession, savedItemIndex);
    }
  }, [restoredSession, session, resumeSession, savedItemIndex]);

  const handleSelectSkillTree = (skilltreeId: string) => {
    setSelectedSkillTreeId(skilltreeId);
    setView("progress");
  };

  const handleStartSession = async () => {
    if (!userId) return;
    try {
      const sess = await createSession.mutateAsync({ skilltreeId: selectedSkillTreeId ?? undefined });
      setSession(sess);
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleStartPlacement = async () => {
    if (!userId) return;
    try {
      const result = await startPlacement.mutateAsync({ skilltreeId: selectedSkillTreeId ?? undefined });
      placementStore.startPlacement(
        result.placementId,
        result.question,
        result.estimatedTotal,
      );
      setView("placement");
    } catch (err) {
      console.error("Failed to start placement:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Clear local state even if server call fails
    }
    storeLogout();
    setView("login");
  };

  // If we're in session view but have no session to show, fall back to progress
  useEffect(() => {
    if (view === "session" && !session && userId && !sessionIdToRestore) {
      setView("progress");
    }
  }, [view, session, userId, sessionIdToRestore]);

  // Loading state
  if (view === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
        Loading...
      </div>
    );
  }

  // Active session
  if (view === "session" && session) {
    return <SessionView onFinished={() => { resetSession(); setView("progress"); }} />;
  }

  // Session view but still loading from API — show loading state
  if (view === "session" && !session && sessionIdToRestore) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Resuming session...</div>;
  }

  // Placement test
  if (view === "placement") {
    return (
      <PlacementView
        onComplete={() => {
          placementStore.reset();
          setView("progress");
        }}
        onSkip={() => {
          placementStore.reset();
          setView("progress");
        }}
      />
    );
  }

  // Skill tree selection
  if (view === "skillTreeSelect" && userId) {
    const skillTrees = skillTreesData ?? [];
    // Auto-select if only one skill tree
    if (skillTrees.length === 1 && !selectedSkillTreeId) {
      handleSelectSkillTree(skillTrees[0].id);
    }
    return (
      <div style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Choose a Skill Tree</h1>
        <p style={{ color: colors.textMuted, marginBottom: "2rem", fontSize: "1rem" }}>
          Select a skill tree to study
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto" }}>
          {skillTrees.map((st) => (
            <button
              key={st.id}
              onClick={() => handleSelectSkillTree(st.id)}
              style={{
                padding: "1.25rem",
                background: colors.cardBg,
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "12px",
                color: colors.textPrimary,
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {st.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          style={{ ...buttonStyles.secondary, marginTop: "2rem", padding: "0.4rem 0.8rem" }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Progress view (after login or after session)
  if (view === "progress" && userId) {
    const hasMultipleSkillTrees = (skillTreesData?.length ?? 0) > 1;
    return (
      <ProgressView
        skilltreeId={selectedSkillTreeId ?? undefined}
        onStartSession={handleStartSession}
        onStartPlacement={handleStartPlacement}
        onChangeSkillTree={hasMultipleSkillTrees ? () => {
          setSelectedSkillTreeId(null);
          setView("skillTreeSelect");
        } : undefined}
        onBack={handleLogout}
      />
    );
  }

  // Landing / login
  const isDev = import.meta.env.DEV;
  const handleDevLogin = async () => {
    try {
      await devLogin.mutateAsync(email);
    } catch (err) {
      console.error("Dev login failed:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>SkillClimb</h1>
      <p style={{ color: colors.textMuted, marginBottom: "2.5rem", fontSize: "1.1rem" }}>
        Test-driven learning with spaced repetition
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        {isDev && (
          <>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && email && handleDevLogin()}
                style={{
                  flex: 1,
                  padding: "0.8rem 1rem",
                  borderRadius: "8px",
                  border: `2px solid ${colors.inputBorder}`,
                  background: colors.cardBg,
                  color: colors.textPrimary,
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
              <button
                onClick={handleDevLogin}
                disabled={devLogin.isPending || !email}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: devLogin.isPending ? "#444" : colors.cyan,
                  color: colors.cyanDark,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {devLogin.isPending ? "..." : "Dev Login"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: colors.textDim, fontSize: "0.85rem" }}>
              <div style={{ flex: 1, height: "1px", background: colors.divider }} />
              or
              <div style={{ flex: 1, height: "1px", background: colors.divider }} />
            </div>
          </>
        )}

        <a
          href="/api/auth/login/google"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.8rem 1.5rem",
            background: "#fff",
            color: "#333",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
            textDecoration: "none",
            border: "1px solid #ddd",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </a>

        <a
          href="/api/auth/login/github"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.8rem 1.5rem",
            background: "#24292e",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
            textDecoration: "none",
            border: "1px solid #444",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="#fff">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Sign in with GitHub
        </a>
      </div>
    </div>
  );
}
