import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart 
} from 'recharts';
import { Calendar, MapPin, Leaf, Filter } from 'lucide-react';
import { COLORS } from '../App';
import { generateLongHistory, generate10YearHistory, PROVINCES_META, GRADES_META } from '../data/mockRealData';

const MONTHS = [
  { id: 0, label: "ทั้งปี" },
  { id: 1, label: "มกราคม" },
  { id: 2, label: "กุมภาพันธ์" },
  { id: 3, label: "มีนาคม" },
  { id: 4, label: "เมษายน" },
  { id: 5, label: "พฤษภาคม" },
  { id: 6, label: "มิถุนายน" },
  { id: 7, label: "กรกฎาคม" },
  { id: 8, label: "สิงหาคม" },
  { id: 9, label: "กันยายน" },
  { id: 10, label: "ตุลาคม" },
  { id: 11, label: "พฤศจิกายน" },
  { id: 12, label: "ธันวาคม" },
];

const YEARS = [0, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]; // 0 means all 10 years

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        color: COLORS.text
      }}>
        <p style={{ margin: "0 0 6px 0", fontWeight: 600, fontSize: 13, color: COLORS.textDim }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: COLORS.greenDark }}>
          {payload[0].value.toFixed(2)} บาท/กก.
        </div>
      </div>
    );
  }
  return null;
};

export default function HistoricalData() {
  const [year, setYear] = useState(YEARS[0]);
  const [month, setMonth] = useState(0); // 0 means all year
  const [provinceId, setProvinceId] = useState(PROVINCES_META[0].id);
  const [gradeId, setGradeId] = useState(GRADES_META[0].id);

  // Generate the long history for the selected year, province, and grade
  const fullYearData = useMemo(() => {
    if (year === 0) {
      return generate10YearHistory(provinceId, gradeId);
    }
    return generateLongHistory(year, provinceId, gradeId);
  }, [year, provinceId, gradeId]);

  // Filter data if a specific month is selected
  const chartData = useMemo(() => {
    if (month === 0) return fullYearData;
    return fullYearData.filter(d => d.month === month);
  }, [fullYearData, month]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 };
    let sum = 0, min = Infinity, max = -Infinity;
    chartData.forEach(d => {
      sum += d.actual;
      if (d.actual < min) min = d.actual;
      if (d.actual > max) max = d.actual;
    });
    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: (sum / chartData.length).toFixed(2)
    };
  }, [chartData]);

  const province = PROVINCES_META.find(p => p.id === provinceId);
  const grade = GRADES_META.find(g => g.id === gradeId);
  const monthLabel = MONTHS.find(m => m.id === month).label;

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text, paddingBottom: 60 }}>
      <h2 style={{ fontSize: 24, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10, color: COLORS.text }}>
        <Calendar color={COLORS.green} /> 
        ระบบข้อมูลราคาย้อนหลัง
      </h2>
      <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 24 }}>
        สืบค้นและวิเคราะห์แนวโน้มราคายางพาราในอดีต แยกตามจังหวัดและประเภทยาง เพื่อประกอบการตัดสินใจ
      </div>

      <div style={{ 
        background: COLORS.bgCard, 
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 16, fontWeight: 700, color: COLORS.text }}>
          <Filter size={18} color={COLORS.brown} /> ตัวกรองข้อมูล
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {/* Year Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>
              ปี (พ.ศ.)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 8,
                    border: `1px solid ${year === y ? COLORS.green : COLORS.border}`,
                    background: year === y ? COLORS.greenLight : COLORS.bg,
                    color: year === y ? COLORS.greenDark : COLORS.textDim,
                    fontWeight: year === y ? 700 : 500,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {y === 0 ? "10 ปีล่าสุด" : y + 543}
                </button>
              ))}
            </div>
          </div>

          {/* Month Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>
              เดือน
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                width: '100%', padding: "10px", borderRadius: 8,
                border: `1px solid ${COLORS.border}`, background: COLORS.bg,
                color: COLORS.text, fontWeight: 500, outline: 'none'
              }}
            >
              {MONTHS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Province Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>
              <MapPin size={14} /> จังหวัด
            </label>
            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              style={{
                width: '100%', padding: "10px", borderRadius: 8,
                border: `1px solid ${COLORS.border}`, background: COLORS.bg,
                color: COLORS.text, fontWeight: 500, outline: 'none'
              }}
            >
              {PROVINCES_META.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>
              <Leaf size={14} /> ชนิดยาง
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              style={{
                width: '100%', padding: "10px", borderRadius: 8,
                border: `1px solid ${COLORS.border}`, background: COLORS.bg,
                color: COLORS.text, fontWeight: 500, outline: 'none'
              }}
            >
              {GRADES_META.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 4 }}>ราคาสูงสุด</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.greenDark }}>{stats.max} <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>บาท/กก.</span></div>
        </div>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 4 }}>ราคาเฉลี่ย</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.brownDark }}>{stats.avg} <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>บาท/กก.</span></div>
        </div>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 4 }}>ราคาต่ำสุด</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.red }}>{stats.min} <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>บาท/กก.</span></div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ 
        background: COLORS.bgCard, 
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "24px 16px 16px 16px",
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: "0 8px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
            กราฟแสดงราคาย้อนหลัง ({monthLabel} {year === 0 ? '10 ปีล่าสุด' : `ปี ${year + 543}`})
          </div>
          <div style={{ fontSize: 14, color: COLORS.textDim, fontWeight: 500 }}>
            {grade.label} · จังหวัด{province.label}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: COLORS.textDim, fontSize: 12 }} 
                interval={Math.ceil(chartData.length / 12)} 
                axisLine={{ stroke: COLORS.border }} 
                tickLine={false} 
                dy={10} 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: COLORS.textDim, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke={COLORS.green} 
                strokeWidth={3} 
                fill="url(#histFill)" 
                isAnimationActive={false} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim }}>
            ไม่มีข้อมูลสำหรับช่วงเวลาที่เลือก
          </div>
        )}
      </div>

    </div>
  );
}
