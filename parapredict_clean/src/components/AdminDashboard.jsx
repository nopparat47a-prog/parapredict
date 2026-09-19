import React, { useState, useEffect } from 'react';
import { 
  Lock, UploadCloud, Database, Cpu, Download, FileText, 
  Trash2, Edit, Save, X, Settings, LogOut, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import { COLORS } from '../App';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { generate10YearHistory, REGIONS_META, GRADES_META, PROVINCES_META } from '../data/mockRealData';

// Generate a large realistic dataset (10 years) for the admin table
const generateLargeDataset = () => {
  let idCounter = 1;
  const largeData = [];
  
  // Get 10 years of history for Songkhla (South) for ALL grades
  for (const grade of GRADES_META) {
    const history = generate10YearHistory('songkhla', grade.id);
    
    for (const item of history) {
      // Train = 2016 to 2023 (8 years)
      // Test = 2024 to 2026 (approx 2.5 years)
      const splitType = item.year <= 2023 ? 'Train (80%)' : 'Test (20%)';
      
      largeData.push({
        id: idCounter++,
        date: item.date.toISOString().split('T')[0], // YYYY-MM-DD
        grade: grade.label,
        price: item.actual,
        split: splitType
      });
    }
  }
  
  // Sort by date descending so the newest (Test) shows first
  return largeData.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const INITIAL_DATA = generateLargeDataset();

export default function AdminDashboard({ onLogout }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('data'); // data, model, export, community
  const [exportDataset, setExportDataset] = useState('price'); // 'price' or 'community'

  // Community State (Admin side)
  const [adminPosts, setAdminPosts] = useState([]);

  useEffect(() => {
    if (activeTab === 'community') {
      const saved = localStorage.getItem('community_posts');
      if (saved) setAdminPosts(JSON.parse(saved));
    }
  }, [activeTab]);

  const handleDeletePost = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?")) {
      const newPosts = adminPosts.filter(p => p.id !== id);
      setAdminPosts(newPosts);
      localStorage.setItem('community_posts', JSON.stringify(newPosts));
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Data State
  const [dataList, setDataList] = useState(INITIAL_DATA);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Model State
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainLog, setTrainLog] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, username, password);
    } catch (error) {
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoginError("เกิดข้อผิดพลาดในการล็อกอินด้วย Google");
    }
  };

  const handleRealLogout = async () => {
    try {
      await signOut(auth);
      onLogout(); // go back to main app
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Simple CSV parser
        const rows = text.split('\n').map(row => row.split(','));
        if (rows.length > 1) {
          const newData = [];
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].length >= 4) {
              newData.push({
                id: Date.now() + i, // Fake ID
                date: rows[i][0]?.trim(),
                region: rows[i][1]?.trim(),
                grade: rows[i][2]?.trim(),
                price: parseFloat(rows[i][3]?.trim() || 0),
              });
            }
          }
          setDataList([...newData, ...dataList]);
          alert(`นำเข้าข้อมูลสำเร็จ ${newData.length} รายการ`);
        }
      } catch (err) {
        alert("รูปแบบไฟล์ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      setDataList(dataList.filter(d => d.id !== id));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    setDataList(dataList.map(d => d.id === editingId ? editForm : d));
    setEditingId(null);
  };

  const handleTrainModel = () => {
    if (window.confirm("การ Train Model อาจใช้เวลาและทรัพยากรระบบสูง ยืนยันการรันใหม่?")) {
      setIsTraining(true);
      setTrainProgress(0);
      setTrainLog("Starting Data Preprocessing...");
      
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        setTrainProgress(p);
        
        if (p === 20) setTrainLog("Extracting Features...");
        if (p === 40) setTrainLog("Training Random Forest & XGBoost...");
        if (p === 65) setTrainLog("Cross Validating...");
        if (p === 85) setTrainLog("Optimizing Hyperparameters...");
        if (p === 100) {
          clearInterval(interval);
          setTrainLog("Training Complete! Accuracy: 87.4%");
          setTimeout(() => setIsTraining(false), 3000);
        }
      }, 200);
    }
  };

  const downloadFile = (type) => {
    if (type === 'Excel / CSV') {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Thai characters
      
      if (exportDataset === 'price') {
        csvContent += "Date,Region,Grade,Price\n";
        dataList.forEach(item => {
          csvContent += `${item.date},${item.region},${item.grade},${item.price}\n`;
        });
      } else if (exportDataset === 'community') {
        csvContent += "ID,Author,Text,Likes,Comments\n";
        adminPosts.forEach(item => {
          const safeText = `"${(item.text || '').replace(/"/g, '""')}"`;
          csvContent += `${item.id},${item.author},${safeText},${item.likes || 0},${item.comments || 0}\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", exportDataset === 'price' ? "rubber_price_history.csv" : "community_posts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'PDF Report') {
      const printWindow = window.open('', '_blank');
      
      let htmlContent = `
        <html>
        <head>
          <title>รายงานข้อมูลโครงการยางพารา</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #333; }
            h1 { text-align: center; color: #15803d; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; }
            tr:nth-child(even) { background-color: #fbfcfd; }
          </style>
        </head>
        <body>
          <h1>รายงานข้อมูล: ${exportDataset === 'price' ? 'ราคายางย้อนหลัง' : 'กระดานสนทนาชุมชน'}</h1>
          <div class="subtitle">พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</div>
          <table>
            <thead>
      `;

      if (exportDataset === 'price') {
        htmlContent += `<tr><th>วันที่</th><th>ภูมิภาค</th><th>ชนิดยาง</th><th>ราคา (บาท)</th></tr></thead><tbody>`;
        dataList.forEach(item => {
          htmlContent += `<tr><td>${item.date}</td><td>${item.region}</td><td>${item.grade}</td><td>${item.price.toFixed(2)}</td></tr>`;
        });
      } else {
        htmlContent += `<tr><th>ผู้โพสต์</th><th>เนื้อหา</th><th>ยอดถูกใจ</th></tr></thead><tbody>`;
        adminPosts.forEach(item => {
          htmlContent += `<tr><td>${item.author}</td><td>${item.text}</td><td>${item.likes || 0}</td></tr>`;
        });
      }

      htmlContent += `
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  if (isLoadingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: COLORS.bg, color: COLORS.textDim }}>กำลังตรวจสอบสถานะการล็อกอิน...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: COLORS.bg }}>
        <div style={{ background: COLORS.bgCard, padding: 40, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ background: COLORS.greenLight, padding: 16, borderRadius: '50%' }}>
              <Lock size={32} color={COLORS.greenDark} />
            </div>
          </div>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: COLORS.text }}>Admin Login</h2>
          <p style={{ textAlign: 'center', color: COLORS.textDim, fontSize: 14, marginBottom: 24 }}>กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล</p>
          
          {loginError && (
            <div style={{ background: '#FEE2E2', color: COLORS.red, padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              type="email" placeholder="Email" required
              value={username} onChange={e => setUsername(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}
            />
            <input 
              type="password" placeholder="Password" required
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}
            />
            <button type="submit" style={{ padding: 12, borderRadius: 8, background: COLORS.green, color: '#FFF', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>
              เข้าสู่ระบบด้วยอีเมล
            </button>
            
            <div style={{ position: 'relative', margin: '8px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: `1px solid ${COLORS.border}` }}></div>
              <span style={{ position: 'relative', background: COLORS.bgCard, padding: '0 10px', color: COLORS.textDim, fontSize: 13 }}>หรือ</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, background: '#FFF', color: COLORS.text, fontWeight: 600, border: `1px solid ${COLORS.border}`, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style={{ width: 18, height: 18 }} />
              Sign in with Google
            </button>

            <button type="button" onClick={onLogout} style={{ padding: 12, borderRadius: 8, background: 'transparent', color: COLORS.textDim, border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: 8 }}>
              กลับไปหน้าผู้ใช้ทั่วไป
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text, paddingBottom: 60, minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, cursor: 'pointer', color: COLORS.text, fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> กลับ
          </button>
          <h1 style={{ fontSize: 24, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings color={COLORS.blue} /> Admin Dashboard
          </h1>
        </div>
        <button 
          onClick={handleRealLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, cursor: 'pointer', color: COLORS.red, fontWeight: 600 }}
        >
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { id: 'data', label: 'จัดการข้อมูล (Data)', icon: Database },
          { id: 'model', label: 'ควบคุมโมเดล (AI Model)', icon: Cpu },
          { id: 'community', label: 'กระดานแชท (Community)', icon: FileText },
          { id: 'export', label: 'รายงาน (Export)', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12,
                background: isActive ? COLORS.blue : COLORS.bgCard,
                color: isActive ? '#FFF' : COLORS.textDim,
                border: `1px solid ${isActive ? COLORS.blue : COLORS.border}`,
                fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        
        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>ฐานข้อมูลราคาและปัจจัย (Database)</h2>
              <div>
                <input 
                  type="file" 
                  accept=".csv" 
                  id="csvUpload" 
                  style={{ display: 'none' }} 
                  onChange={handleUpload} 
                />
                <button 
                  onClick={() => document.getElementById('csvUpload').click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: COLORS.green, color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  <UploadCloud size={18} /> Import Excel / CSV
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: COLORS.bg, color: COLORS.textDim, textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th style={{ padding: 12 }}>วันที่</th>
                  <th style={{ padding: 12 }}>ชนิดยาง</th>
                  <th style={{ padding: 12 }}>ราคา (บาท)</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>ชุดข้อมูล (Split)</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {dataList.slice(((currentPage || 1) - 1) * itemsPerPage, (currentPage || 1) * itemsPerPage).map(item => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: 12 }}>#{item.id}</td>
                    
                    {editingId === item.id ? (
                      <>
                        <td style={{ padding: 12 }}><input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}/></td>
                        <td style={{ padding: 12 }}><input type="text" value={editForm.grade} onChange={e => setEditForm({...editForm, grade: e.target.value})} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', width: 100 }}/></td>
                        <td style={{ padding: 12 }}><input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', width: 60 }}/></td>
                        <td style={{ padding: 12, textAlign: 'center' }}>-</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button onClick={saveEdit} style={{ background: COLORS.green, color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginRight: 4 }}><Save size={14}/></button>
                          <button onClick={() => setEditingId(null)} style={{ background: COLORS.bg, color: COLORS.text, border: '1px solid #ccc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}><X size={14}/></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 12 }}>{item.date}</td>
                        <td style={{ padding: 12 }}>{item.grade}</td>
                        <td style={{ padding: 12, fontWeight: 600 }}>{item.price.toFixed(2)}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            background: item.split.includes('Train') ? '#EFF6FF' : '#F0FDF4', 
                            color: item.split.includes('Train') ? '#3B82F6' : '#16A34A', 
                            padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 
                          }}>
                            {item.split}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button onClick={() => startEdit(item)} style={{ background: 'transparent', color: COLORS.blue, border: 'none', cursor: 'pointer', padding: 4 }}><Edit size={16}/></button>
                          <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', color: COLORS.red, border: 'none', cursor: 'pointer', padding: 4, marginLeft: 8 }}><Trash2 size={16}/></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {dataList.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: COLORS.textDim }}>ไม่มีข้อมูล</td></tr>}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {dataList.length > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <div style={{ fontSize: 14, color: COLORS.textDim }}>
                  แสดงผล {((currentPage || 1) - 1) * itemsPerPage + 1} ถึง {Math.min((currentPage || 1) * itemsPerPage, dataList.length)} จากทั้งหมด {dataList.length} รายการ
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: COLORS.text }}>
                    ไปที่หน้า:
                    <input 
                      type="number" 
                      min={1} 
                      max={Math.ceil(dataList.length / itemsPerPage)}
                      value={currentPage === '' ? '' : currentPage}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setCurrentPage('');
                          return;
                        }
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) return;
                        if (val < 1) val = 1;
                        if (val > Math.ceil(dataList.length / itemsPerPage)) val = Math.ceil(dataList.length / itemsPerPage);
                        setCurrentPage(val);
                      }}
                      style={{ 
                        width: 60, padding: '4px 8px', borderRadius: 6, 
                        border: `1px solid ${COLORS.border}`, textAlign: 'center' 
                      }}
                    />
                    จาก {Math.ceil(dataList.length / itemsPerPage)}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '6px 12px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(dataList.length / itemsPerPage), p + 1))}
                      disabled={currentPage >= Math.ceil(dataList.length / itemsPerPage)}
                      style={{ padding: '6px 12px', background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, cursor: currentPage >= Math.ceil(dataList.length / itemsPerPage) ? 'not-allowed' : 'pointer', opacity: currentPage >= Math.ceil(dataList.length / itemsPerPage) ? 0.5 : 1 }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODEL TAB */}
        {activeTab === 'model' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
             <h2 style={{ margin: '0 0 20px 0', fontSize: 18 }}>AI Model Training Pipeline</h2>
             <div style={{ background: COLORS.bg, padding: 24, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                <p style={{ marginTop: 0, color: COLORS.textDim }}>รันการฝึกสอนโมเดลพยากรณ์ราคายางพาราใหม่ด้วยข้อมูลล่าสุด เพื่อให้ความแม่นยำสูงที่สุด (Retrain Model)</p>
                
                {!isTraining && trainProgress === 0 && (
                  <button 
                    onClick={handleTrainModel}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: COLORS.blue, color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}
                  >
                    <Cpu size={20} /> Train Model ใหม่ (Retrain)
                  </button>
                )}

                {(isTraining || trainProgress === 100) && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 600, color: COLORS.blue }}>
                      <span>{trainLog}</span>
                      <span>{trainProgress}%</span>
                    </div>
                    <div style={{ width: '100%', background: '#E2E8F0', borderRadius: 999, height: 16, overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${trainProgress}%`, background: trainProgress === 100 ? COLORS.green : COLORS.blue, 
                        height: '100%', transition: 'width 0.2s ease, background 0.2s ease' 
                      }} />
                    </div>
                    {trainProgress === 100 && (
                      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: COLORS.greenDark, fontWeight: 700 }}>
                        <CheckCircle size={20} /> Deploy Model เวอร์ชันใหม่ขึ้นระบบสำเร็จ!
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === 'community' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
               <h2 style={{ margin: 0, fontSize: 18 }}>จัดการกระดานสนทนา (Community / Chat)</h2>
               <button 
                 onClick={() => {
                   if(window.confirm('ลบโพสต์ทั้งหมด?')) {
                     setAdminPosts([]);
                     localStorage.setItem('community_posts', JSON.stringify([]));
                   }
                 }}
                 style={{ padding: '8px 16px', background: '#FEE2E2', color: COLORS.red, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
               >
                 ลบโพสต์ทั้งหมด
               </button>
             </div>

             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
               <thead>
                 <tr style={{ background: COLORS.bg, color: COLORS.textDim, textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>
                   <th style={{ padding: 12 }}>ID</th>
                   <th style={{ padding: 12 }}>ผู้โพสต์</th>
                   <th style={{ padding: 12 }}>เนื้อหา / คำถาม</th>
                   <th style={{ padding: 12, textAlign: 'center' }}>จัดการ</th>
                 </tr>
               </thead>
               <tbody>
                 {adminPosts.map(post => (
                   <tr key={post.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                     <td style={{ padding: 12 }}>#{String(post.id).slice(-4)}</td>
                     <td style={{ padding: 12, fontWeight: 600 }}>{post.author}</td>
                     <td style={{ padding: 12 }}>{post.text}</td>
                     <td style={{ padding: 12, textAlign: 'center' }}>
                       <button onClick={() => handleDeletePost(post.id)} style={{ background: 'transparent', color: COLORS.red, border: 'none', cursor: 'pointer', padding: 4 }}><Trash2 size={16}/></button>
                     </td>
                   </tr>
                 ))}
                 {adminPosts.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: COLORS.textDim }}>ไม่มีโพสต์ในระบบ</td></tr>}
               </tbody>
             </table>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
             <h2 style={{ margin: '0 0 20px 0', fontSize: 18 }}>ดาวน์โหลดรายงาน (Reports & Export)</h2>
             <p style={{ color: COLORS.textDim, marginBottom: 24 }}>เลือกชุดข้อมูลที่ต้องการดาวน์โหลด เพื่อนำไปวิเคราะห์ต่อยอด</p>
             
             <div style={{ marginBottom: 32 }}>
               <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: COLORS.text }}>1. เลือกชุดข้อมูล (Dataset)</label>
               <div style={{ display: 'flex', gap: 12 }}>
                 <button 
                   onClick={() => setExportDataset('price')}
                   style={{ 
                     padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                     background: exportDataset === 'price' ? COLORS.blue : COLORS.bgCard,
                     color: exportDataset === 'price' ? '#FFF' : COLORS.textDim,
                     border: `1px solid ${exportDataset === 'price' ? COLORS.blue : COLORS.border}`
                   }}
                 >
                   ราคายางย้อนหลัง (Price History)
                 </button>
                 <button 
                   onClick={() => setExportDataset('community')}
                   style={{ 
                     padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                     background: exportDataset === 'community' ? COLORS.blue : COLORS.bgCard,
                     color: exportDataset === 'community' ? '#FFF' : COLORS.textDim,
                     border: `1px solid ${exportDataset === 'community' ? COLORS.blue : COLORS.border}`
                   }}
                 >
                   กระดานสนทนาชุมชน (Community Posts)
                 </button>
               </div>
             </div>

             <div style={{ marginBottom: 32 }}>
               <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: COLORS.text }}>2. เลือกรูปแบบไฟล์ (Format)</label>
               <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => downloadFile('Excel / CSV')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32, background: '#F0FDF4', border: `2px dashed ${COLORS.green}`, borderRadius: 16, cursor: 'pointer', width: 200, transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#DCFCE7'}
                    onMouseOut={e => e.currentTarget.style.background = '#F0FDF4'}
                  >
                    <FileText size={48} color={COLORS.green} />
                    <span style={{ fontWeight: 700, color: COLORS.greenDark }}>Export Excel / CSV</span>
                  </button>

                  <button 
                    onClick={() => downloadFile('PDF Report')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32, background: '#FEF2F2', border: `2px dashed ${COLORS.red}`, borderRadius: 16, cursor: 'pointer', width: 200, transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseOut={e => e.currentTarget.style.background = '#FEF2F2'}
                  >
                    <FileText size={48} color={COLORS.red} />
                    <span style={{ fontWeight: 700, color: COLORS.red }}>Export PDF</span>
                  </button>
               </div>
             </div>

             <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: COLORS.text }}>ตัวอย่างข้อมูลที่จะดาวน์โหลด: {exportDataset === 'price' ? 'ราคายางย้อนหลัง' : 'กระดานสนทนาชุมชน'}</h3>
                
                {exportDataset === 'price' ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#E2E8F0', color: COLORS.textDim, textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', borderRadius: '8px 0 0 8px' }}>วันที่</th>
                        <th style={{ padding: '8px 12px' }}>ภูมิภาค</th>
                        <th style={{ padding: '8px 12px' }}>ชนิดยาง</th>
                        <th style={{ padding: '8px 12px', borderRadius: '0 8px 8px 0' }}>ราคา (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataList.slice(0, 5).map(item => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: '12px' }}>{item.date}</td>
                          <td style={{ padding: '12px' }}>{item.region}</td>
                          <td style={{ padding: '12px' }}>{item.grade}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                      {dataList.length > 5 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '12px', color: COLORS.textDim, fontStyle: 'italic' }}>
                            ... และข้อมูลอื่นๆ อีก {dataList.length - 5} รายการ ...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#E2E8F0', color: COLORS.textDim, textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', borderRadius: '8px 0 0 8px' }}>ผู้โพสต์</th>
                        <th style={{ padding: '8px 12px' }}>เนื้อหา</th>
                        <th style={{ padding: '8px 12px', borderRadius: '0 8px 8px 0' }}>ยอดถูกใจ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminPosts.slice(0, 5).map(item => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{item.author}</td>
                          <td style={{ padding: '12px' }}>{item.text}</td>
                          <td style={{ padding: '12px', color: COLORS.blue }}>{item.likes || 0}</td>
                        </tr>
                      ))}
                      {adminPosts.length > 5 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '12px', color: COLORS.textDim, fontStyle: 'italic' }}>
                            ... และข้อมูลอื่นๆ อีก {adminPosts.length - 5} รายการ ...
                          </td>
                        </tr>
                      )}
                      {adminPosts.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: COLORS.textDim }}>ไม่มีข้อมูล</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
