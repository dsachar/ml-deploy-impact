// Dependency-free lifecycle simulation core shared by the browser app and offline tests.
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MLDeployImpactCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  function simulate(p, s) {
    const driftPerPred = (p.rob / 100000) * s.m;
    const dailyDrop = driftPerPred * s.traffic;

    let cycle = Infinity;
    if (s.policy === "fixed") {
      cycle = s.retrainMonths * 30;
    } else if (s.policy === "absolute") {
      if (p.acc < s.tau) {
        cycle = s.subthresholdRetrain ? Math.min(s.subthresholdDays, s.days) : Infinity;
      } else if (dailyDrop > 0 && s.tau >= s.floor) {
        cycle = Math.max(1, (p.acc - s.tau) / dailyDrop);
      }
    }

    const retrains = cycle < s.days ? Math.floor((s.days - 1e-6) / cycle) : 0;
    const J = sec => sec * s.watts;
    const evalPreds = 10000;
    const initS = p.train;
    const evalInfS = (p.inf / 1000) * evalPreds;
    const devCpuS = initS + evalInfS;
    const initJ = J(initS);
    const evalJ = J(evalInfS);
    const devJ = initJ + evalJ;
    const retrainS = p.train * retrains;
    const infS = (p.inf / 1000) * s.totalPreds;
    const deployCpuS = retrainS + infS;
    const retrainJ = J(retrainS);
    const infJ = J(infS);
    const deployJ = retrainJ + infJ;
    const cpuS = devCpuS + deployCpuS;
    const totalJ = devJ + deployJ;

    const daysToFloor = dailyDrop > 0 ? (p.acc - s.floor) / dailyDrop : Infinity;
    function segArea(dur) {
      if (dur <= 0) return { area: 0, min: p.acc };
      if (dur <= daysToFloor) {
        const end = p.acc - dailyDrop * dur;
        return { area: ((p.acc + end) / 2) * dur, min: end };
      }
      return { area: ((p.acc + s.floor) / 2) * daysToFloor + s.floor * (dur - daysToFloor), min: s.floor };
    }

    let totalArea = 0, minAcc = p.acc;
    if (retrains > 0) {
      const cStat = segArea(cycle);
      totalArea += retrains * cStat.area;
      minAcc = Math.min(minAcc, cStat.min);
      const rem = s.days - retrains * cycle;
      if (rem > 0) {
        const rStat = segArea(rem);
        totalArea += rStat.area;
        minAcc = Math.min(minAcc, rStat.min);
      }
    } else {
      const aStat = segArea(s.days);
      totalArea = aStat.area;
      minAcc = aStat.min;
    }

    const avgAcc = totalArea / s.days;
    const maxAcc = p.acc;
    const correctPreds = Math.round((avgAcc / 100) * s.totalPreds);
    const devFacilityKwh = (devJ / 3600 / 1000) * s.pue;
    const deployFacilityKwh = (deployJ / 3600 / 1000) * s.pue;
    const totalFacilityKwh = (totalJ / 3600 / 1000) * s.pue;
    const opDevG = devFacilityKwh * s.gridG;
    const opDeployG = deployFacilityKwh * s.gridG;
    const opTotalG = totalFacilityKwh * s.gridG;
    const util = Math.max(0.1, s.hardwareUtil / 100);
    const embRateSec = s.embGPerSec / util;
    const embDevG = devCpuS * embRateSec;
    const embDeployG = deployCpuS * embRateSec;
    const embTotalG = cpuS * embRateSec;
    const carbonDevG = opDevG + embDevG;
    const carbonDeployG = opDeployG + embDeployG;
    const carbonTotalG = opTotalG + embTotalG;
    const retrainKwh = (retrainJ / 3600 / 1000) * s.pue;
    const retrainOpG = retrainKwh * s.gridG;
    const retrainEmbG = retrainS * embRateSec;
    const retrainCarbonG = retrainOpG + retrainEmbG;
    const kPreds = s.totalPreds / 1000;
    const kCorrect = correctPreds / 1000;
    const sciConsumer = kPreds > 0 ? carbonDeployG / kPreds : 0;
    const sciEffective = kCorrect > 0 ? carbonDeployG / kCorrect : 0;

    return {
      cycle, retrains, avgAcc, minAcc, maxAcc, correctPreds, dailyDrop, evalPreds,
      devCpuS, deployCpuS, cpuS, initJ, evalJ, devJ, retrainJ, infJ, deployJ, totalJ,
      whPerK: totalJ / 3600 / (correctPreds / 1000),
      opDevG, opDeployG, opTotalG, embDevG, embDeployG, embTotalG,
      carbonDevG, carbonDeployG, carbonTotalG, retrainCarbonG,
      sciConsumer, sciEffective, sciProvider: carbonDevG,
      sciLifecycle: kPreds > 0 ? carbonTotalG / kPreds : 0,
    };
  }

  function expectedRetrains(p, s) {
    if (s.policy === "none") return 0;
    if (s.policy === "fixed") {
      return Math.max(0, Math.floor((s.days - 1e-6) / (s.retrainMonths * 30)));
    }
    const dailyDrop = (p.rob / 100000) * s.m * s.traffic;
    if (s.policy === "absolute") {
      if (p.acc < s.tau) {
        if (!s.subthresholdRetrain) return 0;
        return Math.max(0, Math.floor((s.days - 1e-6) / Math.min(s.subthresholdDays, s.days)));
      }
      if (dailyDrop <= 0 || s.tau < s.floor) return 0;
      return Math.max(0, Math.floor((s.days - 1e-6) / Math.max(1, (p.acc - s.tau) / dailyDrop)));
    }
    return 0;
  }

  const expectedCostJ = (p, s) =>
    (expectedRetrains(p, s) * p.train + (p.inf / 1000) * s.totalPreds) * s.watts;

  return { simulate, expectedRetrains, expectedCostJ };
});
