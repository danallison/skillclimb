import { describe, it, expect } from "vitest";
import {
  buildEvaluationMessage,
  buildHintMessage,
  buildMicroLessonMessage,
} from "../messages.js";

describe("buildEvaluationMessage", () => {
  it("builds a basic evaluation message", () => {
    const msg = buildEvaluationMessage({
      concept: "TCP handshake",
      prompt: "Explain the TCP three-way handshake",
      correctAnswer: "SYN, SYN-ACK, ACK",
      keyPoints: ["SYN", "SYN-ACK", "ACK"],
      rubric: "Must mention all three steps",
      learnerResponse: "SYN and ACK",
    });

    expect(msg).toContain("Concept: TCP handshake");
    expect(msg).toContain("Question: Explain the TCP three-way handshake");
    expect(msg).toContain("Correct answer: SYN, SYN-ACK, ACK");
    expect(msg).toContain("- SYN");
    expect(msg).toContain("- SYN-ACK");
    expect(msg).toContain("Rubric: Must mention all three steps");
    expect(msg).toContain("<learner_response>");
    expect(msg).toContain("SYN and ACK");
    expect(msg).toContain("</learner_response>");
  });

  it("includes previous misconceptions when present", () => {
    const msg = buildEvaluationMessage({
      concept: "TCP",
      prompt: "Explain TCP",
      correctAnswer: "...",
      keyPoints: [],
      rubric: "",
      learnerResponse: "...",
      previousMisconceptions: ["TCP is connectionless", "UDP uses handshakes"],
    });

    expect(msg).toContain("Previous misconceptions");
    expect(msg).toContain("- TCP is connectionless");
    expect(msg).toContain("- UDP uses handshakes");
  });

  it("omits misconceptions section when empty", () => {
    const msg = buildEvaluationMessage({
      concept: "TCP",
      prompt: "Explain TCP",
      correctAnswer: "...",
      keyPoints: [],
      rubric: "",
      learnerResponse: "...",
      previousMisconceptions: [],
    });

    expect(msg).not.toContain("Previous misconceptions");
  });
});

describe("buildHintMessage", () => {
  it("builds a hint message with learner response", () => {
    const msg = buildHintMessage({
      concept: "DNS",
      prompt: "What does DNS do?",
      correctAnswer: "Resolves domain names to IP addresses",
      learnerResponse: "It encrypts traffic",
    });

    expect(msg).toContain("Concept: DNS");
    expect(msg).toContain("Correct answer (DO NOT reveal this):");
    expect(msg).toContain("<learner_response>");
    expect(msg).toContain("It encrypts traffic");
    expect(msg).toContain("</learner_response>");
  });

  it("uses default text when no learner response", () => {
    const msg = buildHintMessage({
      concept: "DNS",
      prompt: "What does DNS do?",
      correctAnswer: "Resolves domain names",
      learnerResponse: "",
    });

    expect(msg).toContain("The learner got this wrong.");
  });
});

describe("buildMicroLessonMessage", () => {
  it("builds a micro lesson message", () => {
    const msg = buildMicroLessonMessage({
      concept: "Encryption",
      correctAnswer: "N/A",
      explanation: "Encryption converts plaintext to ciphertext",
      keyPoints: ["symmetric", "asymmetric"],
      misconceptions: ["Encryption and hashing are the same"],
    });

    expect(msg).toContain("Concept: Encryption");
    expect(msg).toContain("Correct explanation:");
    expect(msg).toContain("- symmetric");
    expect(msg).toContain("Known misconceptions");
    expect(msg).toContain("- Encryption and hashing are the same");
  });

  it("omits misconceptions section when empty", () => {
    const msg = buildMicroLessonMessage({
      concept: "Encryption",
      correctAnswer: "N/A",
      explanation: "...",
      keyPoints: [],
      misconceptions: [],
    });

    expect(msg).not.toContain("Known misconceptions");
  });
});
