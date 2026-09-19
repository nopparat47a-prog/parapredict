import React, { useState } from 'react';
import { LayoutDashboard, Map, Calculator, Users, Leaf, History, Settings } from 'lucide-react';
import CorePrediction from './components/CorePrediction';
import HeatmapDashboard from './components/HeatmapDashboard';
import HistoricalData from './components/HistoricalData';
import DecisionTools from './components/DecisionTools';
import CommunityGrowth from './components/CommunityGrowth';
import AdminDashboard from './components/AdminDashboard';
import DataReferences from './components/DataReferences';
import { BookOpen } from 'lucide-react';

export const COLORS = {
  bg: "#F9FAFB",
  bgCard: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textDim: "#6B7280",
  green: "#10B981",
  greenDark: "#059669",
  greenLight: "#D1FAE5",
  brown: "#D97706",
  brownDark: "#B45309",
  brownLight: "#FEF3C7",
  red: "#EF4444",
  blue: "#3B82F6",
};

const SECTIONS = [
  { id: 'dashboard', label: 'ภาพรวม & ทำนาย', icon: LayoutDashboard, component: CorePrediction },
  { id: 'map', label: 'แผนที่ความร้อน & จำลอง', icon: Map, component: HeatmapDashboard },
  { id: 'history', label: 'ข้อมูลราคาย้อนหลัง', icon: History, component: HistoricalData },
  { id: 'decision', label: 'ผู้ช่วย AI & ปฏิทิน', icon: Calculator, component: DecisionTools },
  { id: 'community', label: 'ตลาดซื้อขาย & ชุมชน', icon: Users, component: CommunityGrowth },
  { id: 'references', label: 'แหล่งอ้างอิงข้อมูล', icon: BookOpen, component: DataReferences },
];

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (isAdminMode) {
    return <AdminDashboard onLogout={() => setIsAdminMode(false)} />;
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', background: COLORS.bg, fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Top Navigation */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px 28px', 
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.bgCard,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`, 
            color: '#FFF', 
            padding: '8px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 10px rgba(16, 185, 129, 0.3)`
          }}>
            <Leaf size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>ParaPredict</h1>
            <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 500, whiteSpace: 'nowrap' }}>ระบบทำนายราคายางอัจฉริยะ (Agri-Tech)</div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflowX: 'auto', flex: 1, justifyContent: 'flex-end', paddingBottom: 4 }}>
          <nav style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                 <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: COLORS.textDim,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = COLORS.greenDark; e.currentTarget.style.background = COLORS.greenLight; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = COLORS.textDim; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              )
            })}
          </nav>

          <div style={{ width: 1, height: 24, background: COLORS.border }} />

          <button 
            onClick={() => setIsAdminMode(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: 'transparent', border: 'none', cursor: 'pointer', 
              color: COLORS.textDim, fontSize: 14, fontWeight: 600,
              padding: '8px 12px', borderRadius: 8, transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = COLORS.text; e.currentTarget.style.background = COLORS.bg; }}
            onMouseOut={(e) => { e.currentTarget.style.color = COLORS.textDim; e.currentTarget.style.background = 'transparent'; }}
          >
            <Settings size={18} />
            จัดการระบบ
          </button>
        </div>
      </header>

      {/* Main Content Area - Unified Dashboard */}
      <main style={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' }}>
        {SECTIONS.map((section, index) => {
          const Component = section.component;
          return (
            <div key={section.id} id={section.id} style={{ 
              paddingTop: index !== 0 ? '40px' : '0px', 
              borderTop: index !== 0 ? `4px solid ${COLORS.border}` : 'none' 
            }}>
              <Component />
            </div>
          );
        })}
        {/* Footer to give some space at the bottom */}
        <div style={{ height: '80px', background: COLORS.bgCard, borderTop: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textDim, fontSize: 14 }}>
          &copy; 2026 ParaPredict - ระบบข้อมูลตลาดยางพารา 10 ปี
        </div>
      </main>
    </div>
  );
}