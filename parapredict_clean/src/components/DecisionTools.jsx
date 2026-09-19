import React, { useState } from 'react';
import { Bot, CalendarDays, CloudRain, Sun, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { COLORS } from '../App';
import { LATEST_PRICES } from '../data/mockRealData';

const REGIONS = [
  { id: 'south', label: 'ภาคใต้ (สุราษฎร์ธานี)', lat: 9.140, lon: 99.333 },
  { id: 'east', label: 'ภาคตะวันออก (ระยอง)', lat: 12.681, lon: 101.281 },
  { id: 'northeast', label: 'ภาคอีสาน (บึงกาฬ)', lat: 18.360, lon: 103.652 },
  { id: 'north', label: 'ภาคเหนือ (เชียงราย)', lat: 19.908, lon: 99.832 },
];

export default function DecisionTools() {
  const [stock, setStock] = useState(1500);
  const [type, setType] = useState('cup');
  const [showResult, setShowResult] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [calendar, setCalendar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedRegion.lat}&longitude=${selectedRegion.lon}&daily=weathercode,precipitation_probability_max,precipitation_sum&timezone=Asia%2FBangkok&forecast_days=14`);
        const data = await res.json();
        
        if (data && data.daily) {
          const newCalendar = data.daily.time.map((timeStr, i) => {
            const d = new Date(timeStr);
            const code = data.daily.weathercode[i];
            const prob = data.daily.precipitation_probability_max[i] || 0;
            const precipSum = data.daily.precipitation_sum[i] || 0;
            
            let weather = 'sun';
            let label = 'แดดออก กรีดได้ปกติ';
            let color = COLORS.brown;
            let icon = <Sun size={20} color={COLORS.brown} />;
            
            // Logic to determine tapping suitability based on rain volume
            if (code >= 51 && precipSum > 8) {
              weather = 'rain';
              label = 'ฝนตกหนัก ห้ามกรีด';
              color = COLORS.blue;
              icon = <CloudRain size={20} color={COLORS.blue} />;
            } else if (code >= 51 && precipSum > 2) {
              weather = 'drizzle';
              label = 'มีฝนปรอยๆ ควรระวัง';
              color = COLORS.blue;
              icon = <CloudRain size={20} color={COLORS.blue} />;
            } else if (code >= 3 && code <= 48 || (code >= 51 && precipSum <= 2)) {
               weather = 'cloudy';
               label = 'เมฆมาก กรีดได้ปกติ';
               color = COLORS.textDim;
               icon = <CloudRain size={20} color={COLORS.textDim} />;
            } else {
               weather = 'good'; 
               label = 'แดดออก กรีดได้ปกติ';
               color = COLORS.greenDark;
               icon = <Sun size={20} color={COLORS.greenDark} />;
            }

            return {
              date: d,
              weather,
              label,
              color,
              icon,
              prob,
              precipSum
            };
          });
          setCalendar(newCalendar);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
      setIsLoading(false);
    };
    fetchWeather();
  }, [selectedRegion]);

  const handlePredict = () => {
    setShowResult(true);
  };

  const currentPrice = type === 'cup' ? LATEST_PRICES.south.cup : LATEST_PRICES.south.sheet;

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text }}>
      
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        
        {/* LEFT: AI ASSISTANT */}
        <div style={{ flex: '1 1 40%', minWidth: 350 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <Bot color={COLORS.green} /> 
            AI ผู้ช่วยประเมินการขาย
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            คำนวณต้นทุนเก็บรักษาเทียบกับแนวโน้มราคา อ้างอิงราคากลางภาคใต้
          </div>

          <div style={{ 
            background: COLORS.bgCard, 
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: COLORS.text, fontWeight: 600, marginBottom: 8 }}>ชนิดยางในมือ</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => { setType('cup'); setShowResult(false); }}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: type === 'cup' ? COLORS.greenLight : COLORS.bg,
                    border: `1px solid ${type === 'cup' ? COLORS.green : COLORS.border}`,
                    color: type === 'cup' ? COLORS.greenDark : COLORS.textDim,
                    fontWeight: type === 'cup' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ยางก้อนถ้วย ({LATEST_PRICES.south.cup} ฿)
                </button>
                <button 
                  onClick={() => { setType('sheet'); setShowResult(false); }}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: type === 'sheet' ? COLORS.greenLight : COLORS.bg,
                    border: `1px solid ${type === 'sheet' ? COLORS.green : COLORS.border}`,
                    color: type === 'sheet' ? COLORS.greenDark : COLORS.textDim,
                    fontWeight: type === 'sheet' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ยางแผ่น ({LATEST_PRICES.south.sheet} ฿)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, color: COLORS.text, fontWeight: 600, marginBottom: 8 }}>
                ปริมาณที่มี (กิโลกรัม)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 16px' }}>
                <Package size={18} color={COLORS.textDim} style={{ marginRight: 12 }} />
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => { setStock(e.target.value); setShowResult(false); }}
                  style={{ background: 'transparent', border: 'none', color: COLORS.text, fontSize: 18, width: '100%', outline: 'none', fontWeight: 600 }}
                />
              </div>
            </div>

            <button 
              onClick={handlePredict}
              style={{
                background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
                color: '#FFF',
                border: 'none',
                padding: '16px',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 15px rgba(16, 185, 129, 0.3)`,
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ประมวลผลคำแนะนำจาก AI
            </button>

            {showResult && (
              <div style={{
                marginTop: 8,
                background: type === 'cup' ? '#FEF2F2' : COLORS.greenLight,
                border: `1px solid ${type === 'cup' ? COLORS.red : COLORS.green}`,
                borderRadius: 12,
                padding: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {type === 'cup' ? <AlertTriangle color={COLORS.red} size={28} /> : <CheckCircle color={COLORS.greenDark} size={28} />}
                  <h3 style={{ margin: 0, fontSize: 20, color: type === 'cup' ? COLORS.red : COLORS.greenDark }}>
                    {type === 'cup' ? 'รีบขายสัปดาห์นี้!' : 'ชะลอการขายกักตุนไว้ก่อน'}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: COLORS.text, fontWeight: 500 }}>
                  {type === 'cup' 
                    ? `ยางก้อนถ้วยของคุณ ${stock} กก. (มูลค่าปัจจุบัน ${(stock * currentPrice).toLocaleString()} บาท) จะสูญเสียน้ำหนักและความชื้นหากเก็บไว้นานเกิน 14 วัน (ค่าเสียโอกาส ~${(stock*0.5).toFixed(0)} บาท) ประกอบกับโมเดลชี้ว่าราคามีแนวโน้มปรับลงสัปดาห์หน้า แนะนำให้ทยอยขายออก 80% ของสต็อกที่มี`
                    : `ยางแผ่นสามารถเก็บรักษาได้นานโดยไม่เสียคุณภาพ โมเดลพยากรณ์ว่าราคาในอีก 2 สัปดาห์ข้างหน้าจะปรับขึ้นอีก ~2.50 บาท/กก. หากคุณทนได้ แนะนำให้รอจังหวะนั้นเพื่อส่วนต่างกำไรอีก ${(stock*2.5).toFixed(0)} บาท`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: SMART TAPPING CALENDAR */}
        <div style={{ flex: '1 1 50%', minWidth: 400 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <CalendarDays color={COLORS.brown} /> 
            Smart Tapping Calendar
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            ดึงข้อมูลพยากรณ์อากาศจริง 14 วันล่วงหน้า (Real API)
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {REGIONS.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRegion(r)}
                style={{
                  padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap',
                  background: selectedRegion.id === r.id ? COLORS.brownLight : COLORS.bgCard,
                  border: `1px solid ${selectedRegion.id === r.id ? COLORS.brown : COLORS.border}`,
                  color: selectedRegion.id === r.id ? COLORS.brownDark : COLORS.textDim,
                  fontWeight: selectedRegion.id === r.id ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: COLORS.textDim }}>
              กำลังโหลดข้อมูลพยากรณ์อากาศ...
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
              gap: 12 
            }}>
              {calendar.map((day, idx) => {
                const dateStr = day.date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
                const isToday = idx === 0;

                return (
                  <div key={idx} style={{
                    background: isToday ? COLORS.brownLight : COLORS.bgCard,
                    border: `1px solid ${isToday ? COLORS.brown : COLORS.border}`,
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: isToday ? `0 4px 12px rgba(217, 119, 6, 0.15)` : '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ fontSize: 12, color: isToday ? COLORS.brownDark : COLORS.textDim, fontWeight: isToday ? 700 : 500 }}>
                      {isToday ? 'วันนี้' : dateStr}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {day.icon}
                      <span style={{ fontSize: 13, fontWeight: 700, color: day.color }}>
                        {day.weather === 'good' ? '0' : day.precipSum.toFixed(1)} mm
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: day.color }}>
                      {day.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
