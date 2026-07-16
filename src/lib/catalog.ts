export type Resource = {
  id: string;
  title: string;
  topic: "Python" | "Statistics" | "Machine Learning" | "Data Visualization";
  format: "Interactive" | "Video" | "Reading" | "Practice";
  level: 1 | 2 | 3;
  minutes: number;
  provider: string;
  description: string;
  skills: string[];
};

export const catalog: Resource[] = [
  { id: "py-lab", title: "Python data structures lab", topic: "Python", format: "Interactive", level: 1, minutes: 35, provider: "OpenLearn Lab", description: "Build confidence with lists, dictionaries, and loops through short exercises.", skills: ["python", "data"] },
  { id: "py-read", title: "Reading data files safely", topic: "Python", format: "Reading", level: 1, minutes: 20, provider: "Data Carpentry", description: "A practical guide to CSV files, missing values, and simple checks.", skills: ["python", "data"] },
  { id: "py-practice", title: "Debug three small scripts", topic: "Python", format: "Practice", level: 2, minutes: 30, provider: "Code Clinic", description: "Find and fix realistic bugs in beginner data scripts.", skills: ["python", "debugging"] },
  { id: "stats-video", title: "Confidence intervals without the fog", topic: "Statistics", format: "Video", level: 1, minutes: 24, provider: "Seeing Statistics", description: "A visual introduction to uncertainty and sample variation.", skills: ["statistics", "inference"] },
  { id: "stats-practice", title: "Choose the right summary statistic", topic: "Statistics", format: "Practice", level: 1, minutes: 25, provider: "OpenIntro", description: "Work through skewed distributions, outliers, and common summaries.", skills: ["statistics", "inference"] },
  { id: "stats-read", title: "Correlation is not a conclusion", topic: "Statistics", format: "Reading", level: 2, minutes: 18, provider: "Naked Statistics Notes", description: "Learn to spot claims that overreach the data.", skills: ["statistics", "critical thinking"] },
  { id: "ml-interactive", title: "Classify a dataset by hand", topic: "Machine Learning", format: "Interactive", level: 2, minutes: 40, provider: "Model Playground", description: "Explore features, labels, and a simple decision boundary with immediate feedback.", skills: ["machine learning", "classification"] },
  { id: "ml-video", title: "What a baseline is for", topic: "Machine Learning", format: "Video", level: 2, minutes: 16, provider: "ML Minutes", description: "A concise walkthrough of why simple comparisons make models more trustworthy.", skills: ["machine learning", "evaluation"] },
  { id: "ml-reading", title: "A first guide to model evaluation", topic: "Machine Learning", format: "Reading", level: 2, minutes: 28, provider: "Google ML Education", description: "Read about train-test splits, errors, and how to avoid misleading scores.", skills: ["machine learning", "evaluation"] },
  { id: "viz-practice", title: "Repair a misleading chart", topic: "Data Visualization", format: "Practice", level: 1, minutes: 25, provider: "Chart School", description: "Compare chart choices and revise a chart so its claim is clearer.", skills: ["visualization", "communication"] },
  { id: "viz-video", title: "Telling a story with data", topic: "Data Visualization", format: "Video", level: 1, minutes: 22, provider: "Data Story Lab", description: "A short lesson on focus, annotation, and visual hierarchy.", skills: ["visualization", "communication"] },
  { id: "viz-interactive", title: "Pick a chart for the question", topic: "Data Visualization", format: "Interactive", level: 2, minutes: 30, provider: "Observable Learn", description: "Match analytical questions to chart types and see the tradeoffs.", skills: ["visualization", "communication"] }
];
