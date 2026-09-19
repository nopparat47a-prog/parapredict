import React, { useState } from 'react';
import { Users, Handshake, ArrowRight, User, MessageSquare, AlertTriangle, CheckCircle, Send, BadgeCheck, Plus, X } from 'lucide-react';
import { COLORS } from '../App';
import { LATEST_PRICES } from '../data/mockRealData';

// Removed mock data as requested. State will initialize from localStorage.

export default function CommunityGrowth() {
  // Community Board State
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedPostId, setExpandedPostId] = useState(null); 

  // Matchmaking State
  const [matchList, setMatchList] = useState(() => {
    const saved = localStorage.getItem('community_matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isComposing, setIsComposing] = useState(false);

  // Real Chat Modal State
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  React.useEffect(() => {
    localStorage.setItem('community_posts', JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    localStorage.setItem('community_matches', JSON.stringify(matchList));
  }, [matchList]);
  const [mType, setMType] = useState("sell");
  const [mItem, setMItem] = useState("น้ำยางสด");
  const [mAmount, setMAmount] = useState("");
  const [mPrice, setMPrice] = useState("");
  const [mLocation, setMLocation] = useState("");

  const handleSendPost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: "คุณ (ผู้ใช้งาน)",
      time: "เมื่อสักครู่",
      type: "general",
      text: newPost,
      expertReplied: false,
      comments: [] // New post has no comments yet
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handlePostMatch = () => {
    if (!mAmount.trim() || !mPrice.trim() || !mLocation.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const newMatch = {
      id: Date.now(),
      type: mType,
      name: "คุณ (ผู้ใช้งาน)",
      item: mItem,
      amount: mAmount,
      location: mLocation,
      price: mPrice
    };
    setMatchList([newMatch, ...matchList]);
    setIsComposing(false);
    // Reset form
    setMAmount("");
    setMPrice("");
    setMLocation("");
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'me', text: chatInput, time: 'เมื่อสักครู่' }]);
    setChatInput("");
    // Simulate auto-reply after 1 second
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'other', text: 'สวัสดีครับ สนใจครับ ขอรายละเอียดเพิ่มเติมหน่อยครับ', time: 'เมื่อสักครู่' }]);
    }, 1000);
  };

  const handleOpenChat = (item) => {
    setActiveChat(item);
    setChatMessages([
      { sender: 'other', text: `สวัสดีครับ ผมสนใจประกาศ ${item.type === 'buy' ? 'รับซื้อ' : 'ขาย'} ${item.item} ของคุณครับ`, time: '1 นาทีที่แล้ว' }
    ]);
  };

  return (
    <div style={{ padding: '24px 28px', color: COLORS.text }}>
      
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        
        {/* LEFT: COMMUNITY BOARD */}
        <div style={{ flex: '1 1 40%', minWidth: 350 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <MessageSquare color={COLORS.brown} /> 
            กระดานสนทนา & ถามผู้เชี่ยวชาญ
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            แจ้งปัญหาโรคพืช แลกเปลี่ยนความรู้ และรับคำแนะนำจากนักวิชาการเกษตร
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
            {/* Input form */}
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.greenDark }}>
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPost()}
                  placeholder="มีคำถามหรืออยากแจ้งเตือนเรื่องอะไร พิมพ์ที่นี่..."
                  style={{ 
                    flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
                    background: 'transparent', color: COLORS.text, fontSize: 15, outline: 'none'
                  }}
                />
                <button 
                  onClick={handleSendPost}
                  style={{ 
                    background: COLORS.green, color: '#FFF', border: 'none', borderRadius: '50%', 
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' 
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Send size={18} style={{ marginLeft: -2 }} />
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map((post) => {
                const isExpanded = expandedPostId === post.id;
                
                return (
                  <div key={post.id} style={{ 
                    padding: '16px', background: post.type === 'alert' ? '#FEF2F2' : COLORS.bg, borderRadius: 12,
                    border: `1px solid ${post.type === 'alert' ? COLORS.red : COLORS.border}`,
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: post.type === 'alert' ? COLORS.red : COLORS.brownDark }}>{post.author}</span>
                        {post.expertReplied && <BadgeCheck size={14} color={COLORS.green} title="ผู้เชี่ยวชาญตอบแล้ว" />}
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.textDim }}>{post.time}</span>
                    </div>
                    
                    <div style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.5, marginBottom: 12, fontWeight: post.type === 'alert' ? 600 : 400 }}>
                      {post.text}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: COLORS.textDim, fontWeight: 500 }}>
                      <span 
                        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'color 0.2s', color: isExpanded ? COLORS.brown : COLORS.textDim }}
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageSquare size={14} /> {post.comments.length} ความคิดเห็น
                      </span>
                      {post.expertReplied && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: COLORS.greenDark }}>
                          <CheckCircle size={14} /> มีคำแนะนำจากผู้เชี่ยวชาญ
                        </span>
                      )}
                    </div>

                    {/* Comments Section (Visible when expanded) */}
                    {isExpanded && (
                      <div style={{ marginTop: 16, borderTop: `1px dashed ${COLORS.border}`, paddingTop: 16, animation: 'fadeIn 0.3s ease' }}>
                        {post.comments.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {post.comments.map(c => (
                              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                                <div style={{ 
                                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                  background: c.isExpert ? COLORS.green : COLORS.border, 
                                  color: c.isExpert ? '#FFF' : COLORS.textDim,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {c.isExpert ? <BadgeCheck size={16} /> : <User size={16} />}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: c.isExpert ? COLORS.greenDark : COLORS.text, marginBottom: 2 }}>
                                    {c.author}
                                  </div>
                                  <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.4 }}>
                                    {c.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: COLORS.textDim, textAlign: 'center', fontStyle: 'italic' }}>
                            ยังไม่มีความคิดเห็น...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT: MATCHMAKING */}
        <div style={{ flex: '1 1 50%', minWidth: 400 }}>
          <h2 style={{ fontSize: 22, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.text }}>
            <Handshake color={COLORS.green} /> 
            ตลาดกลางจับคู่ซื้อขาย
          </h2>
          <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 16 }}>
            พบผู้ซื้อและผู้ขายตัวจริง อ้างอิงราคากลางจากระบบเพื่อความยุติธรรม
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 12 
          }}>
            {/* COMPOSER FORM */}
            {isComposing ? (
              <div style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>สร้างประกาศใหม่</h3>
                  <button onClick={() => setIsComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textDim }}>
                    <X size={20} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setMType('sell')}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, background: mType === 'sell' ? COLORS.brownLight : COLORS.bg, border: `1px solid ${mType === 'sell' ? COLORS.brown : COLORS.border}`, color: mType === 'sell' ? COLORS.brownDark : COLORS.text, fontWeight: 600, cursor: 'pointer' }}
                  >ฉันต้องการขาย</button>
                  <button 
                    onClick={() => setMType('buy')}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, background: mType === 'buy' ? COLORS.greenLight : COLORS.bg, border: `1px solid ${mType === 'buy' ? COLORS.green : COLORS.border}`, color: mType === 'buy' ? COLORS.greenDark : COLORS.text, fontWeight: 600, cursor: 'pointer' }}
                  >ฉันต้องการซื้อ</button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <select 
                    value={mItem} onChange={(e) => setMItem(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, outline: 'none' }}
                  >
                    <option value="น้ำยางสด">น้ำยางสด</option>
                    <option value="ยางแผ่นดิบ">ยางแผ่นดิบ</option>
                    <option value="ยางแผ่นรมควันชั้น 3">ยางแผ่นรมควันชั้น 3</option>
                    <option value="ขี้ยางก้อนถ้วย">ขี้ยางก้อนถ้วย</option>
                  </select>
                  <input 
                    type="text" placeholder="ปริมาณ (เช่น 5 ตัน, 500 กก.)" 
                    value={mAmount} onChange={(e) => setMAmount(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" placeholder="ราคาที่ตั้ง (เช่น 85 ฿, ราคากลาง +1)" 
                    value={mPrice} onChange={(e) => setMPrice(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, outline: 'none' }}
                  />
                  <input 
                    type="text" placeholder="สถานที่ / จังหวัด" 
                    value={mLocation} onChange={(e) => setMLocation(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, outline: 'none' }}
                  />
                </div>

                <button 
                  onClick={handlePostMatch}
                  style={{
                    background: COLORS.green, color: '#FFF', border: 'none', padding: '12px', borderRadius: 8,
                    fontWeight: 700, cursor: 'pointer', marginTop: 8
                  }}
                >
                  โพสต์ประกาศลงตลาด
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsComposing(true)}
                style={{
                  background: COLORS.bg,
                  border: `2px dashed ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 16,
                  color: COLORS.greenDark,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = COLORS.greenLight; }}
                onMouseOut={(e) => { e.currentTarget.style.background = COLORS.bg; }}
              >
                <Plus size={18} /> ลงประกาศซื้อขายของคุณ
              </button>
            )}

            {matchList.map((item) => (
              <div key={item.id} style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderLeft: `5px solid ${item.type === 'buy' ? COLORS.green : COLORS.brown}`,
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ 
                      fontSize: 11, padding: '4px 8px', borderRadius: 6, 
                      background: item.type === 'buy' ? COLORS.greenLight : COLORS.brownLight,
                      color: item.type === 'buy' ? COLORS.greenDark : COLORS.brownDark,
                      fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {item.type === 'buy' ? 'ต้องการซื้อ' : 'ต้องการขาย'}
                    </span>
                    <span style={{ fontSize: 13, color: COLORS.textDim, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      <User size={14} /> {item.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
                    {item.item} · {item.amount}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 500 }}>
                    📍 {item.location}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>
                    {item.price}
                  </div>
                  <button 
                    onClick={() => handleOpenChat(item)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8,
                      padding: '8px 12px', color: COLORS.text, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = COLORS.green; e.currentTarget.style.color = '#FFF'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = COLORS.bg; e.currentTarget.style.color = COLORS.text; }}
                  >
                    แชทติดต่อ <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {matchList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textDim, background: COLORS.bgCard, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
                ยังไม่มีประกาศซื้อขายในขณะนี้
              </div>
            )}
          </div>
          
        </div>

      </div>

      {/* CHAT MODAL */}
      {activeChat && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFF', width: '100%', maxWidth: 450, borderRadius: 16,
            display: 'flex', flexDirection: 'column', height: '80vh', maxHeight: 600,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeIn 0.2s ease'
          }}>
            {/* Chat Header */}
            <div style={{ background: COLORS.green, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF', color: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{activeChat.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>กำลังออนไลน์</div>
                </div>
              </div>
              <button onClick={() => setActiveChat(null)} style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, background: '#F1F5F9', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ 
                    background: msg.sender === 'me' ? COLORS.green : '#FFF', 
                    color: msg.sender === 'me' ? '#FFF' : COLORS.text,
                    padding: '10px 14px', borderRadius: 16, 
                    borderBottomRightRadius: msg.sender === 'me' ? 4 : 16,
                    borderBottomLeftRadius: msg.sender === 'me' ? 16 : 4,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: 15
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4, textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{ padding: 16, background: '#FFF', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 12 }}>
              <input 
                type="text" value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="พิมพ์ข้อความ..." 
                style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: `1px solid ${COLORS.border}`, outline: 'none', fontSize: 15 }}
              />
              <button 
                onClick={handleSendChatMessage}
                style={{ background: COLORS.green, color: '#FFF', border: 'none', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={20} style={{ marginLeft: -2 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
