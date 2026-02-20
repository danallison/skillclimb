# CYBERCLIMB

**Cybersecurity Skill Tree for SkillClimb**

*The first and primary skill tree — covering the full cybersecurity knowledge domain*

---

**Skill Tree Specification — Version 1.0 — February 2026**

---

## Table of Contents

1. [Overview](#overview)
2. [Cybersecurity Skill Tree](#cybersecurity-skill-tree)
3. [Cybersecurity Question Types](#cybersecurity-question-types)
4. [Lab Environments](#lab-environments)
5. [Red Team Challenges](#red-team-challenges)
6. [Content Creation Roadmap](#content-creation-roadmap)
7. [Certification Alignment](#certification-alignment)
8. [References](#references)

---

## Overview

CyberClimb is the cybersecurity skill tree for SkillClimb, the test-driven learning platform built on desirable difficulties, spaced repetition, and adaptive assessment. See `SKILLCLIMB.md` for the full platform specification — learning science foundations, SRS algorithm, question engine, AI tutor, technical architecture, and implementation roadmap.

This document specifies the cybersecurity-specific content: the skill tree structure, how generic question types map to cybersecurity topics, lab environments, red team challenges, content creation plans, and certification alignment.

The cybersecurity skill tree covers the full landscape from networking fundamentals through AI security specializations, organized as an explorable, progressively unlockable map. The domain structure mirrors real-world cybersecurity career paths and maps to industry certifications.

---

## Cybersecurity Skill Tree

### Tier Structure

The cybersecurity skill tree is organized into 5 tiers of increasing specialization. Each tier contains 3–6 domains. Domains are connected by prerequisite edges forming a DAG (see `SKILLCLIMB.md` for the prerequisite graph mechanics).

| Tier | Name | Focus | Domains |
|------|------|-------|---------|
| T0 | Foundations | Core technical literacy required for all security work | Networking Fundamentals, Operating Systems, Programming Fundamentals |
| T1 | Core Security | Fundamental security knowledge and defensive skills | Security Principles, Cryptography, Identity & Access Management, Network Defense, Threat Landscape, Web Application Security |
| T2 | Practitioner | Hands-on offensive and defensive specializations | Penetration Testing, SOC Operations, Digital Forensics, Cloud Security, System Administration, Malware Analysis |
| T3 | Specialist | Advanced offensive, analytical, and architectural roles | Exploit Development, Threat Intelligence, Incident Response, Security Architecture |
| T4 | AI Security | Emerging intersection of AI and cybersecurity | Adversarial ML, LLM Security, AI for SOC, AI Governance |

### Prerequisite Graph

The prerequisite relationships between domains ensure learners build on solid foundations:

**T0 → T1:**
- Networking Fundamentals → Network Defense, Web Application Security
- Operating Systems → Malware Analysis, Digital Forensics, System Administration
- Programming Fundamentals → Web Application Security, Exploit Development

**T1 → T2:**
- Security Principles → all T2 domains
- Cryptography → Penetration Testing, Cloud Security
- Identity & Access → SOC Operations, Cloud Security
- Network Defense → SOC Operations, Penetration Testing
- Threat Landscape → SOC Operations, Threat Intelligence
- Web Application Security → Penetration Testing

**T2 → T3:**
- Penetration Testing → Exploit Development
- SOC Operations → Incident Response, Threat Intelligence
- Digital Forensics → Incident Response
- Cloud Security → Security Architecture
- Malware Analysis → Exploit Development, Threat Intelligence

**T3 → T4:**
- Security Architecture → AI Governance
- Threat Intelligence → Adversarial ML
- Incident Response → AI for SOC

After completing T0 foundations, a learner could pursue penetration testing and SOC operations simultaneously, since they share prerequisites but don't depend on each other.

### Example Domains (Seeded)

The following domains are fully seeded with topics, nodes, and question templates. The source code in `packages/backend/src/content/cybersecurity/domains/` is the canonical source of truth for the full content.

**Networking Fundamentals (T0)** — OSI model, TCP/IP stack, DNS, DHCP, subnetting, ARP, ports and protocols, NAT/firewalls. The foundational domain that underpins most of cybersecurity.

**Security Principles (T1)** — CIA triad, defense in depth, least privilege, threat modeling, risk assessment. The conceptual framework for all security work.

**Cryptography (T1)** — Symmetric and asymmetric encryption, hashing, digital signatures, PKI, TLS. Underpins authentication, confidentiality, and integrity across all other domains.

**Threat Landscape (T1)** — Attack vectors, threat actors, kill chain models, common vulnerability types. Understanding the adversary is prerequisite to both offense and defense.

**Identity & Access Management (T1)** — Authentication methods, authorization models, SSO, MFA, directory services. Controls who can do what in any system.

**Network Defense (T1)** — Firewalls, IDS/IPS, network segmentation, VPNs, traffic analysis. The practical application of networking knowledge to security.

**Operating Systems (T0)** — Linux and Windows fundamentals, process management, file systems, permissions, system calls. Required for forensics, malware analysis, and system administration.

### Placeholder Domains

The following domains are defined in the skill tree but not yet seeded with full question content. They appear in the skill tree as locked/coming-soon:

Programming Fundamentals (T0), Web Application Security (T1), System Administration (T2), Penetration Testing (T2), SOC Operations (T2), Digital Forensics (T2), Cloud Security (T2), Malware Analysis (T2), Exploit Development (T3), Threat Intelligence (T3), Incident Response (T3), Security Architecture (T3), AI Security domains (T4).

---

## Cybersecurity Question Types

The platform's generic question engine (see `SKILLCLIMB.md`) supports five progressive question types. Here's how each maps to cybersecurity content:

### Recognition

Multiple-choice questions testing identification of cybersecurity concepts.

- *Which protocol operates at Layer 4 of the OSI model?* (TCP, UDP, IP, ARP)
- *Which encryption type uses a shared secret key?* (Symmetric, Asymmetric, Hashing, Digital signature)
- *What does the 'A' in CIA triad stand for?* (Availability, Authentication, Authorization, Auditing)

### Cued Recall

Short-answer and fill-in-the-blank requiring retrieval with contextual cues.

- *What is the default port for HTTPS?* → 443
- *Name the three components of the CIA triad.* → Confidentiality, Integrity, Availability
- *What command displays the ARP table on Linux?* → `arp -a`

### Free Recall

Open-ended explanations requiring uncued generation and deep understanding.

- *Explain how a TLS handshake establishes a secure connection.*
- *Describe the difference between authentication and authorization, with an example of each.*
- *Explain why defense in depth is more resilient than perimeter-only security.*

### Application

Scenario-based problems requiring transfer of knowledge to realistic situations.

- *You discover unusual outbound traffic on port 4444 from a workstation. Walk through your incident response steps.*
- *A web application is vulnerable to SQL injection in its login form. Describe the attack vector and recommend a fix.*
- *Design a network segmentation strategy for a small business with PCI compliance requirements.*

### Practical

Interactive challenges in realistic environments (see Lab Environments below).

- Capture the flag: exploit a misconfigured web server to retrieve a hidden file.
- Analyze a packet capture to identify the attack vector used in a simulated breach.
- Write firewall rules to block a specific attack pattern while allowing legitimate traffic.
- Perform a privilege escalation on a vulnerable Linux system.

---

## Lab Environments

Practical challenges run in Docker-based lab environments that provide isolated, disposable contexts for hands-on cybersecurity exercises. Each lab type maps to specific domains in the skill tree.

### Lab Types

**Network Analysis Labs** — Pre-built packet captures and live network environments for traffic analysis. Learners use tools like Wireshark, tcpdump, and nmap to identify anomalies, map networks, and detect attacks. Maps to: Networking Fundamentals, Network Defense, SOC Operations.

**Vulnerability Scanning Labs** — Intentionally vulnerable applications and systems (similar to DVWA, HackTheBox) where learners identify and classify vulnerabilities. Maps to: Web Application Security, Penetration Testing, System Administration.

**Log Analysis Labs** — Simulated SIEM environments with log data from multiple sources. Learners correlate events, identify indicators of compromise, and reconstruct attack timelines. Maps to: SOC Operations, Digital Forensics, Incident Response.

**CTF Challenges** — Capture-the-flag format challenges that require combining skills from multiple domains. Progressive difficulty from guided walkthroughs to open-ended challenges. Maps to: cross-domain assessment at tier transitions.

**Cryptography Labs** — Hands-on environments for implementing and breaking cryptographic schemes, analyzing certificate chains, and configuring TLS. Maps to: Cryptography.

**System Administration Labs** — Sandboxed Linux and Windows environments for practicing hardening, user management, service configuration, and incident cleanup. Maps to: Operating Systems, System Administration, Cloud Security.

### Lab Infrastructure

Labs are built as Docker Compose stacks with:
- Isolated network namespaces (no access to host or internet)
- Pre-configured vulnerable services and realistic data
- Automated flag verification for CTF-style challenges
- Time-limited sessions with automatic cleanup
- Snapshot/restore for multi-step challenges

---

## Red Team Challenges

Red team challenges are cross-domain synthesis scenarios that test a learner's ability to combine knowledge from multiple cybersecurity domains under realistic conditions. They are unlocked at tier transitions and serve as capstone assessments.

### Challenge Structure

Each red team challenge presents a scenario that requires skills from 3+ domains:

- **Reconnaissance phase** — Network scanning, OSINT, service enumeration (Networking, Threat Landscape)
- **Initial access** — Exploit a vulnerability to gain a foothold (Web App Security, Penetration Testing)
- **Lateral movement** — Escalate privileges and move through the network (Operating Systems, Identity & Access)
- **Objective completion** — Achieve a specific goal: exfiltrate data, establish persistence, or detect and contain the attacker (varies by scenario)

### Example Scenarios

**T1 → T2 Transition: "The Misconfigured Server"**
A small company's web server has been compromised. Using network analysis, identify the attack vector, analyze the web application vulnerability that was exploited, and recommend remediation steps. Combines: Networking Fundamentals, Security Principles, Threat Landscape.

**T2 → T3 Transition: "The Insider Threat"**
Suspicious activity has been detected in a corporate environment. Analyze logs, perform forensic analysis on a compromised workstation, correlate events across multiple systems, and produce an incident report. Combines: SOC Operations, Digital Forensics, Identity & Access, Network Defense.

**T3 → T4 Transition: "AI Under Attack"**
An ML-powered fraud detection system is producing false negatives. Investigate whether the model has been poisoned, analyze the training pipeline for adversarial inputs, and design defenses. Combines: AI Security domains, Security Architecture, Threat Intelligence.

### Scoring

Red team challenges are scored on multiple dimensions: completeness (objectives achieved), methodology (approach quality), efficiency (time and steps), and documentation (explanation of findings). Top scores are displayed on an optional leaderboard.

---

## Content Creation Roadmap

Content creation follows the Content Track in `SKILLCLIMB.md`. The code in `packages/backend/src/content/cybersecurity/` is the source of truth for what content currently exists.

### C1: Foundation Domains ✅

7 domains fully seeded with topics, nodes, and recognition/cued recall/free recall question templates:
- T0: Networking Fundamentals, Operating Systems
- T1: Security Principles, Cryptography, Threat Landscape, Identity & Access Management, Network Defense

13 additional domains defined as placeholders in the skill tree.

### C2: Question Depth

- Add application-level question templates to all 7 seeded domains.
- Ensure every node has at least recognition and cued recall templates.
- Review and improve explanation quality across all question templates.

### C3: Domain Expansion

- Seed remaining T1 domain: Web Application Security.
- Seed T0 domain: Programming Fundamentals.
- Seed T2 domains: Penetration Testing, SOC Operations, Digital Forensics, Cloud Security, System Administration, Malware Analysis.
- Seed T3 domains: Exploit Development, Threat Intelligence, Incident Response, Security Architecture.
- Target: ~600 nodes total across T0–T3.

### C4: Instructional Content

- Write micro-lessons (2–5 minutes each) for high-failure-rate nodes across seeded domains.
- Create worked examples with step-by-step reasoning for complex topics (subnetting, TLS handshake, threat modeling, etc.).
- Build concept maps showing connections between related nodes across domains.

### C5: Advanced and Specialized Content

- Seed T4 AI Security domains: Adversarial ML, LLM Security, AI for SOC, AI Governance (~200 nodes).
- Author red team challenge scenarios for tier transitions (T1→T2, T2→T3, T3→T4).
- Create lab exercise definitions for Docker-based practical challenges.
- Target: ~1,200 nodes total across all tiers.

---

## Certification Alignment

The cybersecurity skill tree is designed to align with industry certifications. Completing specific domain combinations prepares learners for certification exams.

| Certification | Level | Aligned Domains |
|--------------|-------|----------------|
| CompTIA Security+ | Entry | Security Principles, Cryptography, Identity & Access, Network Defense, Threat Landscape |
| CompTIA Network+ | Entry | Networking Fundamentals, Network Defense |
| CompTIA CySA+ | Intermediate | SOC Operations, Threat Intelligence, Incident Response, Digital Forensics |
| CEH (Certified Ethical Hacker) | Intermediate | Penetration Testing, Web Application Security, Networking Fundamentals, Cryptography |
| OSCP (Offensive Security) | Advanced | Penetration Testing, Exploit Development, Operating Systems, Web Application Security |
| CISSP | Advanced | All T0–T2 domains + Security Architecture |
| AWS Security Specialty | Specialist | Cloud Security, Identity & Access, Network Defense, Security Architecture |

> **Note:** SkillClimb is not a certification prep tool — it's a learning platform. But because the skill tree covers the same knowledge domains as these certifications, completing the relevant domains provides thorough preparation. Users who complete aligned domains should pass certification exams at high rates.

---

## References

### Cybersecurity Frameworks and Standards

- MITRE ATT&CK Framework. https://attack.mitre.org
- MITRE ATLAS: Adversarial Threat Landscape for AI Systems. https://atlas.mitre.org
- OWASP Top 10 for Web Applications. https://owasp.org/www-project-top-ten/
- OWASP Top 10 for LLM Applications. https://owasp.org/www-project-top-10-for-large-language-model-applications/
- NIST Cybersecurity Framework (CSF). https://www.nist.gov/cyberframework
- NIST AI Risk Management Framework (AI 100-1). https://www.nist.gov/artificial-intelligence/ai-risk-management-framework
- NIST Special Publication 800-53 (Security Controls). https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final

### Certification Bodies

- CompTIA Security+ Exam Objectives. https://www.comptia.org/certifications/security
- EC-Council Certified Ethical Hacker (CEH). https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/
- Offensive Security OSCP. https://www.offsec.com/courses/pen-200/
- (ISC)² CISSP. https://www.isc2.org/certifications/cissp

### Learning Science

See `SKILLCLIMB.md` for learning science references (Make It Stick, Bjork, Roediger & Karpicke, Kornell & Bjork, Wozniak, Dunlosky).
