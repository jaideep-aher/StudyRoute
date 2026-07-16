import { catalog, type Resource } from "./catalog";

export type LearnerInput = {
  topic: Resource["topic"];
  confidence: number;
  minutes: number;
  preferredFormat: Resource["format"] | "No preference";
};

export type ScoredResource = Resource & { relevance: number; reason: string; exploration: boolean };

const scoreResource = (resource: Resource, input: LearnerInput) => {
  const levelTarget = input.confidence <= 2 ? 1 : input.confidence <= 4 ? 2 : 3;
  const topicFit = resource.topic === input.topic ? 42 : 0;
  const levelFit = Math.max(0, 25 - Math.abs(resource.level - levelTarget) * 12);
  const timeFit = Math.max(0, 22 - Math.abs(resource.minutes - input.minutes) * 0.55);
  const formatFit = input.preferredFormat === "No preference" || resource.format === input.preferredFormat ? 11 : 0;
  return topicFit + levelFit + timeFit + formatFit;
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
