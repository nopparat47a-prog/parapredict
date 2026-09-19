import React, { useState } from "react";
import { LayoutDashboard, Map, Calculator, Users, Leaf, History, Settings } from "lucide-react";
import CorePrediction from "./components/CorePrediction";
import HeatmapDashboard from "./components/HeatmapDashboard";
import HistoricalData from "./components/HistoricalData";
import DecisionTools from "./components/DecisionTools";
import CommunityGrowth from "./components/CommunityGrowth";
import AdminDashboard from "./components/AdminDashboard";
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
  blue: "#3B82F6"
};
const TABS = [
  { id: "dashboard", label: "\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21 & \u0E17\u0E33\u0E19\u0E32\u0E22", icon: LayoutDashboard, component: CorePrediction },
  { id: "map", label: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E04\u0E27\u0E32\u0E21\u0E23\u0E49\u0E2D\u0E19 & \u0E08\u0E33\u0E25\u0E2D\u0E07", icon: Map, component: HeatmapDashboard },
  { id: "history", label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E04\u0E32\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07", icon: History, component: HistoricalData },
  { id: "decision", label: "\u0E1C\u0E39\u0E49\u0E0A\u0E48\u0E27\u0E22 AI & \u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19", icon: Calculator, component: DecisionTools },
  { id: "community", label: "\u0E15\u0E25\u0E32\u0E14\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E32\u0E22 & \u0E0A\u0E38\u0E21\u0E0A\u0E19", icon: Users, component: CommunityGrowth }
];
export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || CorePrediction;
  if (isAdminMode) {
    return /* @__PURE__ */ React.createElement(AdminDashboard, { onLogout: () => setIsAdminMode(false) });
  }
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100vh", background: COLORS.bg, fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" } }, /* @__PURE__ */ React.createElement("header", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    padding: "16px 28px",
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.bgCard,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: {
    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
    color: "#FFF",
    padding: "8px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 4px 10px rgba(16, 185, 129, 0.3)`
  } }, /* @__PURE__ */ React.createElement(Leaf, { size: 24 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.5px" } }, "ParaPredict"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: COLORS.textDim, fontWeight: 500 } }, "\u0E23\u0E30\u0E1A\u0E1A\u0E17\u0E33\u0E19\u0E32\u0E22\u0E23\u0E32\u0E04\u0E32\u0E22\u0E32\u0E07\u0E2D\u0E31\u0E08\u0E09\u0E23\u0E34\u0E22\u0E30 (Agri-Tech)"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("nav", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, TABS.map((tab) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => setActiveTab(tab.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: "12px",
          border: `1px solid ${isActive ? COLORS.green : "transparent"}`,
          background: isActive ? COLORS.greenLight : "transparent",
          color: isActive ? COLORS.greenDark : COLORS.textDim,
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: isActive ? 600 : 500
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 18 }),
      tab.label
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 24, background: COLORS.border } }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsAdminMode(true),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: COLORS.textDim,
        fontSize: 14,
        fontWeight: 600,
        padding: "8px 12px",
        borderRadius: 8,
        transition: "all 0.2s ease"
      },
      onMouseOver: (e) => {
        e.currentTarget.style.color = COLORS.text;
        e.currentTarget.style.background = COLORS.bg;
      },
      onMouseOut: (e) => {
        e.currentTarget.style.color = COLORS.textDim;
        e.currentTarget.style.background = "transparent";
      }
    },
    /* @__PURE__ */ React.createElement(Settings, { size: 18 }),
    "\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E23\u0E30\u0E1A\u0E1A"
  ))), /* @__PURE__ */ React.createElement("main", { style: { flex: 1, overflowY: "auto" } }, /* @__PURE__ */ React.createElement(ActiveComponent, null)));
}
