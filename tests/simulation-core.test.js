const test = require("node:test");
const assert = require("node:assert/strict");
const { simulate, expectedRetrains, expectedCostJ } = require("../simulation-core.js");

const baseModel = { acc: 90, train: 100, inf: 1, rob: 1 };

const makeScenario = overrides => ({
  m: 0.5,
  months: 2,
  days: 60,
  traffic: 1000,
  totalPreds: 60000,
  floor: 50,
  retrainMonths: 1,
  tau: 80,
  subthresholdRetrain: true,
  subthresholdDays: 10,
  policy: "fixed",
  watts: 10,
  gridG: 100,
  hardwareUtil: 100,
  pue: 1.2,
  embGPerSec: 0.001,
  ...overrides,
});

test("policy=fixed: retraining count and energy are calculated accurately", () => {
  const s = makeScenario({ policy: "fixed", retrainMonths: 1, days: 60 });
  const result = simulate(baseModel, s);

  // 60 days with 30-day cycle = 1 retrain event
  assert.equal(result.retrains, 1);
  assert.equal(result.retrainJ, 100 * 10); // 100s * 10W = 1000 J
  assert.equal(result.deployJ, (100 + (1 / 1000) * 60000) * 10); // (100 + 60) * 10 = 1600 J
  assert.equal(expectedRetrains(baseModel, s), 1);
  assert.equal(expectedCostJ(baseModel, s), 1600);
});

test("policy=none: zero retrains and accuracy degrades to configured floor", () => {
  const brittleModel = { ...baseModel, rob: 100 };
  const s = makeScenario({ policy: "none", m: 1.0, traffic: 5000, days: 60, totalPreds: 300000 });
  const result = simulate(brittleModel, s);

  assert.equal(result.retrains, 0);
  assert.equal(expectedRetrains(brittleModel, s), 0);
  assert.equal(result.minAcc, s.floor);
  assert.ok(result.avgAcc > s.floor && result.avgAcc < brittleModel.acc);
  // Errors must inflate Consumer SCI (QA) compared to standard Consumer SCI
  assert.ok(result.sciEffective > result.sciConsumer);
});

test("policy=absolute: threshold-triggered retraining under predictable drift", () => {
  // Accuracy drops from 90 to 80 (delta = 10 pts).
  // driftPerPred = (2 / 100000) * 1.0 = 0.00002 pts/pred.
  // dailyDrop = 0.00002 * 50,000 = 1.0 pt/day.
  // Cycle = 10 days. In 60 days: floor((60 - 1e-6) / 10) = 5 retrains.
  const model = { acc: 90, train: 50, inf: 2, rob: 2 };
  const s = makeScenario({
    policy: "absolute",
    tau: 80,
    m: 1.0,
    traffic: 50000,
    days: 60,
    totalPreds: 3000000,
  });

  const result = simulate(model, s);
  assert.equal(result.retrains, 5);
  assert.equal(expectedRetrains(model, s), 5);
  assert.equal(result.cycle, 10);
  assert.ok(result.minAcc >= 80 - 1e-9);
});

test("policy=absolute: zero retrains when drift never breaches threshold", () => {
  const robustModel = { acc: 95, train: 100, inf: 1, rob: 0.001 };
  const s = makeScenario({ policy: "absolute", tau: 80, days: 60 });

  const result = simulate(robustModel, s);
  assert.equal(result.retrains, 0);
  assert.equal(expectedRetrains(robustModel, s), 0);
});

test("sub-threshold fallback: honors interval when baseline is below tau", () => {
  const lowAccModel = { ...baseModel, acc: 75 };
  const sWithFallback = makeScenario({
    policy: "absolute",
    tau: 80,
    subthresholdRetrain: true,
    subthresholdDays: 12,
    days: 60,
  });

  // 60 days / 12 days = 4 retrains (at day 12, 24, 36, 48; day 60 is end)
  assert.equal(expectedRetrains(lowAccModel, sWithFallback), 4);
  assert.equal(simulate(lowAccModel, sWithFallback).retrains, 4);

  const sWithoutFallback = makeScenario({
    policy: "absolute",
    tau: 80,
    subthresholdRetrain: false,
    days: 60,
  });
  assert.equal(expectedRetrains(lowAccModel, sWithoutFallback), 0);
  assert.equal(simulate(lowAccModel, sWithoutFallback).retrains, 0);
});

test("energy and carbon math: verifies PUE, operational O and embodied M formulas", () => {
  const s = makeScenario({
    watts: 20,
    pue: 1.25,
    gridG: 200,
    embGPerSec: 0.002,
    hardwareUtil: 50, // 50% utilization doubles embodied allocation rate
    days: 30,
    totalPreds: 30000,
  });
  const result = simulate(baseModel, s);

  // Development stage: train (100s) + eval (10,000 * 1ms = 10s) = 110s CPU
  const expectedDevCpuS = 110;
  assert.equal(result.devCpuS, expectedDevCpuS);
  const expectedDevJ = expectedDevCpuS * 20; // 2200 J
  assert.equal(result.devJ, expectedDevJ);

  // Dev operational carbon: (2200 J / 3.6e6) * 1.25 * 200 gCO2e
  const expectedDevKwh = (expectedDevJ / 3600 / 1000) * 1.25;
  const expectedOpDevG = expectedDevKwh * 200;
  assert.ok(Math.abs(result.opDevG - expectedOpDevG) < 1e-9);

  // Embodied carbon rate per sec = 0.002 / 0.50 = 0.004 gCO2e/s
  const expectedEmbDevG = expectedDevCpuS * 0.004;
  assert.ok(Math.abs(result.embDevG - expectedEmbDevG) < 1e-9);

  // Total stage carbon conservation
  assert.ok(Math.abs(result.carbonDevG - (result.opDevG + result.embDevG)) < 1e-9);
  assert.ok(Math.abs(result.carbonDeployG - (result.opDeployG + result.embDeployG)) < 1e-9);
  assert.ok(Math.abs(result.carbonTotalG - (result.opTotalG + result.embTotalG)) < 1e-9);
});

test("Consumer SCI (QA): correctly scales by delivered accurate predictions", () => {
  const s = makeScenario({
    days: 30,
    traffic: 1000,
    totalPreds: 30000,
    policy: "none",
    m: 0.5,
  });
  const result = simulate(baseModel, s);

  const kPreds = 30; // 30,000 / 1,000
  const expectedConsumerSci = result.carbonDeployG / kPreds;
  assert.ok(Math.abs(result.sciConsumer - expectedConsumerSci) < 1e-9);

  const kCorrect = result.correctPreds / 1000;
  const expectedSciQa = result.carbonDeployG / kCorrect;
  assert.ok(Math.abs(result.sciEffective - expectedSciQa) < 1e-9);

  // Because accuracy degrades below 100%, Consumer SCI (QA) MUST be higher than standard Consumer SCI
  assert.ok(result.avgAcc < 100);
  assert.ok(result.sciEffective > result.sciConsumer);

  // Mathematical relationship: sciEffective ~ sciConsumer / (avgAcc / 100) within integer rounding
  const ratio = result.sciEffective / result.sciConsumer;
  const expectedRatio = 100 / result.avgAcc;
  assert.ok(Math.abs(ratio - expectedRatio) < 0.01);
});

test("Provider SCI captures pre-deployment development footprint per model", () => {
  const s = makeScenario();
  const result = simulate(baseModel, s);
  assert.equal(result.sciProvider, result.carbonDevG);
  assert.ok(result.sciProvider > 0);
});

test("static zero-drift scenario (m=0): accuracy stays at baseline", () => {
  const s = makeScenario({ m: 0, policy: "absolute", tau: 80 });
  const result = simulate(baseModel, s);

  assert.equal(result.dailyDrop, 0);
  assert.equal(result.retrains, 0);
  assert.equal(result.avgAcc, baseModel.acc);
  assert.equal(result.minAcc, baseModel.acc);
  assert.equal(result.maxAcc, baseModel.acc);
});
