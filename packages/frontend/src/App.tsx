import { useState, useEffect } from "react";
import { useCreateUser, useCreateSession, useSession, useStartPlacement, useProgress } from "./api/hooks.js";
import { useSessionStore } from "./store/sessionStore.js";
import { usePlacementStore } from "./store/placementStore.js";
import { colors } from "./styles/theme.js";
import SessionView from "./components/SessionView.js";
import ProgressView from "./components/ProgressView.js";
import PlacementView from "./components/PlacementView.js";

type View = "login" | "progress" | "session" | "placement";

function getInitialView(userId: string | null, savedSessionId: string | null): View {
  if (!userId) return "login";
  if (savedSessionId) return "session";
  return "progress";
}

export default function App() {
  const { userId, savedSessionId, savedItemIndex, session, setUserId, setSession, resumeSession, logout } = useSessionStore();
  const placementStore = usePlacementStore();
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>(() => getInitialView(userId, savedSessionId));
  const createUser = useCreateUser();
  const createSession = useCreateSession();
  const startPlacement = useStartPlacement();

  // Pre-fetch progress data so it's cached when ProgressView mounts
  useProgress(view === "progress" && userId ? userId : null);

  // Restore in-progress session from store's saved state
  const sessionIdToRestore = view === "session" && !session ? savedSessionId : null;
  const { data: restoredSession } = useSession(sessionIdToRestore);

  useEffect(() => {
    if (restoredSession && !session) {
      resumeSession(restoredSession, savedItemIndex);
    }
  }, [restoredSession, session, resumeSession, savedItemIndex]);

  const handleLogin = async () => {
    try {
      const user = await createUser.mutateAsync(email);
      setUserId(user.id);
      setView("progress");
    } catch (err) {
      console.error("Failed to log in:", err);
    }
  };

  const handleStartSession = async () => {
    if (!userId) return;
    try {
      const sess = await createSession.mutateAsync(userId);
      setSession(sess);
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleStartPlacement = async () => {
    if (!userId) return;
    try {
      const result = await startPlacement.mutateAsync(userId);
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

  // Active session
  if (view === "session" && session) {
    return <SessionView onFinished={() => setView("progress")} />;
  }

  // Session view but still loading from API — show loading state
  if (view === "session" && !session && sessionIdToRestore) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Resuming session...</div>;
  }

  // If we have a userId but no session, fall through to progress
  useEffect(() => {
    if (view === "session" && !session && userId && !sessionIdToRestore) {
      setView("progress");
    }
  }, [view, session, userId, sessionIdToRestore]);

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

  // Progress view (after login or after session)
  if (view === "progress" && userId) {
    return (
      <ProgressView
        userId={userId}
        onStartSession={handleStartSession}
        onStartPlacement={handleStartPlacement}
        onBack={() => {
          logout();
          setView("login");
        }}
      />
    );
  }

  // Landing / login
  const isLoading = createUser.isPending;
  const error = createUser.error;

  return (
    <div style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>SkillClimb</h1>
      <p style={{ color: colors.textMuted, marginBottom: "2.5rem", fontSize: "1.1rem" }}>
        Test-driven learning with spaced repetition
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && email && handleLogin()}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            border: `2px solid ${colors.inputBorder}`,
            background: colors.cardBg,
            color: colors.textPrimary,
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading || !email}
        style={{
          padding: "0.8rem 2.5rem",
          background: isLoading ? "#444" : colors.cyan,
          color: colors.cyanDark,
          fontWeight: 600,
          fontSize: "1.1rem",
          borderRadius: "8px",
        }}
      >
        {isLoading ? "Loading..." : "Continue"}
      </button>

      {error && (
        <p style={{ color: colors.red, marginTop: "1rem" }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
