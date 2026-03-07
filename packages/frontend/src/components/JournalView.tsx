import { useState } from "react";
import { useJournalEntries, useDeleteJournalEntry } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";
import JournalEntryForm from "./JournalEntryForm.js";

interface Props {
  skilltreeId: string;
  onBack: () => void;
}

export default function JournalView({ skilltreeId, onBack }: Props) {
  const [showForm, setShowForm] = useState(false);
  const { data: entries, isLoading, error } = useJournalEntries(skilltreeId);
  const deleteEntry = useDeleteJournalEntry();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ marginBottom: 0 }}>Journal</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ ...buttonStyles.primary, width: "auto", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              New Entry
            </button>
          )}
          <button
            onClick={onBack}
            style={{ ...buttonStyles.secondary, padding: "0.5rem 1rem" }}
          >
            Back
          </button>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <JournalEntryForm
            skilltreeId={skilltreeId}
            onSaved={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", padding: "2rem", color: colors.textMuted }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "2rem", color: colors.red }}>
          Failed to load journal entries
        </div>
      )}

      {entries && entries.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
          No journal entries yet. Tap "New Entry" to start reflecting.
        </div>
      )}

      {entries?.map((entry) => (
        <div
          key={entry.id}
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: colors.textDim }}>
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {confirmDeleteId === entry.id ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={async () => {
                    await deleteEntry.mutateAsync({ skilltreeId, entryId: entry.id });
                    setConfirmDeleteId(null);
                  }}
                  style={{
                    background: colors.red,
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  style={{
                    ...buttonStyles.secondary,
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(entry.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.textDim,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>

          {entry.feeling && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.75rem", color: colors.textDim, marginBottom: "0.2rem" }}>
                Feeling
              </div>
              <div style={{ fontSize: "0.9rem", color: colors.textPrimary, whiteSpace: "pre-wrap" }}>
                {entry.feeling}
              </div>
            </div>
          )}

          {entry.reflection && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.75rem", color: colors.textDim, marginBottom: "0.2rem" }}>
                Reflection
              </div>
              <div style={{ fontSize: "0.9rem", color: colors.textPrimary, whiteSpace: "pre-wrap" }}>
                {entry.reflection}
              </div>
            </div>
          )}

          {entry.connection && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.75rem", color: colors.textDim, marginBottom: "0.2rem" }}>
                Connection
              </div>
              <div style={{ fontSize: "0.9rem", color: colors.textPrimary, whiteSpace: "pre-wrap" }}>
                {entry.connection}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
