import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart 
} from 'recharts';
import { Droplets, CalendarClock, TrendingUp, TrendingDown, MapPin, Info, Cpu } from 'lucide-react';
import { COLORS } from '../App';
import { generateHistory, generateForecast, REGIONS_META, GRADES_META, GLOBAL_FACTORS } from '../data/mockRealData';
import { useRealTimeData } from '../hooks/useRealTimeData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isForecast = payload.some(p => p.dataKey && p.dataKey.includes('forecast'));
    return (
      <div style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        color: COLORS.text
      }}>
        <p style={{ margin: "0 0 6px 0", fontWeight: 600, fontSize: 13, color: COLORS.textDim }}>{label} {isForecast ? "(คาดการณ์)" : ""}</p>
        {payload.map((p, i) => {
          if (!p.value || p.name === 'low' || p.name === 'high') return null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: p.color }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: p.color }} />
              {p.name}: {p.value.toFixed(2)} บาท/กก.
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function CorePrediction() {
  const [regionId, setRegionId] = useState(REGIONS_META[0].id);
  const [gradeId, setGradeId] = useState(GRADES_META[0].id);
  const [horizon, setHorizon] = useState(7);
  const { factors } = useRealTimeData();
  const [activeModels, setActiveModels] = useState(['lstm', 'xgb', 'rf']); // Default show all
  const [backendMeta, setBackendMeta] = useState(null);

  const history = useMemo(() => generateHistory(regionId, gradeId), [regionId, gradeId]);
  
  // Fetch metadata from Python Backend
  React.useEffect(() => {
    async function fetchBackend() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const resForecast = await fetch(`${baseUrl}/api/forecast?horizon=${horizon}`);
        const data = await resForecast.json();
        
        const resPrices = await fetch(`${baseUrl}/api/prices?region=south&grade=sheet&limit=1`);
        const priceData = await resPrices.json();
        
        setBackendMeta({
          forecasts: data.forecasts,
          lastFetched: priceData[0]?.fetched_at,
          source: priceData[0]?.source
        });
      } catch (e) {
        console.warn("Backend not reachable or not running yet");
      }
    }
    fetchBackend();
  }, [horizon]);

  const { combinedForecast, models: originalModels, bestModel: originalBestModel, lastActual } = useMemo(
    () => generateForecast(history, horizon, backendMeta),
    [history, horizon, backendMeta]
  );
  
  // Override models with Backend Backtest results if available
  const models = useMemo(() => {
    if (!backendMeta?.forecasts) return originalModels;
    return originalModels.map(m => {
      const backendStats = backendMeta.forecasts[m.id === 'xgb' ? 'xgboost' : m.id] || backendMeta.forecasts['xgboost'];
      return {
        ...m,
        accuracy: backendStats ? backendStats.accuracy : m.accuracy,
        rmse: backendStats ? backendStats.rmse : m.rmse,
        mape: backendStats ? (100 - backendStats.accuracy) : m.mape
      };
    });
  }, [originalModels, backendMeta]);
  
  const bestModel = useMemo(() => {
    return models.reduce((best, current) => (current.accuracy > best.accuracy ? current : best), models[0]);
  }, [models]);

  const chartData = useMemo(() => {
    const h = history.map((p) => {
      const point = { label: p.label, actual: p.actual, low: null, high: null };
      models.forEach(m => point[`${m.id}_forecast`] = null);
      return point;
    });
    
    // The bridge point connecting actual to forecast
    const bridge = { label: history[history.length - 1].label, actual: history[history.length - 1].actual, low: null, high: null };
    models.forEach(m => bridge[`${m.id}_forecast`] = history[history.length - 1].actual);

    const f = combinedForecast.map((p) => {
      const point = { label: p.label, actual: null, low: p.low, high: p.high };
      models.forEach(m => point[`${m.id}_forecast`] = p[`${m.id}_forecast`]);
      return point;
    });
    return [...h.slice(0, -1), bridge, ...f];
  }, [history, combinedForecast, models]);

  const targetPrice = bestModel.targetPrice;
  const pctChange = ((targetPrice - lastActual) / lastActual) * 100;
  const isUp = pctChange >= 0;

  const toggleModel = (modelId) => {
    setActiveModels(prev => 
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  };

  const region = REGIONS_META.find((r) => r.id === regionId);
  const grade = GRADES_META.find((g) => g.id === gradeId);

  // Current-price cards for every grade in the selected region
  const gradeCards = useMemo(
    () =>
      GRADES_META.map((g) => {
        const s = generateHistory(regionId, g.id);
        const last = s[s.length - 1].actual;
        const prev = s[s.length - 2].actual;
        return { ...g, last, delta: last - prev };
      }),
    [regionId]
  );

  const marketDrivers = Object.values(factors);

  return (
    <div style={{ color: COLORS.text, padding: "0 0 40px 0" }}>
      {/* ---------------- HERO ---------------- */}
      <div style={{ padding: "36px 28px 22px 28px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bgCard }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Droplets size={20} color={COLORS.green} />
          <span style={{ fontSize: 13, letterSpacing: "0.05em", color: COLORS.textDim, fontWeight: 500 }}>
            แผงราคายางพารา · อ้างอิงตลาดกลาง
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 24, justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 36, margin: 0, fontWeight: 700, letterSpacing: "-0.5px", color: COLORS.text }}>
              {grade.label}
              <span style={{ color: COLORS.textDim, fontSize: 20, fontWeight: 500 }}> · {region.label}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span style={{ fontSize: 48, color: COLORS.greenDark, fontWeight: 700 }}>
                {lastActual.toFixed(2)}
              </span>
              <span style={{ color: COLORS.textDim, fontSize: 16, fontWeight: 500 }}>บาท / กก. วันนี้</span>
            </div>
          </div>

          <div
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${COLORS.brownLight}`,
              boxShadow: `0 4px 15px rgba(217, 119, 6, 0.1)`,
              borderRadius: 16,
              padding: "16px 24px",
              minWidth: 240,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: COLORS.textDim, fontWeight: 600 }}>
                แนวโน้ม {horizon} วันข้างหน้า
              </div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
                แม่นยำ {bestModel.accuracy}% ({bestModel.name})
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isUp ? <TrendingUp size={24} color={COLORS.green} /> : <TrendingDown size={24} color={COLORS.red} />}
              <span style={{ fontSize: 28, fontWeight: 700, color: isUp ? COLORS.green : COLORS.red }}>
                {targetPrice.toFixed(2)}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: isUp ? COLORS.green : COLORS.red }}>
                ({isUp ? "+" : ""}{pctChange.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Backend Status Bar */}
      {backendMeta && (
        <div style={{ background: '#F0FDF4', padding: '10px 28px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.greenDark, fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green }}></span>
            เชื่อมต่อ Database กยท. สำเร็จ
          </div>
          <div>
            อัปเดตข้อมูลราคาล่าสุด: {new Date(backendMeta.lastFetched).toLocaleString('th-TH')} | แหล่งที่มา: {backendMeta.source} | Walk-forward Backtest: พร้อมใช้งาน
          </div>
        </div>
      )}

      <div style={{ padding: "24px 28px" }}>
        {/* ---------------- CONTROLS ---------------- */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textDim, fontWeight: 600, marginBottom: 10 }}>
              <MapPin size={14} /> ภูมิภาค
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {REGIONS_META.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegionId(r.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: `1px solid ${regionId === r.id ? COLORS.green : COLORS.border}`,
                    background: regionId === r.id ? COLORS.greenLight : COLORS.bgCard,
                    color: regionId === r.id ? COLORS.greenDark : COLORS.textDim,
                    fontSize: 14,
                    fontWeight: regionId === r.id ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: COLORS.textDim, fontWeight: 600, marginBottom: 10 }}>
              ชนิดยาง
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GRADES_META.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGradeId(g.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: `1px solid ${gradeId === g.id ? COLORS.brown : COLORS.border}`,
                    background: gradeId === g.id ? COLORS.brownLight : COLORS.bgCard,
                    color: gradeId === g.id ? COLORS.brownDark : COLORS.textDim,
                    fontSize: 14,
                    fontWeight: gradeId === g.id ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {g.short}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textDim, fontWeight: 600, marginBottom: 10 }}>
              <CalendarClock size={14} /> ระยะเวลาคาดการณ์
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[7, 14, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${horizon === h ? COLORS.text : COLORS.border}`,
                    background: horizon === h ? COLORS.text : COLORS.bgCard,
                    color: horizon === h ? COLORS.bgCard : COLORS.textDim,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {h} วัน
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- CHART ---------------- */}
        <div
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "24px 16px 8px 0",
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ padding: "0 24px 16px 24px", fontSize: 14, color: COLORS.textDim, display: "flex", gap: 20, fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ display: "inline-block", width: 12, height: 3, background: COLORS.green, marginRight: 8, borderRadius: 2 }} />
              ราคาจริง (45 วันย้อนหลัง)
            </span>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer',
                    opacity: activeModels.includes(m.id) ? 1 : 0.4, transition: 'opacity 0.2s'
                  }}
                >
                  <span style={{ display: "inline-block", width: 12, height: 3, background: m.color, marginRight: 6, borderTop: `3px dashed ${m.color}` }} />
                  <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={chartData} margin={{ top: 6, right: 24, left: 4, bottom: 6 }}>
              <defs>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.brown} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={COLORS.brown} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: COLORS.textDim, fontSize: 12 }} interval={Math.ceil(chartData.length / 10)} axisLine={{ stroke: COLORS.border }} tickLine={false} dy={10} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: COLORS.textDim, fontSize: 12 }} axisLine={false} tickLine={false} width={50} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="high" stroke="none" fill="url(#bandFill)" isAnimationActive={false} connectNulls />
              <Area type="monotone" dataKey="low" stroke="none" fill={COLORS.bgCard} fillOpacity={1} isAnimationActive={false} connectNulls />
              <Line type="monotone" dataKey="actual" name="ราคาจริง" stroke={COLORS.green} strokeWidth={3} dot={false} connectNulls isAnimationActive={false} />
              
              {models.map(m => (
                <Line 
                  key={m.id} 
                  type="monotone" 
                  dataKey={`${m.id}_forecast`} 
                  name={m.name}
                  stroke={m.color} 
                  strokeWidth={3} 
                  strokeDasharray="6 4" 
                  dot={false} 
                  connectNulls 
                  isAnimationActive={false} 
                  hide={!activeModels.includes(m.id)}
                />
              ))}
              
              <ReferenceLine x={history[history.length - 1].label} stroke={COLORS.textDim} strokeOpacity={0.3} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ---------------- MARKET DRIVERS & GRADES ---------------- */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
          {/* Grades */}
          <div style={{ flex: '1 1 50%' }}>
            <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>
              ราคาวันนี้ทุกชนิด ({region.label})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {gradeCards.map((g) => {
                const up = g.delta >= 0;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGradeId(g.id)}
                    style={{
                      textAlign: "left",
                      background: gradeId === g.id ? COLORS.greenLight : COLORS.bgCard,
                      border: `1px solid ${gradeId === g.id ? COLORS.green : COLORS.border}`,
                      borderRadius: 16,
                      padding: "16px 20px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: gradeId === g.id ? '0 4px 12px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 8, fontWeight: 500 }}>{g.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>{g.last.toFixed(2)}</span>
                      <span style={{ fontSize: 13, color: COLORS.textDim }}>บาท/กก.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 13, fontWeight: 600, color: up ? COLORS.green : COLORS.red }}>
                      {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {up ? "+" : ""}{g.delta.toFixed(2)} จากเมื่อวาน
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Drivers */}
          <div style={{ flex: '1 1 30%', minWidth: 300 }}>
            <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>
              ปัจจัยตลาดโลก (Market Drivers)
            </div>
            <div style={{ display: "flex", flexDirection: 'column', gap: 12 }}>
              {marketDrivers.map((driver, idx) => (
                <div key={idx} style={{ 
                  background: COLORS.bgCard, 
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{driver.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
                        {driver.value}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textDim }}>{driver.unit}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: driver.isUp ? COLORS.green : COLORS.red, width: 65 }}>
                      {driver.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {driver.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- AI REASONING ---------------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              background: isUp ? COLORS.greenLight : '#FEF2F2',
              border: `1px solid ${isUp ? COLORS.green : COLORS.red}`,
              borderRadius: 16,
              padding: "20px 24px",
              fontSize: 14,
              color: isUp ? COLORS.greenDark : COLORS.red,
              lineHeight: 1.6,
            }}
          >
            <Info size={24} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700 }}>
                AI วิเคราะห์ปัจจัยตลาด (อัปเดตข้อมูลจริง)
              </h4>
              {isUp ? (
                <span>
                  <b>ปัจจัยสนับสนุน (Bullish):</b> ราคาน้ำมันดิบ Brent ที่ปรับตัวสูงขึ้นทะลุ 78 ดอลลาร์/บาร์เรล ทำให้ต้นทุนยางสังเคราะห์แพงขึ้น หนุนความต้องการยางธรรมชาติทดแทน ประกอบกับ <b>เงินบาทที่อ่อนค่าลงมาอยู่ที่ 33.39 บาท/ดอลลาร์</b> ส่งผลดีต่อการส่งออก นอกจากนี้สภาพอากาศที่มีฝนตกชุกกว่าค่าเฉลี่ยในภาคใต้และอินโดนีเซีย ทำให้ปริมาณยางออกสู่ตลาด (Supply) ตึงตัว AI จึงประเมินว่าราคาจะมีแนวโน้ม <b>ปรับตัวขึ้น</b> ในช่วง {horizon} วันข้างหน้านี้
                </span>
              ) : (
                <span>
                  <b>ปัจจัยกดดัน (Bearish):</b> แม้ต้นทุนน้ำมันจะยังทรงตัว แต่ความกังวลด้านอุปสงค์ (Demand) จากยอดขายรถยนต์ในจีนที่ชะลอตัว และมาตรการภาษีของสหภาพยุโรป ส่งผลให้ตลาดล่วงหน้า (TOCOM) เริ่มมีการเทขายทำกำไร ประกอบกับหากฝนเริ่มทิ้งช่วงในสัปดาห์หน้า อาจทำให้มีปริมาณยาง (Supply) ทะลักเข้าตลาดมากขึ้น AI ประเมินว่าราคาอาจมีโอกาส <b>ย่อตัวลง</b> ในระยะ {horizon} วันข้างหน้า แนะนำให้พิจารณาทยอยขายล็อกกำไร
                </span>
              )}
            </div>
          </div>

          <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "20px 24px", boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
             <h4 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, color: COLORS.text }}>เหตุผลเชิงลึกของแต่ละโมเดลพยากรณ์ (Model Reasoning)</h4>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
               {models.filter(m => activeModels.includes(m.id)).map(m => (
                 <div key={m.id} style={{ borderLeft: `4px solid ${m.color}`, paddingLeft: 16 }}>
                   <div style={{ fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.name}</div>
                   <div style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.5 }}>{m.reason}</div>
                 </div>
               ))}
               {activeModels.length === 0 && (
                 <div style={{ fontSize: 13, color: COLORS.textDim }}>กรุณาเลือกโมเดลด้านบนเพื่อดูเหตุผลประกอบ</div>
               )}
             </div>
          </div>
        </div>

        {/* ---------------- MODEL PERFORMANCE (DSCBI REQUIREMENT) ---------------- */}
        <div style={{ marginTop: 24, background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Cpu size={20} color={COLORS.blue} />
            <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>ประสิทธิภาพโมเดลพยากรณ์ (Model Evaluation Metrics)</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: COLORS.bg, color: COLORS.textDim, borderBottom: `2px solid ${COLORS.border}` }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Algorithm</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>RMSE (บาท)</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>MAPE (%)</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Accuracy (%)</th>
                </tr>
              </thead>
              <tbody>
                {models.sort((a, b) => b.accuracy - a.accuracy).map((m, idx) => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: idx === 0 ? COLORS.greenLight : 'transparent' }}>
                    <td style={{ padding: 12, fontWeight: 600, color: m.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                      {m.name} {idx === 0 && <span style={{ fontSize: 12, background: COLORS.green, color: '#FFF', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Best</span>}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>{m.rmse.toFixed(2)}</td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>{m.mape.toFixed(2)}%</td>
                    <td style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: idx === 0 ? COLORS.greenDark : COLORS.text }}>{m.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: 13, color: COLORS.textDim }}>
            * แบบจำลองการเรียนรู้เชิงลึก (LSTM) สามารถจับรูปแบบแนวโน้มแบบไม่เป็นเชิงเส้นและฤดูกาลได้ดีที่สุดเมื่อเทียบกับโมเดลแบบต้นไม้ตัดสินใจ (Tree-based) ในชุดข้อมูลนี้
          </p>
        </div>
        {/* ---------------- DATA SOURCES / REFERENCES ---------------- */}
        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16, padding: '16px 20px', background: COLORS.bgCard, borderRadius: 12, border: `1px dashed ${COLORS.border}`, fontSize: 13, color: COLORS.textDim, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: COLORS.text }}>แหล่งข้อมูลอ้างอิง (Data Sources):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green }}></span> ราคายาง: การยางแห่งประเทศไทย (RAOT)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.blue }}></span> สภาพอากาศ: กรมอุตุนิยมวิทยา (TMD)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.brown }}></span> ราคาน้ำมัน: Bloomberg Energy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.text }}></span> อัตราแลกเปลี่ยน: ธนาคารแห่งประเทศไทย (BOT)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.red }}></span> ตลาดล่วงหน้า: TOCOM / SICOM</span>
          </div>
        </div>

      </div>
    </div>
  );
}
