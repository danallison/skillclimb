import { useState, useEffect } from "react";
import { useCreateUser, useCreateSession, useSession, useStartPlacement, useProgress } from "./api/hooks.js";
import { useSessionStore } from "./store/sessionStore.js";
import { usePlacementStore } from "./store/placementStore.js";
import { colors } from "./styles/theme.js";
import SessionView from "./components/SessionView.js";
import ProgressView from "./components/ProgressView.js";
import PlacementView from "./components/PlacementView.js";

type View = "login" | "progress" | "session" | "placement";

function getInitialView(userId: string | null): View {
  if (!userId) return "login";
  const sessionId = localStorage.getItem("cyberclimb_sessionId");
  if (sessionId) return "session";
  return "progress";
}

export default function App() {
  const { userId, session, setUserId, setSession, resumeSession, reset } = useSessionStore();
  const placementStore = usePlacementStore();
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>(() => getInitialView(userId));
  const createUser = useCreateUser();
  const createSession = useCreateSession();
  const startPlacement = useStartPlacement();

  // Check if user has learner nodes (to decide placement vs progress)
  const { data: progressData } = useProgress(
    view === "progress" && userId ? userId : null,
  );

  // Restore in-progress session from localStorage
  const savedSessionId = view === "session" && !session
    ? localStorage.getItem("cyberclimb_sessionId")
    : null;
  const { data: restoredSession } = useSession(savedSessionId);

  useEffect(() => {
    if (restoredSession && !session) {
      const savedIndex = parseInt(localStorage.getItem("cyberclimb_itemIndex") ?? "0", 10);
      resumeSession(restoredSession, savedIndex);
    }
  }, [restoredSession, session, resumeSession]);

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
  if (view === "session" && !session && savedSessionId) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Resuming session...</div>;
  }

  // If we have a userId but no session, show progress (e.g. after session ends)
  if (view === "session" && !session && userId) {
    setView("progress");
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

  // Progress view (after login or after session)
  if (view === "progress" && userId) {
    return (
      <ProgressView
        userId={userId}
        onStartSession={handleStartSession}
        onStartPlacement={handleStartPlacement}
        onBack={() => {
          localStorage.removeItem("cyberclimb_userId");
          reset();
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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>CyberClimb</h1>
      <p style={{ color: colors.textMuted, marginBottom: "2.5rem", fontSize: "1.1rem" }}>
        Test-driven cybersecurity learning
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
