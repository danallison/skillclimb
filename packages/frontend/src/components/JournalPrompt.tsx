import { colors } from "../styles/theme.js";
import JournalEntryForm from "./JournalEntryForm.js";

interface Props {
  skilltreeId: string;
  sessionId: string;
  onDone: () => void;
}

export default function JournalPrompt({ skilltreeId, sessionId, onDone }: Props) {
  return (
    <div>
      <h1>Take a moment to reflect</h1>
      <p style={{ color: colors.textMuted, marginBottom: "1.5rem" }}>
        Writing about what you learned strengthens memory and deepens understanding.
      </p>
      <JournalEntryForm
        skilltreeId={skilltreeId}
        sessionId={sessionId}
        onSaved={onDone}
        onSkip={onDone}
      />
    </div>
  );
}
