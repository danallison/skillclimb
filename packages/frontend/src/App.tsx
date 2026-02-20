import { useState, useEffect } from "react";
import { useCreateUser, useCreateSession, useSession, useStartPlacement, useProgress, useSkillTrees } from "./api/hooks.js";
import { useSessionStore } from "./store/sessionStore.js";
import { usePlacementStore } from "./store/placementStore.js";
import { colors, buttonStyles } from "./styles/theme.js";
import SessionView from "./components/SessionView.js";
import ProgressView from "./components/ProgressView.js";
import PlacementView from "./components/PlacementView.js";

type View = "login" | "skillTreeSelect" | "progress" | "session" | "placement";

function getInitialView(userId: string | null, savedSessionId: string | null, selectedSkillTreeId: string | null): View {
  if (!userId) return "login";
  if (savedSessionId) return "session";
  if (!selectedSkillTreeId) return "skillTreeSelect";
  return "progress";
}

export default function App() {
  const { userId, selectedSkillTreeId, savedSessionId, savedItemIndex, session, setUserId, setSelectedSkillTreeId, setSession, resumeSession, reset: resetSession, logout } = useSessionStore();
  const placementStore = usePlacementStore();
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>(() => getInitialView(userId, savedSessionId, selectedSkillTreeId));
  const createUser = useCreateUser();
  const createSession = useCreateSession();
  const startPlacement = useStartPlacement();
  const { data: skillTreesData } = useSkillTrees();

  // Pre-fetch progress data so it's cached when ProgressView mounts
  useProgress(view === "progress" && userId ? userId : null, selectedSkillTreeId);

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
      // If skill tree already selected (from localStorage), go to progress; otherwise pick skill tree
      if (selectedSkillTreeId) {
        setView("progress");
      } else {
        setView("skillTreeSelect");
      }
    } catch (err) {
      console.error("Failed to log in:", err);
    }
  };

  const handleSelectSkillTree = (skilltreeId: string) => {
    setSelectedSkillTreeId(skilltreeId);
    setView("progress");
  };

  const handleStartSession = async () => {
    if (!userId) return;
    try {
      const sess = await createSession.mutateAsync({ userId, skilltreeId: selectedSkillTreeId ?? undefined });
      setSession(sess);
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleStartPlacement = async () => {
    if (!userId) return;
    try {
      const result = await startPlacement.mutateAsync({ userId, skilltreeId: selectedSkillTreeId ?? undefined });
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

  // If we're in session view but have no session to show, fall back to progress
  useEffect(() => {
    if (view === "session" && !session && userId && !sessionIdToRestore) {
      setView("progress");
    }
  }, [view, session, userId, sessionIdToRestore]);

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
          onClick={() => { logout(); setView("login"); }}
          style={{ ...buttonStyles.secondary, marginTop: "2rem", padding: "0.4rem 0.8rem" }}
        >
          Back
        </button>
      </div>
    );
  }

  // Progress view (after login or after session)
  if (view === "progress" && userId) {
    const hasMultipleSkillTrees = (skillTreesData?.length ?? 0) > 1;
    return (
      <ProgressView
        userId={userId}
        skilltreeId={selectedSkillTreeId ?? undefined}
        onStartSession={handleStartSession}
        onStartPlacement={handleStartPlacement}
        onChangeSkillTree={hasMultipleSkillTrees ? () => {
          setSelectedSkillTreeId(null);
          setView("skillTreeSelect");
        } : undefined}
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
