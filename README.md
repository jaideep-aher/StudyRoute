# StudyRoute

StudyRoute is a local prototype for responsible learning-resource recommendations. A learner shares a topic, confidence level, available time, and preferred format. The system returns two direct matches plus one exploration pick from a related topic in a different format.

The goal is not to predict clicks. The recommender is designed to support a useful next study session while avoiding a narrow, repetitive feed.

## Why this problem

Learning platforms often infer what to show from past engagement. That approach is weak for a learner who is new to a topic and can over-reinforce one format or subject area. StudyRoute handles cold starts directly with a short intake and guarantees a small amount of intentional variety.

## Recommendation approach

Each catalog item receives a transparent fit score based on:

- Topic match
- Match between confidence and resource level
- Match between available time and estimated duration
- Preferred format match

The top two direct matches are selected first. A third item is selected from a related topic and an unused format. This diversity rule is applied after relevance ranking, so the system makes its tradeoff visible instead of silently optimizing one score.

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```text
studyroute/
├── src/app/page.tsx       interactive user interface
├── src/lib/catalog.ts     small curated resource catalog
├── src/lib/recommend.ts   ranking and diversity logic
├── package.json           app dependencies and commands
└── README.md              project notes
```

## Evaluation discussion

The interface exposes a fit score and a plain-language reason for every item. The key evaluation question is whether the plan maintains relevance while still including a meaningful exploration pick. In a larger deployment, this should be tested with learning outcomes, completion, and learner feedback, not clicks alone.

## Limits

This is a small curated prototype. Resource quality, accessibility needs, and real learning outcomes require human review. The exploration rule is a guardrail, not a claim that every learner benefits from the same amount of novelty.
