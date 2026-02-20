import { useSessionStore } from "../store/sessionStore.js";
import { colors, buttonStyles } from "../styles/theme.js";

export default function MicroLessonDisplay() {
  const { lessonContent, dismissLesson } = useSessionStore();

  if (!lessonContent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0", color: colors.textMuted }}>
        <div style={{ marginBottom: "0.5rem" }}>Preparing a lesson for you...</div>
        <div style={{ fontSize: "0.8rem" }}>This concept needs a quick review</div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: "1.25rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          background: colors.cardBg,
          border: `2px solid ${colors.cyan}`,
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            color: colors.cyan,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
          }}
        >
          Micro-Lesson
        </div>
        <h3 style={{ color: colors.textPrimary, marginBottom: "1rem", marginTop: 0 }}>
          {lessonContent.title}
        </h3>
        <div
          style={{
            color: colors.textPrimary,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {lessonContent.content}
        </div>
      </div>

      {lessonContent.keyTakeaways.length > 0 && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            background: colors.successBg,
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: colors.successText,
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Key Takeaways
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: colors.textPrimary }}>
            {lessonContent.keyTakeaways.map((point, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={dismissLesson} style={buttonStyles.primary}>
        Continue
      </button>
    </div>
  );
}
