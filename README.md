# StudyRoute

StudyRoute is a responsible learning-resource recommender. A learner shares a topic, confidence level, available time, and preferred format. The app returns two direct matches and one exploration pick from a related topic in a different format.

The system is designed for the cold-start problem. It does not need prior clicks or watch history, and it does not use engagement as its objective.

## What runs in the app

The recommendation score uses a trained logistic-regression model stored in `models/learning-ranker.json`. The model estimates the chance that a learner will complete a resource from four features:

- Topic match
- Confidence-to-level fit
- Time fit
- Format match

The app uses the model score to rank direct matches. It then applies a visible diversity constraint: the third result must come from a related topic and an unused format. This keeps the plan relevant without turning the learner's current preference into a narrow feed.

## Data and evaluation

`data/raw/pilot_feedback.json` contains a small, curated prototype dataset with completion labels. It is intentionally limited and is not presented as a real-world learning study. `npm run train` fits the model on 25 rows and evaluates it on 7 held-out rows. The generated evaluation report is stored in `data/outputs/model_evaluation.json`.

The current held-out prototype result is 0.857 accuracy, 0.750 precision, and 1.000 recall. These numbers only show that the local training and inference path works on this small dataset. A real deployment needs learner-consented outcome data, accessibility review, and a larger evaluation set.

## Run locally

```bash
npm install
npm run train
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
make train
make verify
```

## Project structure

```text
studyroute/
├── README.md
├── package.json
├── Makefile
├── railway.json
├── scripts/
│   └── train-ranker.mjs
├── models/
│   └── learning-ranker.json
├── data/
│   ├── raw/pilot_feedback.json
│   ├── processed/training_summary.json
│   └── outputs/model_evaluation.json
└── src/
    ├── app/
    └── lib/
```

This is a Next.js project, so `package.json` is the dependency manifest and `src/app/page.tsx` is the application entry point. The `train` script is the model setup step. The repository uses the equivalent JavaScript structure instead of `requirements.txt`, `setup.py`, and `main.py`.

## Accessibility and stability

The interface uses semantic headings, labelled controls, keyboard-operable buttons, visible selection states, live recommendation updates, responsive layouts, and a Railway health endpoint at `/api/health`. The app has no account, network request, or external service dependency at runtime.

## Scope and limits

This is a small curated prototype. Resource quality and learning outcomes still require human review. The exploration rule is a guardrail, not a claim that every learner benefits from the same amount of novelty.

## Attribution

All application, training, and interface code in this repository was written for StudyRoute. The sample catalog and pilot feedback data were created for this prototype. No external source code is included.
