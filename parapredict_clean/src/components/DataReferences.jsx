import React from 'react';
import { BookOpen, ExternalLink, Link as LinkIcon, Database, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../App';

export default function DataReferences() {
  const references = [
    {
      title: 'ข้อมูลราคายางพารา (อ้างอิงและจำลอง)',
      source: 'การยางแห่งประเทศไทย (RAOT)',
      desc: 'ข้อมูลราคายางแผ่นดิบ ยางแผ่นรมควัน น้ำยางสด และขี้ยางก้อนถ้วยรายวัน อ้างอิงจากฐานข้อมูลตลาดกลางยางพาราแห่งประเทศไทย',
      link: 'https://www.raot.co.th/'
    },
    {
      title: 'ข้อมูลสภาพอากาศและภูมิอากาศ',
      source: 'กรมอุตุนิยมวิทยา (TMD)',
      desc: 'ข้อมูลปริมาณน้ำฝน อุณหภูมิ และความชื้นสัมพัทธ์ในแต่ละภูมิภาคของประเทศไทย เพื่อประเมินผลกระทบต่ออุปทาน (Supply) ของยางพารา',
      link: 'https://www.tmd.go.th/'
    },
    {
      title: 'ข้อมูลราคาน้ำมันดิบ (Brent/WTI)',
      source: 'Bloomberg Energy / PTT',
      desc: 'ราคาน้ำมันดิบในตลาดโลก ซึ่งเป็นปัจจัยต้นทุนหลักของยางสังเคราะห์ที่มีผลกระทบเชื่อมโยงต่อทิศทางราคายางธรรมชาติ',
      link: 'https://www.bloomberg.com/energy'
    },
    {
      title: 'ข้อมูลอัตราแลกเปลี่ยน (Exchange Rate)',
      source: 'ธนาคารแห่งประเทศไทย (BOT)',
      desc: 'อัตราแลกเปลี่ยนเงินบาทต่อดอลลาร์สหรัฐ (THB/USD) ซึ่งส่งผลโดยตรงต่อการแข่งขันด้านการส่งออกและราคารับซื้อภายในประเทศ',
      link: 'https://www.bot.or.th/'
    },
    {
      title: 'ข้อมูลตลาดล่วงหน้าต่างประเทศ (Futures Market)',
      source: 'TOCOM (ญี่ปุ่น) และ SICOM (สิงคโปร์)',
      desc: 'ดัชนีราคาซื้อขายยางพาราล่วงหน้าในตลาดโลก นำมาใช้ประกอบการคาดการณ์แนวโน้มความต้องการและทิศทางราคาในอนาคต',
      link: 'https://www.sgx.com/commodities/rubber'
    }
  ];

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text }}>
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 16 }}>
        <h2 style={{ fontSize: 24, margin: '0 0 8px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={24} color={COLORS.brown} />
          แหล่งอ้างอิงข้อมูล (Data Sources & References)
        </h2>
        <p style={{ color: COLORS.textDim, margin: 0, fontSize: 15 }}>
          ระบบวิเคราะห์และพยากรณ์ราคายางพารานี้ ใช้ข้อมูลอ้างอิงจากหน่วยงานที่เชื่อถือได้ เพื่อนำมาใช้เป็นปัจจัยในการสร้างโมเดล Machine Learning (Random Forest, XGBoost, LSTM)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {references.map((ref, idx) => (
          <div key={idx} style={{ 
            background: COLORS.bgCard, 
            border: `1px solid ${COLORS.border}`, 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ 
                background: COLORS.brownLight, color: COLORS.brownDark, 
                padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Database size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 4 }}>{ref.title}</div>
                <div style={{ fontSize: 13, color: COLORS.brown, fontWeight: 600 }}>{ref.source}</div>
              </div>
            </div>
            
            <p style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
              {ref.desc}
            </p>
            
            <a 
              href={ref.link} 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 6, 
                fontSize: 13, fontWeight: 600, color: COLORS.blue, 
                textDecoration: 'none', padding: '8px 12px', 
                background: '#EFF6FF', borderRadius: 8, width: 'fit-content',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
              onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
            >
              <ExternalLink size={14} /> ไปยังเว็บไซต์แหล่งข้อมูล
            </a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, background: COLORS.greenLight, border: `1px solid ${COLORS.green}`, borderRadius: 12, padding: 20, display: 'flex', gap: 16 }}>
        <CheckCircle2 size={24} color={COLORS.greenDark} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: COLORS.greenDark, fontSize: 15, marginBottom: 6 }}>
            การประมวลผลข้อมูล (Data Processing pipeline)
          </div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>
            ข้อมูลจากแหล่งต่างๆ จะถูกรวบรวม ทำความสะอาด (Data Cleaning) และจัดการข้อมูลสูญหาย (Missing Values) ก่อนนำเข้าสู่กระบวนการ Train-Test Split แบบ Time-Series (80:20) เพื่อใช้สอนโมเดล AI ในระบบ ParaPredict ทั้งหมด
          </div>
        </div>
      </div>
    </div>
  );
}
