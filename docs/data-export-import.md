# Data Export & Import

SkillClimb supports exporting and importing your learning progress, so you can back up your data, migrate between instances, or share progress with another deployment.

## Exporting Data

Export all your learning progress as JSON:

```bash
curl -s http://localhost:3001/api/users/me/data \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

The response includes:

- **learnerNodes** — your SRS state for each concept (easiness, interval, repetitions, due date)
- **reviews** — your full study history (every answer you've submitted)
- **studyDays** — daily review counts (used for streak tracking)

Each item is identified by `(skilltreeId, domainName, concept)` rather than UUIDs, making the export portable across instances.

## Importing Data

Import previously exported data:

```bash
curl -s -X POST http://localhost:3001/api/users/me/data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @my-export.json
```

The response tells you what was imported and what was skipped:

```json
{
  "imported": { "learnerNodes": 42, "reviews": 150, "studyDays": 30 },
  "skipped": { "learnerNodes": 3, "reviews": 5 }
}
```

## How Matching Works

Nodes are matched by `(skilltreeId, domainName, concept)` — not by UUID. This means:

- Both the source and target instances must have the same skill tree seeded
- If the target instance has different content (different domains or concepts), those items will be skipped
- Matching is exact — a concept renamed between exports won't match

## What's Included

| Data | Export | Import behavior |
|------|--------|----------------|
| Learner nodes (SRS state) | Yes | Upserted — import overwrites existing SRS state for matched nodes |
| Reviews (study history) | Yes | Appended — imported reviews are added alongside existing ones |
| Study days (streak data) | Yes | Upserted — import overwrites daily review counts |

## What's Not Included

- **Sessions** — session groupings are instance-specific snapshots and not portable
- **Placement test results** — these are tied to the specific assessment and not meaningful across instances

## Export Format

```json
{
  "version": 1,
  "exportedAt": "2026-02-22T12:00:00.000Z",
  "learnerNodes": [
    {
      "skilltreeId": "cybersecurity",
      "domainName": "Security Principles",
      "concept": "Confidentiality",
      "easiness": 2.5,
      "interval": 10,
      "repetitions": 3,
      "dueDate": "2026-03-01T00:00:00.000Z",
      "domainWeight": 1.0,
      "confidenceHistory": [],
      "misconceptions": []
    }
  ],
  "reviews": [
    {
      "skilltreeId": "cybersecurity",
      "domainName": "Security Principles",
      "concept": "Confidentiality",
      "score": 4,
      "confidence": 3,
      "response": "CIA triad",
      "createdAt": "2026-02-20T00:00:00.000Z"
    }
  ],
  "studyDays": [
    { "date": "2026-02-20", "reviewCount": 15 }
  ]
}
```
