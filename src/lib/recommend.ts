import { catalog, type Resource } from "./catalog";
import trainedModel from "../../models/learning-ranker.json";

export type LearnerInput = {
  topic: Resource["topic"];
  confidence: number;
  minutes: number;
  preferredFormat: Resource["format"] | "No preference";
};

export type ScoredResource = Resource & { relevance: number; reason: string; exploration: boolean };

type ModelFeatures = {
  topicMatch: number;
  levelFit: number;
  timeFit: number;
  formatMatch: number;
};

const levelTarget = (confidence: number) => confidence <= 2 ? 1 : confidence <= 4 ? 2 : 3;

const resourceFeatures = (resource: Resource, input: LearnerInput): ModelFeatures => {
  const target = levelTarget(input.confidence);
  return {
    topicMatch: resource.topic === input.topic ? 1 : 0,
    levelFit: Math.max(0, 1 - Math.abs(resource.level - target) / 2),
    timeFit: Math.max(0, 1 - Math.abs(resource.minutes - input.minutes) / 45),
    formatMatch: input.preferredFormat === "No preference" || resource.format === input.preferredFormat ? 1 : 0,
  };
};

const modelProbability = (features: ModelFeatures) => {
  const featureTotal = trainedModel.weights.reduce((total, weight, index) => total + weight * features[trainedModel.featureNames[index] as keyof ModelFeatures], 0);
  return 1 / (1 + Math.exp(-(trainedModel.bias + featureTotal)));
};

const scoreResource = (resource: Resource, input: LearnerInput) => {
  const modelScore = modelProbability(resourceFeatures(resource, input)) * 72;
  const levelTarget = input.confidence <= 2 ? 1 : input.confidence <= 4 ? 2 : 3;
  const topicBonus = resource.topic === input.topic ? 18 : 0;
  const levelBonus = Math.max(0, 7 - Math.abs(resource.level - levelTarget) * 4);
  return modelScore + topicBonus + levelBonus;
};

const recommendationReason = (resource: Resource, input: LearnerInput, exploration: boolean) => {
  if (exploration) return `A nearby skill in a different format, included to keep your plan from narrowing too early.`;
  const details = [resource.topic === input.topic ? `targets your ${input.topic.toLowerCase()} goal` : "builds a related skill"];
  if (resource.minutes <= input.minutes + 10) details.push(`fits roughly ${input.minutes} minutes`);
  if (input.preferredFormat === resource.format) details.push(`matches your ${resource.format.toLowerCase()} preference`);
  return `${details.join(" and ")}.`;
};

export function recommend(input: LearnerInput): ScoredResource[] {
  const ranked = catalog
    .filter((resource) => resource.topic === input.topic)
    .map((resource) => ({ ...resource, relevance: Math.round(scoreResource(resource, input)), exploration: false, reason: "" }))
    .sort((a, b) => b.relevance - a.relevance);
  const selected = ranked.slice(0, 2);
  const usedFormats = new Set(selected.map((resource) => resource.format));
  const explorationPool = catalog
    .filter((resource) => resource.topic !== input.topic && !usedFormats.has(resource.format))
    .map((resource) => ({ ...resource, relevance: Math.round(scoreResource(resource, input) * 0.58 + 12), exploration: true, reason: "" }))
    .sort((a, b) => b.relevance - a.relevance);
  const exploration = explorationPool[0];
  return [...selected, exploration].filter(Boolean).map((resource) => ({ ...resource, reason: recommendationReason(resource, input, resource.exploration) }));
}

export function recommendByFit(input: LearnerInput): ScoredResource[] {
  return catalog
    .filter((resource) => resource.topic === input.topic)
    .map((resource) => ({ ...resource, relevance: Math.round(scoreResource(resource, input)), exploration: false, reason: recommendationReason(resource, input, false) }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}
