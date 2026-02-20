# Creating Skill Trees

This guide explains how to create your own skill tree for SkillClimb. No programming knowledge required — skill trees are written entirely in YAML.

## How SkillClimb Organizes Knowledge

Every skill tree is a four-level hierarchy:

```
Skill Tree (e.g., "Cybersecurity")
  └── Domain (e.g., "Networking Fundamentals")
        └── Topic (e.g., "OSI Model")
              └── Node (e.g., "The seven layers of the OSI model")
```

- **Skill Tree** — the top-level subject area.
- **Domain** — a major area of knowledge. Domains can have prerequisites (other domains the learner should complete first).
- **Topic** — a cluster of related concepts within a domain.
- **Node** — a single atomic concept the learner needs to know. Each node has questions that test understanding at increasing difficulty.

## File Structure

Each skill tree lives in its own folder under `packages/backend/src/content/`:

```
packages/backend/src/content/
  └── your-skilltree-id/
        ├── skilltree.yaml            # Skill tree manifest
        └── domains/
              ├── first-domain.yaml
              ├── second-domain.yaml
              └── third-domain.yaml
```

## Skill Tree Manifest: `skilltree.yaml`

The manifest defines your skill tree's metadata, lists its domains, and declares relationships between them.

```yaml
name: Spanish Language          # Display name
id: spanish                     # Unique ID (lowercase, hyphens OK)

tierBases:                      # Difficulty scaling per tier (see below)
  0: -2
  1: -0.5
  2: 1
  3: 2
  4: 3

domains:                        # Domain file slugs, in display order
  - pronunciation
  - basic-grammar
  - vocabulary
  - intermediate-grammar
  - reading-comprehension

prerequisites:                  # Which domains require others first
  basic-grammar:
    - pronunciation
  vocabulary:
    - pronunciation
  intermediate-grammar:
    - basic-grammar
    - vocabulary
  reading-comprehension:
    - vocabulary

placeholders:                   # Planned domains not yet written
  - name: Advanced Grammar
    tier: 3
    description: Subjunctive mood, complex tenses, and formal registers
    displayOrder: 10
```

### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Human-readable skill tree name |
| `id` | yes | Unique slug used internally |
| `tierBases` | yes | Maps tier numbers to base difficulty values. Lower = easier. Used by the spaced repetition engine to calibrate review intervals. |
| `domains` | yes | Ordered list of domain file slugs. Each entry corresponds to a file at `domains/<slug>.yaml`. |
| `prerequisites` | no | Maps a domain slug to the list of domain slugs that must be completed first. Omit domains with no prerequisites. |
| `placeholders` | no | Domains to show in the UI as "coming soon." Each needs `name`, `tier`, `description`, and `displayOrder`. |

### About tiers and tierBases

Tiers represent broad difficulty levels. A typical five-tier setup:

| Tier | Meaning | Suggested tierBase |
|------|---------|-------------------|
| 0 | Foundations | -2 |
| 1 | Core concepts | -0.5 |
| 2 | Intermediate | 1 |
| 3 | Advanced | 2 |
| 4 | Specialization | 3 |

You can use any number of tiers. The tierBase values feed into the spaced repetition algorithm — higher values mean the system treats the material as harder and schedules more frequent reviews.

## Domain Files: `domains/<slug>.yaml`

Each domain file defines one domain with its topics and nodes.

```yaml
name: Pronunciation
tier: 0
description: Spanish sound system, accent rules, and letter-sound correspondences

topics:
  - name: Vowel Sounds
    nodes:
      - concept: The five Spanish vowels and their consistent sounds
        questions:
          - type: recognition
            prompt: Which Spanish vowel always sounds like the "ee" in "see"?
            answer: The letter "i"
            explanation: >
              Unlike English, Spanish vowels each have exactly one sound.
              The letter "i" always makes the "ee" sound.
            choices:
              - The letter "e"
              - The letter "i"
              - The letter "a"
              - The letter "u"

          - type: cued_recall
            prompt: What sound does the Spanish letter "i" make?
            answer: The "ee" sound, as in "see"
            explanation: >
              Spanish vowels are consistent — "i" always sounds like "ee".
            acceptableAnswers:
              - ee
              - like ee in see
              - the ee sound
            hints:
              - Think of the English word "machine" — the "i" sounds the same.

          - type: free_recall
            prompt: >
              Describe the five Spanish vowels and the sound each one makes.
              Give an English word that demonstrates each sound.
            answer: >
              a = "ah" (as in "father"), e = "eh" (as in "bed"),
              i = "ee" (as in "see"), o = "oh" (as in "go"),
              u = "oo" (as in "food")
            explanation: >
              Spanish has five pure vowels with consistent pronunciation.
            rubric: >
              Full marks for naming all five vowels with correct sounds
              and reasonable English examples.
            keyPoints:
              - All five vowels named (a, e, i, o, u)
              - Each mapped to its correct sound
              - English examples are reasonable approximations

  - name: Consonant Sounds
    complexityWeight: 1.2
    nodes:
      - concept: ...
        questions: ...
```

### Domain fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Display name for the domain |
| `tier` | yes | Which tier this domain belongs to (must match a key in `tierBases`) |
| `description` | yes | Brief description shown in the UI |
| `displayOrder` | no | Controls sort order in the UI. Defaults to the domain's position in `skilltree.yaml`'s `domains` list. Use explicit values when you want to interleave content domains with placeholders. |
| `topics` | yes | List of topics (see below) |

### Topic fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Display name for the topic |
| `complexityWeight` | no | Multiplier for difficulty within this topic. Defaults to `1.0`. Values > 1 mean harder (more frequent reviews); values < 1 mean easier. |
| `nodes` | yes | List of nodes (see below) |

### Node fields

| Field | Required | Description |
|-------|----------|-------------|
| `concept` | yes | A concise description of the single concept this node tests. This is the node's identity — it should be unique within the domain. |
| `questions` | yes | List of questions at different difficulty levels (see below) |

## Writing Questions

Each node should have questions that test the concept at progressively deeper levels. There are three main question types:

### 1. Recognition (easiest)

Multiple choice. The learner picks the right answer from a list.

```yaml
- type: recognition
  prompt: What does DNS stand for?
  answer: Domain Name System
  explanation: >
    DNS translates human-readable domain names (like example.com)
    into IP addresses that computers use to communicate.
  choices:
    - Dynamic Network Service
    - Domain Name System
    - Data Network Standard
    - Digital Name Server
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `recognition` |
| `prompt` | yes | The question |
| `answer` | yes | The correct answer |
| `explanation` | yes | Explanation shown after the learner answers |
| `choices` | yes | 2-6 options including the correct answer |

### 2. Cued Recall (medium)

The learner types a short answer with hints available.

```yaml
- type: cued_recall
  prompt: What does DNS stand for?
  answer: Domain Name System
  explanation: >
    DNS translates human-readable domain names into IP addresses.
  acceptableAnswers:
    - Domain Name System
    - domain name system
    - DNS - Domain Name System
  hints:
    - It has to do with translating names into addresses.
    - The first word is "Domain."
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `cued_recall` |
| `prompt` | yes | The question |
| `answer` | yes | The ideal answer |
| `explanation` | yes | Explanation shown after the learner answers |
| `acceptableAnswers` | no | Alternative phrasings that should be accepted as correct |
| `hints` | no | Progressive hints, from vague to specific |

### 3. Free Recall (hardest)

The learner writes an open-ended explanation. Graded by AI against key points.

```yaml
- type: free_recall
  prompt: >
    Explain how DNS resolution works when you type a URL
    into your browser.
  answer: >
    When you type a URL, your browser first checks its local cache.
    If not cached, it queries a recursive DNS resolver (usually from
    your ISP). The resolver checks root name servers, then TLD servers,
    then authoritative name servers for the domain, ultimately
    returning the IP address to your browser.
  explanation: >
    DNS resolution is a hierarchical lookup process that translates
    domain names to IP addresses through a chain of name servers.
  rubric: >
    Full marks for describing the multi-step resolution process
    including at least the recursive resolver and authoritative server.
    Partial credit for describing caching or the general concept
    without the full chain.
  keyPoints:
    - Browser checks local/OS cache first
    - Recursive resolver queries the DNS hierarchy
    - Resolution chain includes root, TLD, and authoritative servers
    - Final result is an IP address
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `free_recall` |
| `prompt` | yes | An open-ended question |
| `answer` | yes | A model answer |
| `explanation` | yes | Explanation shown after the learner answers |
| `rubric` | no | Grading guidance for the AI evaluator |
| `keyPoints` | no | Specific points the answer should cover |
| `hints` | no | Progressive hints |

### How many questions per node?

Aim for **at least one `recognition` and one `cued_recall` question per node**. Add `free_recall` for important concepts where you want the learner to demonstrate deeper understanding. A typical node has 2-3 questions.

## Loading Your Skill Tree

Once your YAML files are in place, seed the database:

```bash
# Seed all skill trees
npm run seed

# Seed only your skill tree
npm run seed -- --skilltree your-skilltree-id
```

The seed is idempotent — running it again won't duplicate data or overwrite learner progress.

## Tips for Writing Good Content

**Structure your hierarchy well:**
- Each domain should represent a coherent area that takes roughly the same amount of effort to learn.
- Topics within a domain should group 5-15 closely related nodes.
- Each node should test exactly one concept. If your `concept` field has "and" in it, consider splitting it into two nodes.

**Write clear questions:**
- Recognition choices should include plausible distractors, not obviously wrong answers.
- Cued recall `acceptableAnswers` should cover common phrasings — think about how different people might word the same correct answer.
- Free recall prompts should be specific enough that the learner knows what level of detail you expect.

**Use prerequisites thoughtfully:**
- Only add a prerequisite if the learner genuinely can't understand the dependent domain without the prerequisite.
- Keep the prerequisite graph shallow — long chains of prerequisites slow learners down.

**Set complexity weights intentionally:**
- Leave most topics at `1.0` (the default).
- Increase to `1.2`-`1.5` for topics with abstract concepts, lots of memorization, or things people commonly get wrong.
- Decrease to `0.8`-`0.9` for straightforward or intuitive topics.

## Minimal Working Example

Here's the smallest possible skill tree — a single domain with one topic and one node:

**`packages/backend/src/content/example/skilltree.yaml`:**

```yaml
name: Example
id: example
tierBases:
  0: 0
domains:
  - basics
```

**`packages/backend/src/content/example/domains/basics.yaml`:**

```yaml
name: Basics
tier: 0
description: A minimal example domain

topics:
  - name: Getting Started
    nodes:
      - concept: What SkillClimb is
        questions:
          - type: recognition
            prompt: What is SkillClimb?
            answer: A test-driven learning platform
            explanation: >
              SkillClimb uses spaced repetition and adaptive
              assessment to help you learn any skill tree.
            choices:
              - A social media platform
              - A test-driven learning platform
              - A video streaming service
              - A project management tool
```
