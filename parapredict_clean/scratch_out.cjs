// src/data/mockRealData.js
var LATEST_PRICES = {
  south: { sheet: 85.8, latex: 78.3, cup: 68.5, rss3: 91.5 },
  east: { sheet: 82.5, latex: 77, cup: 66.5, rss3: 90 },
  northeast: { sheet: 80, latex: 75.5, cup: 67, rss3: 83 },
  north: { sheet: 78.5, latex: 74, cup: 64, rss3: 80.5 },
  central: { sheet: 79.5, latex: 75, cup: 65.5, rss3: 81.5 }
};
function generateHistory(regionId, gradeId) {
  const basePrice = LATEST_PRICES[regionId][gradeId];
  const history = [];
  let seed = regionId.length + gradeId.length;
  const random = () => {
    const x = Math.sin(seed++) * 1e4;
    return x - Math.floor(x);
  };
  let currentPrice = basePrice - 5;
  const today = /* @__PURE__ */ new Date();
  for (let i = 45; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    if (i === 0) {
      currentPrice = basePrice;
    } else {
      const step = (basePrice - currentPrice) / i;
      const noise = (random() - 0.5) * 1.5;
      currentPrice += step + noise;
    }
    history.push({
      date: d,
      label: dateStr,
      actual: Number(currentPrice.toFixed(2))
    });
  }
  return history;
}
function generateForecast(history, horizonDays = 7) {
  const recent = history.slice(-14);
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = recent.length;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recent[i].actual;
    sumXY += i * recent[i].actual;
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const lastActual = history[history.length - 1].actual;
  const lastDate = history[history.length - 1].date;
  const combinedForecast = [];
  const modelsInfo = [
    { id: "rf", name: "Random Forest", color: "#10B981", noise: 0.6, slopeAdj: 0.9, rmse: 1.24, mape: 3.5, accuracy: 88.5, reason: "\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C\u0E08\u0E32\u0E01\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E31\u0E21\u0E1E\u0E31\u0E19\u0E18\u0E4C\u0E40\u0E0A\u0E34\u0E07\u0E25\u0E36\u0E01\u0E02\u0E2D\u0E07 45 \u0E27\u0E31\u0E19\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 \u0E08\u0E31\u0E1A\u0E41\u0E1E\u0E17\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E01\u0E32\u0E23\u0E41\u0E01\u0E27\u0E48\u0E07\u0E15\u0E31\u0E27\u0E23\u0E30\u0E22\u0E30\u0E2A\u0E31\u0E49\u0E19\u0E44\u0E14\u0E49\u0E14\u0E35 \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E44\u0E27\u0E15\u0E48\u0E2D\u0E02\u0E48\u0E32\u0E27\u0E43\u0E2B\u0E21\u0E48" },
    { id: "xgb", name: "XGBoost", color: "#F59E0B", noise: 1.2, slopeAdj: 1.1, rmse: 0.98, mape: 2.8, accuracy: 91.2, reason: "\u0E43\u0E2B\u0E49\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E43\u0E19\u0E23\u0E30\u0E22\u0E30\u0E2A\u0E31\u0E49\u0E19 (Boost) \u0E16\u0E49\u0E32\u0E23\u0E32\u0E04\u0E32\u0E21\u0E35\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E40\u0E17\u0E23\u0E19\u0E14\u0E4C\u0E01\u0E30\u0E17\u0E31\u0E19\u0E2B\u0E31\u0E19 XGBoost \u0E08\u0E30\u0E44\u0E27\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14" },
    { id: "lstm", name: "LSTM (Deep Learning)", color: "#8B5CF6", noise: 0.4, slopeAdj: 0.75, rmse: 0.85, mape: 2.1, accuracy: 93.4, reason: "\u0E08\u0E14\u0E08\u0E33\u0E04\u0E27\u0E32\u0E21\u0E17\u0E23\u0E07\u0E08\u0E33\u0E23\u0E30\u0E22\u0E30\u0E22\u0E32\u0E27 (Long-Term Memory) \u0E41\u0E25\u0E30\u0E40\u0E02\u0E49\u0E32\u0E43\u0E08\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21\u0E23\u0E30\u0E22\u0E30\u0E22\u0E32\u0E27\u0E44\u0E14\u0E49\u0E14\u0E35 \u0E08\u0E36\u0E07\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E44\u0E14\u0E49\u0E19\u0E38\u0E48\u0E21\u0E19\u0E27\u0E25\u0E41\u0E25\u0E30\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33\u0E2A\u0E39\u0E07" },
    { id: "arima", name: "ARIMA", color: "#3B82F6", noise: 0.5, slopeAdj: 1, rmse: 1.45, mape: 4.1, accuracy: 85.2, reason: "\u0E2D\u0E34\u0E07\u0E15\u0E32\u0E21\u0E04\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E40\u0E04\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A\u0E14\u0E31\u0E49\u0E07\u0E40\u0E14\u0E34\u0E21 (Moving Average) \u0E21\u0E31\u0E01\u0E08\u0E30\u0E43\u0E2B\u0E49\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2A\u0E49\u0E19\u0E15\u0E23\u0E07\u0E15\u0E32\u0E21\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21\u0E40\u0E14\u0E34\u0E21\u0E17\u0E35\u0E48\u0E40\u0E04\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E21\u0E32" },
    { id: "prophet", name: "Prophet", color: "#EC4899", noise: 0.8, slopeAdj: 0.85, rmse: 1.1, mape: 3.2, accuracy: 89.8, reason: "\u0E40\u0E01\u0E48\u0E07\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E27\u0E31\u0E19\u0E2B\u0E22\u0E38\u0E14\u0E41\u0E25\u0E30\u0E24\u0E14\u0E39\u0E01\u0E32\u0E25 (Seasonality) \u0E2B\u0E32\u0E01\u0E43\u0E01\u0E25\u0E49\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E0A\u0E48\u0E27\u0E07\u0E1B\u0E34\u0E14\u0E01\u0E23\u0E35\u0E14\u0E22\u0E32\u0E07 Prophet \u0E08\u0E30\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C\u0E23\u0E32\u0E04\u0E32\u0E1E\u0E38\u0E48\u0E07\u0E02\u0E36\u0E49\u0E19\u0E17\u0E31\u0E19\u0E17\u0E35" },
    { id: "svr", name: "SVR (SVM)", color: "#6366F1", noise: 0.9, slopeAdj: 0.95, rmse: 1.35, mape: 3.8, accuracy: 87.5, reason: "\u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 (Margin) \u0E0A\u0E48\u0E27\u0E22\u0E01\u0E23\u0E2D\u0E07\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E23\u0E1A\u0E01\u0E27\u0E19 (Noise) \u0E2D\u0E2D\u0E01\u0E44\u0E1B \u0E17\u0E33\u0E43\u0E2B\u0E49\u0E44\u0E21\u0E48\u0E15\u0E37\u0E48\u0E19\u0E15\u0E23\u0E30\u0E2B\u0E19\u0E01\u0E15\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E2A\u0E27\u0E34\u0E07\u0E15\u0E31\u0E27\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27" }
  ];
  let currentVals = { rf: lastActual, xgb: lastActual, lstm: lastActual, arima: lastActual, prophet: lastActual, svr: lastActual };
  for (let i = 1; i <= horizonDays; i++) {
    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() + i);
    const dateStr = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    const point = { date: d, label: dateStr };
    const maxUncertainty = i * 0.5;
    modelsInfo.forEach((m) => {
      const pseudoRandom = Math.sin(i * m.noise) * 0.8;
      currentVals[m.id] += slope * m.slopeAdj + pseudoRandom;
      if (currentVals[m.id] > lastActual + 15) currentVals[m.id] -= 1;
      if (currentVals[m.id] < lastActual - 15) currentVals[m.id] += 1;
      point[`${m.id}_forecast`] = Number(currentVals[m.id].toFixed(2));
    });
    point.low = Number((currentVals.xgb - maxUncertainty).toFixed(2));
    point.high = Number((currentVals.xgb + maxUncertainty).toFixed(2));
    combinedForecast.push(point);
  }
  const models = modelsInfo.map((m) => ({
    ...m,
    targetPrice: combinedForecast[combinedForecast.length - 1][`${m.id}_forecast`]
  }));
  const bestModel = models.reduce((prev, curr) => prev.accuracy > curr.accuracy ? prev : curr);
  return { combinedForecast, models, bestModel, lastActual };
}

// scratch_run.js
try {
  const h = generateHistory("south", "sheet");
  const f = generateForecast(h, 7);
  console.log("OK", f.bestModel.name);
} catch (e) {
  console.error("ERROR", e);
}
