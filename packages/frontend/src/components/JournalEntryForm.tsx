import { useState } from "react";
import { useCreateJournalEntry } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  skilltreeId: string;
  sessionId?: string;
  onSaved: () => void;
  onSkip?: () => void;
}

export default function JournalEntryForm({ skilltreeId, sessionId, onSaved, onSkip }: Props) {
  const [connection, setConnection] = useState("");
  const [feeling, setFeeling] = useState("");
  const [reflection, setReflection] = useState("");
  const createEntry = useCreateJournalEntry();

  const hasContent =
    connection.trim().length > 0 ||
    feeling.trim().length > 0 ||
    reflection.trim().length > 0;

  const handleSave = async () => {
    if (!hasContent) return;
    try {
      await createEntry.mutateAsync({
        skilltreeId,
        connection: connection.trim() || undefined,
        feeling: feeling.trim() || undefined,
        reflection: reflection.trim() || undefined,
        sessionId,
      });
      onSaved();
    } catch (err) {
      console.error("Failed to save journal entry:", err);
    }
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "80px",
    padding: "0.75rem",
    borderRadius: "8px",
    border: `1px solid ${colors.inputBorder}`,
    background: colors.surfaceBg,
    color: colors.textPrimary,
    fontSize: "0.9rem",
    resize: "vertical" as const,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginBottom: "0.4rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label style={labelStyle}>
          How are you feeling about your learning right now?
        </label>
        <textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          style={textareaStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          What do you understand well? What's still confusing?
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          style={textareaStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          How does what you have learned connect to your life, work, or interests?
        </label>
        <textarea
          value={connection}
          onChange={(e) => setConnection(e.target.value)}
          style={textareaStyle}
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={handleSave}
          disabled={!hasContent || createEntry.isPending}
          style={{
            ...buttonStyles.primary,
            width: "auto",
            padding: "0.6rem 1.5rem",
            opacity: hasContent ? 1 : 0.5,
            cursor: hasContent ? "pointer" : "not-allowed",
          }}
        >
          {createEntry.isPending ? "Saving..." : "Save Entry"}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              ...buttonStyles.secondary,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
