import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// Types matching backend responses
export interface SessionResponse {
  id: string;
  userId: string;
  startedAt: string;
  totalItems: number;
  items: SessionItemResponse[];
}

export interface SessionItemResponse {
  node: {
    id: string;
    topicId: string;
    domainId: string;
    concept: string;
    questionTemplates: Array<{
      type: string;
      prompt: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  };
  learnerState: {
    easiness: number;
    interval: number;
    repetitions: number;
  };
  questionTemplate: {
    type: string;
    prompt: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
  };
  priority: number;
}

export interface ReviewResponse {
  wasCorrect: boolean;
  calibrationQuadrant: string;
  nextState: {
    easiness: number;
    interval: number;
    repetitions: number;
  };
}

export interface DomainResponse {
  id: string;
  tier: number;
  name: string;
  description: string;
  displayOrder: number;
}

export interface UserResponse {
  id: string;
  email: string;
}

export interface TopicProgressResponse {
  topicId: string;
  domainId: string;
  name: string;
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
}

export interface DomainProgressResponse {
  domainId: string;
  name: string;
  description: string;
  tier: number;
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
  hasContent: boolean;
  topics: TopicProgressResponse[];
}

export interface ProgressResponse {
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
  nextSession: {
    dueNow: number;
    nextDueDate: string | null;
    dueTodayRemaining: number;
    dueWithinWeek: number;
  };
  domains: DomainProgressResponse[];
}

// Hooks

export function useCreateUser() {
  return useMutation({
    mutationFn: (email: string) =>
      fetchJson<UserResponse>("/users", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchJson<DomainResponse[]>("/domains"),
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJson<SessionResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
  });
}

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchJson<SessionResponse>(`/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useProgress(userId: string | null) {
  return useQuery({
    queryKey: ["progress", userId],
    queryFn: () => fetchJson<ProgressResponse>(`/users/${userId}/progress`),
    enabled: !!userId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userId: string;
      nodeId: string;
      score: number;
      confidence: number;
      response: string;
    }) =>
      fetchJson<ReviewResponse>("/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
