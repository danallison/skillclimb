import type { ContentPack } from "../../seed/types.js";
import {
  domain as networkingDomain,
  topics as networkingTopics,
  nodes as networkingNodes,
} from "./domains/networking-fundamentals.js";
import {
  domain as securityDomain,
  topics as securityTopics,
  nodes as securityNodes,
} from "./domains/security-principles.js";
import {
  domain as osDomain,
  topics as osTopics,
  nodes as osNodes,
} from "./domains/operating-systems.js";
import {
  domain as cryptoDomain,
  topics as cryptoTopics,
  nodes as cryptoNodes,
} from "./domains/cryptography.js";
import {
  domain as iamDomain,
  topics as iamTopics,
  nodes as iamNodes,
} from "./domains/identity-access.js";
import {
  domain as netDefDomain,
  topics as netDefTopics,
  nodes as netDefNodes,
} from "./domains/network-defense.js";
import {
  domain as threatDomain,
  topics as threatTopics,
  nodes as threatNodes,
} from "./domains/threat-landscape.js";

const cybersecurity: ContentPack = {
  name: "Cybersecurity",
  id: "cybersecurity",
  tierBases: {
    0: -2.0,
    1: -0.5,
    2: 1.0,
    3: 2.0,
    4: 3.0,
  },
  domains: [
    { prefix: "net", domain: networkingDomain, topics: networkingTopics, nodes: networkingNodes },
    { prefix: "sec", domain: securityDomain, topics: securityTopics, nodes: securityNodes },
    { prefix: "os", domain: osDomain, topics: osTopics, nodes: osNodes },
    { prefix: "crypto", domain: cryptoDomain, topics: cryptoTopics, nodes: cryptoNodes },
    { prefix: "iam", domain: iamDomain, topics: iamTopics, nodes: iamNodes },
    { prefix: "netdef", domain: netDefDomain, topics: netDefTopics, nodes: netDefNodes },
    { prefix: "threat", domain: threatDomain, topics: threatTopics, nodes: threatNodes },
  ],
  prerequisites: {
    "Cryptography": ["Security Principles"],
    "Identity & Access Management": ["Security Principles"],
    "Network Defense": ["Networking Fundamentals"],
    "Threat Landscape": ["Security Principles"],
  },
  placeholderDomains: [
    // T0: Foundations (networking, security, OS already seeded above)
    { tier: 0, name: "Programming Fundamentals", description: "Scripting with Python and Bash, data structures, and basic algorithms for security tooling", displayOrder: 4 },

    // T1: Core Technical (crypto, IAM, netdef, threat already seeded above)
    { tier: 1, name: "Web Application Security", description: "OWASP Top 10, injection attacks, authentication flaws, and secure development practices", displayOrder: 6 },
    { tier: 1, name: "System Administration", description: "Hardening, patch management, logging, and secure configuration of servers and endpoints", displayOrder: 7 },

    // T2: Intermediate
    { tier: 2, name: "Penetration Testing", description: "Reconnaissance, scanning, exploitation, post-exploitation, and reporting methodologies", displayOrder: 10 },
    { tier: 2, name: "SOC Operations", description: "Security monitoring, SIEM, incident triage, alert analysis, and threat hunting", displayOrder: 11 },
    { tier: 2, name: "Digital Forensics", description: "Evidence collection, disk and memory forensics, timeline analysis, and chain of custody", displayOrder: 12 },
    { tier: 2, name: "Cloud Security", description: "AWS/Azure/GCP security controls, shared responsibility, IAM policies, and cloud-native threats", displayOrder: 13 },
    { tier: 2, name: "Malware Analysis", description: "Static and dynamic analysis, reverse engineering, behavioral indicators, and sandboxing", displayOrder: 14 },

    // T3: Advanced
    { tier: 3, name: "Exploit Development", description: "Buffer overflows, ROP chains, shellcode, and vulnerability research techniques", displayOrder: 15 },
    { tier: 3, name: "Threat Intelligence", description: "MITRE ATT&CK, threat actor profiling, IOC analysis, and intelligence-driven defense", displayOrder: 16 },
    { tier: 3, name: "Incident Response", description: "IR planning, containment, eradication, recovery, and post-incident analysis", displayOrder: 17 },
    { tier: 3, name: "Security Architecture", description: "Zero trust, defense in depth, secure design patterns, and enterprise security frameworks", displayOrder: 18 },
    { tier: 3, name: "AI Security", description: "Adversarial ML, LLM security, AI for SOC automation, and AI governance", displayOrder: 19 },

    // T4: Specialization
    { tier: 4, name: "Red Team Operations", description: "Advanced adversary simulation, C2 frameworks, evasion techniques, and physical security", displayOrder: 20 },
    { tier: 4, name: "Application Security Engineering", description: "Secure SDLC, threat modeling, code review, SAST/DAST, and DevSecOps pipelines", displayOrder: 21 },
    { tier: 4, name: "GRC & Compliance", description: "Risk frameworks, NIST, ISO 27001, SOC 2, regulatory compliance, and audit preparation", displayOrder: 22 },
    { tier: 4, name: "ICS/OT Security", description: "SCADA systems, industrial protocols, air-gapped networks, and critical infrastructure defense", displayOrder: 23 },
  ],
};

export default cybersecurity;
