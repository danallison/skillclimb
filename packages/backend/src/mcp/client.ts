export class SkillClimbClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    // Remove trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      let message: string;
      try {
        const json = JSON.parse(text);
        message = json.error ?? text;
      } catch {
        message = text;
      }
      throw new Error(`HTTP ${res.status}: ${message}`);
    }

    return res.json() as Promise<T>;
  }

  private get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  private post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  // ─── Sessions ─────────────────────────────────────────────────────

  createSession(skilltreeId?: string): Promise<unknown> {
    return this.post("/api/sessions", { skilltreeId });
  }

  getSession(sessionId: string): Promise<unknown> {
    return this.get(`/api/sessions/${sessionId}`);
  }

  // ─── Reviews ──────────────────────────────────────────────────────

  submitReview(body: {
    nodeId: string;
    score: number;
    confidence: number;
    response?: string;
    misconceptions?: string[];
  }): Promise<unknown> {
    return this.post("/api/reviews", body);
  }

  evaluateFreeRecall(body: {
    nodeId: string;
    response: string;
  }): Promise<unknown> {
    return this.post("/api/reviews/evaluate", body);
  }

  // ─── Placement ────────────────────────────────────────────────────

  startPlacement(skilltreeId?: string): Promise<unknown> {
    return this.post("/api/placement", { skilltreeId });
  }

  submitPlacementAnswer(
    placementId: string,
    body: {
      nodeId: string;
      selectedAnswer: string | null;
      confidence?: number;
    },
  ): Promise<unknown> {
    return this.post(`/api/placement/${placementId}/answer`, body);
  }

  abandonPlacement(placementId: string): Promise<unknown> {
    return this.post(`/api/placement/${placementId}/abandon`);
  }

  // ─── Content ──────────────────────────────────────────────────────

  listSkilltrees(): Promise<unknown> {
    return this.get("/api/skilltrees");
  }

  listDomains(skilltreeId?: string): Promise<unknown> {
    const qs = skilltreeId
      ? `?skilltreeId=${encodeURIComponent(skilltreeId)}`
      : "";
    return this.get(`/api/domains${qs}`);
  }

  getDomainProgress(domainId: string): Promise<unknown> {
    return this.get(`/api/domains/${domainId}/progress`);
  }

  // ─── User ─────────────────────────────────────────────────────────

  getUserProgress(skilltreeId?: string): Promise<unknown> {
    const qs = skilltreeId
      ? `?skilltreeId=${encodeURIComponent(skilltreeId)}`
      : "";
    return this.get(`/api/users/me/progress${qs}`);
  }

  getUserProfile(skilltreeId?: string): Promise<unknown> {
    const qs = skilltreeId
      ? `?skilltreeId=${encodeURIComponent(skilltreeId)}`
      : "";
    return this.get(`/api/users/me/profile${qs}`);
  }

  getDueItems(): Promise<unknown> {
    return this.get("/api/users/me/due-items");
  }

  getSessionHistory(): Promise<unknown> {
    return this.get("/api/users/me/sessions");
  }

  getSkilltreeMap(skilltreeId: string): Promise<unknown> {
    return this.get(`/api/skilltrees/${skilltreeId}/map`);
  }

  // ─── AI ───────────────────────────────────────────────────────────

  generateHint(body: {
    nodeId: string;
    questionType?: string;
  }): Promise<unknown> {
    return this.post("/api/hints", body);
  }

  generateLesson(body: { nodeId: string }): Promise<unknown> {
    return this.post("/api/lessons", body);
  }
}
