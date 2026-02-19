export interface SeedDomain {
  name: string;
  tier: number;
  description: string;
  prerequisites: string[];
  displayOrder: number;
}

export interface SeedTopic {
  name: string;
  complexityWeight: number;
  displayOrder: number;
}

export interface SeedNode {
  topicName: string;
  concept: string;
  questionTemplates: Array<{
    type: "recognition";
    prompt: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

export interface ContentPack {
  name: string;
  id: string;
  tierBases: Record<number, number>;
  domains: Array<{ prefix: string; domain: SeedDomain; topics: SeedTopic[]; nodes: SeedNode[] }>;
  prerequisites: Record<string, string[]>;
  placeholderDomains: Array<{ tier: number; name: string; description: string; displayOrder: number }>;
}
