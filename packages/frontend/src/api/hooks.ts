import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QuestionTemplate } from "@skillclimb/core";

const API_BASE = "/api";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) return refreshPromise!;
  isRefreshing = true;
  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const opts: RequestInit = {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  };

  let res = await fetch(`${API_BASE}${url}`, opts);

  // On 401, try refreshing the token once
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await fetch(`${API_BASE}${url}`, opts);
    }
  }

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

export interface QuestionTemplateResponse {
  type: QuestionTemplate["type"];
  prompt: string;
  choices?: string[];
  correctAnswer: string;
  explanation: string;
  acceptableAnswers?: string[];
  hints?: string[];
  rubric?: string;
  keyPoints?: string[];
}

export interface SessionItemResponse {
  node: {
    id: string;
    topicId: string;
    domainId: string;
    concept: string;
    questionTemplates: QuestionTemplateResponse[];
  };
  learnerState: {
    easiness: number;
    interval: number;
    repetitions: number;
    misconceptions?: string[];
  };
  questionTemplate: QuestionTemplateResponse;
  priority: number;
  needsLesson?: boolean;
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
  skilltreeId: string;
  tier: number;
  name: string;
  description: string;
  displayOrder: number;
}

export interface SkillTreeResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
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
  prerequisites: string[];
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
  hasContent: boolean;
  freshness?: number;
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

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<UserResponse>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDevLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      fetchJson<{ ok: boolean }>("/auth/dev", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSkillTrees() {
  return useQuery({
    queryKey: ["skilltrees"],
    queryFn: () => fetchJson<SkillTreeResponse[]>("/skilltrees"),
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
    mutationFn: ({ skilltreeId }: { skilltreeId?: string }) =>
      fetchJson<SessionResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify({ skilltreeId }),
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

export function useProgress(skilltreeId?: string | null) {
  const params = skilltreeId ? `?skilltreeId=${skilltreeId}` : "";
  return useQuery({
    queryKey: ["progress", skilltreeId],
    queryFn: () => fetchJson<ProgressResponse>(`/users/me/progress${params}`),
  });
}

// === Placement Test ===

export interface PlacementQuestion {
  nodeId: string;
  domainId: string;
  concept: string;
  questionTemplate: {
    type: QuestionTemplate["type"];
    prompt: string;
    choices?: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface PlacementStartResponse {
  placementId: string;
  question: PlacementQuestion;
  questionsAnswered: number;
  estimatedTotal: number;
  theta: number;
  standardError: number;
}

export interface PlacementAnswerResponse {
  correct: boolean;
  explanation: string;
  done: boolean;
  question?: PlacementQuestion;
  questionsAnswered: number;
  estimatedTotal: number;
  theta: number;
  standardError: number;
  result?: {
    globalTheta: number;
    domainThetas: Record<string, number>;
    domainNames?: Record<string, string>;
    classifications: {
      mastered: number;
      partial: number;
      weak: number;
      unknown: number;
    };
  };
}

export interface CalibrationResponse {
  overallScore: number;
  quadrantCounts: Record<string, number>;
  quadrantPercentages: Record<string, number>;
  domainBreakdown: Array<{
    domainId: string;
    domainName: string;
    score: number;
    quadrantCounts: Record<string, number>;
    entryCount: number;
  }>;
  trend: Array<{
    periodStart: string;
    periodEnd: string;
    score: number;
    entryCount: number;
  }>;
  insights: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  totalEntries: number;
}

export function useStartPlacement() {
  return useMutation({
    mutationFn: ({ skilltreeId }: { skilltreeId?: string }) =>
      fetchJson<PlacementStartResponse>("/placement", {
        method: "POST",
        body: JSON.stringify({ skilltreeId }),
      }),
  });
}

export function useSubmitPlacementAnswer() {
  return useMutation({
    mutationFn: (data: {
      placementId: string;
      nodeId: string;
      selectedAnswer: string | null;
      confidence: number;
    }) =>
      fetchJson<PlacementAnswerResponse>(`/placement/${data.placementId}/answer`, {
        method: "POST",
        body: JSON.stringify({
          nodeId: data.nodeId,
          selectedAnswer: data.selectedAnswer,
          confidence: data.confidence,
        }),
      }),
  });
}

export function usePlacement(placementId: string | null) {
  return useQuery({
    queryKey: ["placement", placementId],
    queryFn: () => fetchJson<any>(`/placement/${placementId}`),
    enabled: !!placementId,
  });
}

export function useCalibration(skilltreeId?: string | null) {
  const params = skilltreeId ? `?skilltreeId=${skilltreeId}` : "";
  return useQuery({
    queryKey: ["calibration", skilltreeId],
    queryFn: () => fetchJson<CalibrationResponse>(`/users/me/calibration${params}`),
  });
}

export interface HintResponse {
  hint: string;
  source: "static" | "ai" | "generic";
}

export interface AIFeedbackResponse {
  score: number;
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  misconceptions: string[];
}

export function useEvaluateAnswer() {
  return useMutation({
    mutationFn: (data: { nodeId: string; response: string }) =>
      fetchJson<AIFeedbackResponse | null>("/reviews/evaluate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useRequestHint() {
  return useMutation({
    mutationFn: (data: { nodeId: string; questionType?: string }) =>
      fetchJson<HintResponse>("/hints", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export interface MicroLessonResponse {
  title: string;
  content: string;
  keyTakeaways: string[];
  source: "static" | "ai" | "fallback";
}

export function useRequestMicroLesson() {
  return useMutation({
    mutationFn: (data: { nodeId: string }) =>
      fetchJson<MicroLessonResponse>("/lessons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      nodeId: string;
      score: number;
      confidence: number;
      response: string;
      misconceptions?: string[];
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
