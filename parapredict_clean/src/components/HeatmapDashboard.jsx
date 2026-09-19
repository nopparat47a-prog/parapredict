import React, { useState } from 'react';
import { Settings2, CloudRain, Droplet, DollarSign, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { COLORS } from '../App';
import { REGIONS_META, LATEST_PRICES, GLOBAL_FACTORS } from '../data/mockRealData';

export default function HeatmapDashboard() {
  const [rain, setRain] = useState(GLOBAL_FACTORS.rain.value); 
  const [oil, setOil] = useState(GLOBAL_FACTORS.oil.value); 
  const [currency, setCurrency] = useState(GLOBAL_FACTORS.currency.value); 
  const [selectedRegionId, setSelectedRegionId] = useState('south'); 

  const selectedRegion = REGIONS_META.find(r => r.id === selectedRegionId);
  const basePrice = LATEST_PRICES[selectedRegionId].latex || LATEST_PRICES[selectedRegionId].cup || 70;
  
  const calcPredicted = () => {
    let p = basePrice;
    p += (oil - GLOBAL_FACTORS.oil.value) * 0.15; 
    p += (rain - GLOBAL_FACTORS.rain.value) * 0.08;
    p += (currency - GLOBAL_FACTORS.currency.value) * 1.2;
    return Math.max(20, p);
  };

  const predictedPrice = calcPredicted();
  const diff = predictedPrice - basePrice;
  const isUp = diff >= 0;

  const chartData = [];
  let curr = basePrice;
  for (let i = -14; i <= 14; i++) {
    if (i < 0) {
      chartData.push({ day: `Day ${i}`, actual: curr + Math.random() * 2 - 1, predicted: null });
    } else if (i === 0) {
      chartData.push({ day: `Today`, actual: curr, predicted: curr });
    } else {
      const step = (predictedPrice - curr) / (15 - i);
      curr += step + (Math.random() * 1.5 - 0.75);
      chartData.push({ day: `Day +${i}`, actual: null, predicted: curr });
    }
  }

  // Component to fly to region on click
  const MapController = () => {
    const map = useMap();
    React.useEffect(() => {
      map.flyTo([selectedRegion.lat, selectedRegion.lng], 6, { animate: true });
    }, [selectedRegion, map]);
    return null;
  };

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text }}>
      
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: HEATMAP (Leaflet) */}
        <div style={{ flex: '1 1 40%', minWidth: 350 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <MapPin color={COLORS.green} /> 
            แผนที่ความร้อน (Interactive Map)
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            กดหมุดบนแผนที่เพื่อวิเคราะห์ราคาในภูมิภาคนั้น
          </div>
          
          <div style={{ 
            background: COLORS.bgCard, 
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            height: 480,
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <MapContainer 
              center={[13.75, 100.5]} 
              zoom={5} 
              style={{ height: '100%', width: '100%', background: '#F3F4F6' }}
              zoomControl={false}
            >
              <MapController />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              
              {REGIONS_META.map((r) => {
                const isSelected = selectedRegionId === r.id;
                const p = LATEST_PRICES[r.id].latex || LATEST_PRICES[r.id].cup || 70;
                // Higher price = larger radius + warmer color
                const radius = 15 + (p - 60);
                const color = isSelected ? COLORS.brown : COLORS.green;

                return (
                  <CircleMarker 
                    key={r.id}
                    center={[r.lat, r.lng]}
                    radius={radius}
                    pathOptions={{ 
                      color: color, 
                      fillColor: color, 
                      fillOpacity: isSelected ? 0.6 : 0.3,
                      weight: isSelected ? 3 : 1
                    }}
                    eventHandlers={{
                      click: () => setSelectedRegionId(r.id),
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'inherit', textAlign: 'center' }}>
                        <strong style={{ fontSize: 14 }}>{r.label}</strong><br/>
                        <span style={{ fontSize: 16, color: COLORS.greenDark, fontWeight: 'bold' }}>{p} บาท</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATOR */}
        <div style={{ flex: '1 1 50%', minWidth: 400 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <Settings2 color={COLORS.brown} /> 
            จำลองฉากทัศน์ (Simulator) - {selectedRegion.label}
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            ปรับปัจจัยทางตลาดเพื่อดูผลกระทบต่อราคายาง
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {/* Slider 1: Rain */}
            <div style={{ background: COLORS.bgCard, padding: '16px 20px', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><CloudRain size={18} color={COLORS.blue} /> ปริมาณฝนเทียบกับค่าเฉลี่ย</span>
                <span style={{ fontWeight: 700, color: COLORS.blue }}>{rain > 0 ? '+' : ''}{rain}%</span>
              </div>
              <input 
                type="range" min="-50" max="50" value={rain} onChange={(e) => setRain(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.blue }}
              />
            </div>

            {/* Slider 2: Oil */}
            <div style={{ background: COLORS.bgCard, padding: '16px 20px', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Droplet size={18} color={COLORS.text} /> ราคาน้ำมันดิบโลก (Brent)</span>
                <span style={{ fontWeight: 700 }}>{oil} USD/bbl</span>
              </div>
              <input 
                type="range" min="50" max="120" value={oil} onChange={(e) => setOil(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.text }}
              />
            </div>

            {/* Slider 3: Currency */}
            <div style={{ background: COLORS.bgCard, padding: '16px 20px', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><DollarSign size={18} color={COLORS.greenDark} /> อัตราแลกเปลี่ยน</span>
                <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{currency.toFixed(1)} THB/USD</span>
              </div>
              <input 
                type="range" min="30" max="40" step="0.1" value={currency} onChange={(e) => setCurrency(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.greenDark }}
              />
            </div>
          </div>

          {/* Simulation Result */}
          <div style={{ 
            background: COLORS.brownLight, 
            border: `1px solid ${COLORS.brown}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 4px 15px rgba(217, 119, 6, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: COLORS.brownDark, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>ราคาจำลอง ({selectedRegion.label})</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: COLORS.brownDark }}>
                    {predictedPrice.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 14, color: COLORS.brown, fontWeight: 600 }}>บาท/กก.</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 20, fontWeight: 700, color: isUp ? COLORS.greenDark : COLORS.red }}>
                  {isUp ? <TrendingUp /> : <TrendingDown />}
                  {isUp ? '+' : ''}{diff.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: COLORS.brownDark }}>จากราคาฐานวันนี้ ({basePrice})</div>
              </div>
            </div>

            {/* Micro Chart */}
            <div style={{ height: 120, width: '100%', marginTop: 10, background: COLORS.bgCard, borderRadius: 8, padding: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: COLORS.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="actual" stroke={COLORS.green} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="predicted" stroke={COLORS.brown} strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
