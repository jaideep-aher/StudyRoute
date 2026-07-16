import { readFile, mkdir, writeFile } from "node:fs/promises";

const featureNames = ["topicMatch", "levelFit", "timeFit", "formatMatch"];

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function dotProduct(weights, row) {
  return weights.reduce((sum, weight, index) => sum + weight * row[featureNames[index]], 0);
}

function predictProbability(model, row) {
  return sigmoid(model.bias + dotProduct(model.weights, row));
}

function trainModel(rows) {
  const weights = featureNames.map(() => 0);
  let bias = 0;
  const learningRate = 0.12;
  const regularization = 0.015;
  for (let epoch = 0; epoch < 1800; epoch += 1) {
    const gradients = featureNames.map(() => 0);
    let biasGradient = 0;
    for (const row of rows) {
      const error = sigmoid(bias + dotProduct(weights, row)) - row.completed;
      featureNames.forEach((feature, index) => {
        gradients[index] += error * row[feature];
      });
      biasGradient += error;
    }
    weights.forEach((weight, index) => {
      weights[index] -= learningRate * ((gradients[index] / rows.length) + regularization * weight);
    });
    bias -= learningRate * (biasGradient / rows.length);
  }
  return { bias, weights };
}

function evaluateModel(model, rows) {
  const results = rows.map((row) => ({ actual: row.completed, predicted: predictProbability(model, row) >= 0.5 ? 1 : 0 }));
  const correct = results.filter((result) => result.actual === result.predicted).length;
  const truePositive = results.filter((result) => result.actual === 1 && result.predicted === 1).length;
  const falsePositive = results.filter((result) => result.actual === 0 && result.predicted === 1).length;
  const falseNegative = results.filter((result) => result.actual === 1 && result.predicted === 0).length;
  const precision = truePositive / Math.max(1, truePositive + falsePositive);
  const recall = truePositive / Math.max(1, truePositive + falseNegative);
  return { rows: rows.length, accuracy: Number((correct / rows.length).toFixed(3)), precision: Number(precision.toFixed(3)), recall: Number(recall.toFixed(3)) };
}

async function main() {
  const rows = JSON.parse(await readFile(new URL("../data/raw/pilot_feedback.json", import.meta.url), "utf8"));
  const validationRows = rows.filter((_, index) => index % 5 === 0);
  const trainingRows = rows.filter((_, index) => index % 5 !== 0);
  const fitted = trainModel(trainingRows);
  const model = { modelType: "logistic regression", version: "1.0", featureNames, ...fitted, trainingRows: trainingRows.length, validation: evaluateModel(fitted, validationRows) };
  await mkdir(new URL("../models/", import.meta.url), { recursive: true });
  await mkdir(new URL("../data/processed/", import.meta.url), { recursive: true });
  await mkdir(new URL("../data/outputs/", import.meta.url), { recursive: true });
  await writeFile(new URL("../models/learning-ranker.json", import.meta.url), `${JSON.stringify(model, null, 2)}\n`);
  await writeFile(new URL("../data/processed/training_summary.json", import.meta.url), `${JSON.stringify({ source: "data/raw/pilot_feedback.json", trainingRows: trainingRows.length, validationRows: validationRows.length }, null, 2)}\n`);
  await writeFile(new URL("../data/outputs/model_evaluation.json", import.meta.url), `${JSON.stringify(model.validation, null, 2)}\n`);
}

main();
