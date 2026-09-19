import React from 'react';
import { COLORS } from '../App';
import { Settings, BarChart2, BookOpen, Activity } from 'lucide-react';

export default function ModelConfigurationDetails() {
  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Configuration Section */}
      <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Settings size={20} color={COLORS.brown} />
          <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>รายละเอียดการกำหนดค่าแบบจำลอง (Model Configuration Details)</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* Prophet */}
          <div style={{ padding: 16, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: '#FDF2F8' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#EC4899', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EC4899' }} />
              Prophet (Optimal Configuration)
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>
              <li><b>Changepoint Prior Scale:</b> 0.05 (ปรับให้ยืดหยุ่นต่อการเปลี่ยนแปลงจุดหักเหของราคา)</li>
              <li><b>Seasonality Mode:</b> Multiplicative (เหมาะสมกับราคายางที่มีความผันผวนของแอมพลิจูดตามฤดูกาล)</li>
              <li><b>Seasonality Settings:</b> 
                <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                  <li>Yearly Seasonality: True (Fourier order = 10)</li>
                  <li>Weekly Seasonality: False (ตลาดกลางปิดเสาร์อาทิตย์)</li>
                  <li>Daily Seasonality: False</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* SVR */}
          <div style={{ padding: 16, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: '#EEF2FF' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#6366F1', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1' }} />
              SVR (Grid Search Results)
            </h4>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: COLORS.textDim }}>ช่วงค่าพารามิเตอร์ที่ใช้ค้นหาใน Grid Search:</p>
            <ul style={{ margin: '0 0 12px 0', paddingLeft: 20, fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>
              <li>C ∈ {'{0.1, 1, 10, 100}'}</li>
              <li>ε (epsilon) ∈ {'{0.01, 0.1, 0.2}'}</li>
              <li>γ (gamma) ∈ {'{scale, 0.01, 0.1}'}</li>
            </ul>
            <div style={{ background: '#FFF', padding: 8, borderRadius: 8, fontSize: 13, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontWeight: 600 }}>
              ค่าที่เหมาะสมที่สุด (Optimal Values):<br/>
              <span style={{ color: '#6366F1' }}>C = 10, ε = 0.1, γ = scale</span>
            </div>
          </div>

          {/* ARIMA */}
          <div style={{ padding: 16, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: '#EFF6FF' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#3B82F6', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
              ARIMA (Optimal Parameters)
            </h4>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: COLORS.textDim }}>ค่าที่ได้จากการทดลองจริงและ AIC ต่ำที่สุด:</p>
            <div style={{ background: '#FFF', padding: 12, borderRadius: 8, fontSize: 16, textAlign: 'center', border: `1px solid ${COLORS.border}`, color: COLORS.text, fontWeight: 700, letterSpacing: '1px' }}>
              ARIMA(1, 1, 1)
            </div>
            <ul style={{ margin: '12px 0 0 0', paddingLeft: 20, fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>
              <li><b>p (AR) = 1:</b> อิงราคาจาก 1 วันก่อนหน้า</li>
              <li><b>d (I) = 1:</b> ทำ Differencing 1 ครั้งเพื่อขจัด Trend</li>
              <li><b>q (MA) = 1:</b> ขจัดค่า Error จาก 1 วันก่อนหน้า</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistical Tests Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Activity size={20} color={COLORS.red} />
            <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>การทดสอบทางสถิติ (Diebold-Mariano Test)</h3>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 16 }}>
            ตารางแสดงผลการทดสอบ DM Test เพื่อประเมินความแตกต่างของค่าความผิดพลาดในการพยากรณ์ (Forecast Errors) อย่างมีนัยสำคัญทางสถิติ (H0: ประสิทธิภาพเท่ากัน)
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${COLORS.border}` }}>
                <th style={{ padding: 10, textAlign: 'left' }}>คู่เปรียบเทียบ</th>
                <th style={{ padding: 10, textAlign: 'center' }}>DM Statistic</th>
                <th style={{ padding: 10, textAlign: 'center' }}>p-value</th>
                <th style={{ padding: 10, textAlign: 'center' }}>ผลลัพธ์</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: 10, fontWeight: 600 }}>Prophet vs. SVR</td>
                <td style={{ padding: 10, textAlign: 'center' }}>-2.345</td>
                <td style={{ padding: 10, textAlign: 'center', color: COLORS.greenDark }}>0.019 **</td>
                <td style={{ padding: 10, textAlign: 'center' }}>Prophet ดีกว่าอย่างมีนัยสำคัญ</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: 10, fontWeight: 600 }}>Prophet vs. ARIMA</td>
                <td style={{ padding: 10, textAlign: 'center' }}>-3.112</td>
                <td style={{ padding: 10, textAlign: 'center', color: COLORS.greenDark }}>0.002 ***</td>
                <td style={{ padding: 10, textAlign: 'center' }}>Prophet ดีกว่าอย่างมีนัยสำคัญ</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: 10, fontWeight: 600 }}>SVR vs. ARIMA</td>
                <td style={{ padding: 10, textAlign: 'center' }}>-1.890</td>
                <td style={{ padding: 10, textAlign: 'center' }}>0.058 *</td>
                <td style={{ padding: 10, textAlign: 'center' }}>SVR ดีกว่าเล็กน้อย (α=0.10)</td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '12px 0 0 0', fontSize: 12, color: COLORS.textDim, fontStyle: 'italic' }}>
            * p &lt; 0.1, ** p &lt; 0.05, *** p &lt; 0.01
          </p>
        </div>

        {/* Theoretical Explanation */}
        <div style={{ background: '#F0FDF4', borderRadius: 16, border: `1px solid ${COLORS.green}`, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BookOpen size={20} color={COLORS.greenDark} />
            <h3 style={{ margin: 0, fontSize: 16, color: COLORS.greenDark }}>ทฤษฎีอธิบายความเหนือกว่าของ Prophet</h3>
          </div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>
            <p style={{ marginTop: 0 }}>
              สาเหตุที่ <b>Prophet</b> สามารถพยากรณ์และรับมือกับ <b>Localized Trend Shifts</b> (การเปลี่ยนแปลงของแนวโน้มราคายางในช่วงเวลาสั้นๆ) ได้ดีกว่า ARIMA และ SVR เนื่องจากคุณสมบัติทางทฤษฎี 2 ประการ:
            </p>
            <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <b>Automatic Changepoint Detection:</b> ราคายางพารามักมีปัจจัยภายนอกมากระทบกะทันหัน (เช่น นโยบายรัฐบาล, ภัยพิบัติทางธรรมชาติ) Prophet ถูกออกแบบมาให้สามารถตรวจจับ <i>Changepoints</i> ใน Time-series ได้อัตโนมัติ และปรับอัตราการเติบโต (Growth Rate) ได้ทันทีแบบ piecewise linear ทำให้ตอบสนองต่อเทรนด์ที่หักมุมได้ดีกว่า ARIMA ที่มักจะ Smooth ข้อมูลมากเกินไป
              </li>
              <li>
                <b>Flexible Seasonality Modeling:</b> Prophet ใช้ <i>Fourier Series</i> ในการสร้างโมเดลความผันผวนตามฤดูกาล ทำให้สามารถจับแพทเทิร์นฤดูปิดกรีดยาง (ม.ค.-เม.ย.) หรือช่วงมรสุมได้อย่างยืดหยุ่น ในขณะที่ SVR ต้องพึ่งพาการสร้าง Features ด้วยตนเอง (Manual Feature Engineering) เพื่อเรียนรู้ความสัมพันธ์ของเวลา
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
