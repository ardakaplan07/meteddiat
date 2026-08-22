"use client";

import { useState, useEffect, MouseEvent, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

// =========================================================
// SUPABASE BAĞLANTI AYARLARI
// =========================================================
const SUPABASE_URL = "https://bfcrpnbyosfrrcakiiky.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3JwbmJ5b3NmcnJjYWtpaWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDA3MTEsImV4cCI6MjEwMjk3NjcxMX0.aQcHlB-bKJOq-wAKjG4PzhPNDqNR_yqLQMcpBe9UHOE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================
// SABİTLER
// =========================================================
const ADMIN_EMAIL = "ardakaplan1425@gmail.com";
const ADMIN_PASS = "paGmod-qegfi7-hojcyp";
const TYPING_TEXT_FULL = "Geleceğin donanımını ve algoritmasını üretiyoruz.";

export default function Home() {
  // --- STATE TANIMLAMALARI ---
  
  // UI Kontrolleri
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Animasyonlar
  const [typedText, setTypedText] = useState("");
  const [glitchShadow, setGlitchShadow] = useState("none");

  // Auth Formları
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });

  // Veritabanı State'leri
  const [currentUser, setCurrentUser] = useState("");
  const [allUsersDB, setAllUsersDB] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [tasksDB, setTasksDB] = useState<any[]>([]);
  const [systemStatusDB, setSystemStatusDB] = useState<any[]>([]);

  // Dashboard Formları
  const [taskName, setTaskName] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskStatus, setTaskStatus] = useState("Devam Ediyor");
  const [sysNameInput, setSysNameInput] = useState("");
  const [sysStatusInput, setSysStatusInput] = useState("");

  // --- EFEKTLER (useEffect) ---
  
  useEffect(() => {
    setTasksDB(JSON.parse(localStorage.getItem("meteddiat_tasks") || "[]"));
    setSystemStatusDB(JSON.parse(localStorage.getItem("meteddiat_sys_status") || "[]"));
  }, []);

  useEffect(() => {
    let i = 0;
    let timeoutId: NodeJS.Timeout;
    const typeWriter = () => {
      if (i < TYPING_TEXT_FULL.length) {
        setTypedText(TYPING_TEXT_FULL.slice(0, i + 1));
        i++;
        timeoutId = setTimeout(typeWriter, 50);
      }
    };
    const initialDelay = setTimeout(typeWriter, 1000);
    return () => { clearTimeout(timeoutId); clearTimeout(initialDelay); };
  }, []);

  useEffect(() => {
    if (isAdminPanelOpen) fetchAllUsers();
  }, [isAdminPanelOpen]);

  useEffect(() => {
    if (isDashboardOpen) fetchApprovedUsers();
  }, [isDashboardOpen]);


  // --- SUPABASE VERİ ÇEKME FONKSİYONLARI ---
  
  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) setAllUsersDB(data);
  };

  const fetchApprovedUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('status', 'approved');
    if (!error && data) setApprovedUsers(data);
  };

  // --- YETKİLENDİRME (AUTH) FONKSİYONLARI ---

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regEmail === ADMIN_EMAIL) {
      setAuthMsg({ text: "Bu e-posta adresi yönetici hesabıdır, kullanılamaz!", type: "error" });
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert([{ name: regName, email: regEmail, password: regPass, status: 'pending' }]);

    if (error) {
      setAuthMsg({ text: "Bir hata oluştu veya bu e-posta zaten sistemde kayıtlı!", type: "error" });
    } else {
      setAuthMsg({ text: "Başvurunuz alındı. Admin onayladıktan sonra giriş yapabileceksiniz.", type: "success" });
      setRegName(""); setRegEmail(""); setRegPass("");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (loginEmail === ADMIN_EMAIL && loginPass === ADMIN_PASS) {
      setAuthMsg({ text: "", type: "" });
      setCurrentUser("Arda Kaplan (Admin)");
      setIsLoginModalOpen(false);
      setIsAdminPanelOpen(true);
      return;
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginEmail)
      .eq('password', loginPass);

    if (error || !users || users.length === 0) {
      setAuthMsg({ text: "Hatalı e-posta veya parola.", type: "error" });
      return;
    }

    const user = users[0];
    setCurrentUser(user.name);

    if (user.status === 'pending') {
      setAuthMsg({ text: "Erişim Reddedildi: Hesabınız henüz Admin tarafından onaylanmamış.", type: "error" });
    } else if (user.status === 'approved') {
      setAuthMsg({ text: "Erişim Sağlandı: Komuta Merkezine Aktarılıyor...", type: "success" });
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setIsDashboardOpen(true);
        setLoginEmail(""); setLoginPass(""); setAuthMsg({ text: "", type: "" });
      }, 1500);
    }
  };

  // --- ADMİN İŞLEMLERİ ---
  const changeUserStatus = async (email: string, newStatus: string) => {
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('email', email);
    if (!error) fetchAllUsers();
    else alert("Yetki değiştirilirken hata oluştu!");
  };

  // --- DASHBOARD (GÖREV VE SİSTEM) İŞLEMLERİ ---
  const handleAddTask = () => {
    if (!taskName || !taskAssignee) return alert("Lütfen görev adı ve sorumlu kişi girin.");

    const newTask = {
      id: Date.now(), name: taskName, assignee: taskAssignee,
      status: taskStatus, isCompleted: false, dateCompleted: null
    };
    
    const updatedTasks = [...tasksDB, newTask];
    setTasksDB(updatedTasks);
    localStorage.setItem('meteddiat_tasks', JSON.stringify(updatedTasks));
    setTaskName(""); setTaskAssignee("");
  };

  const completeTask = (taskId: number) => {
    const updatedTasks = tasksDB.map(t => {
      if (t.id === taskId) {
        const d = new Date();
        return { ...t, isCompleted: true, dateCompleted: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` };
      }
      return t;
    });
    setTasksDB(updatedTasks);
    localStorage.setItem('meteddiat_tasks', JSON.stringify(updatedTasks));
  };

  const handleAddSystemStatus = () => {
    if (!sysNameInput || !sysStatusInput) return;
    const newSys = [...systemStatusDB, { name: sysNameInput, status: sysStatusInput }];
    setSystemStatusDB(newSys);
    localStorage.setItem('meteddiat_sys_status', JSON.stringify(newSys));
    setSysNameInput(""); setSysStatusInput("");
  };

  const handleHeroMouseMove = (e: MouseEvent<HTMLElement>) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;
    setGlitchShadow(`${x}px ${y}px 0px rgba(54, 209, 220, 0.7), ${-x}px ${-y}px 0px rgba(255, 94, 98, 0.7)`);
  };

  return (
    <>
      <div className="code-bg-overlay"></div>

      {/* --- ANA SAYFA --- */}
      <div style={{ display: isDashboardOpen || isAdminPanelOpen ? "none" : "block" }}>
        
        <nav className="navbar">
          <div className="nav-brand">
            <div className="logo-pill">
              <img src="/assets/ddi-logo.png" alt="DDİAT" />
              <img src="/assets/mete-logo.png" alt="M.E.T.E." />
            </div>
            <span className="brand-text">DDİAT <span className="gradient-text">|</span> METE</span>
          </div>
          <ul className="nav-links">
            <li><a href="#hero">// Başlangıç</a></li>
            <li><a href="#hakkimizda">Hakkımızda()</a></li>
            <li><a href="#instagram">Sosyal</a></li>
            <li><a href="#iletisim">Bize Ulaşın</a></li>
            <li><a href="#basvuru" className="btn-outline">Sisteme Katıl</a></li>
            <li>
              <button className="btn-glow" onClick={() => { setIsLoginModalOpen(true); setAuthMsg({text:"", type:""}); }}>
                <i className="fa-solid fa-terminal"></i> Üye Paneli
              </button>
            </li>
          </ul>
        </nav>

        <div className="announcement-ticker">
          <div className="ticker-content">
            <span className="pulse-dot"></span> <b>GÜNCELLEME:</b> Otonom su altı araçlarımızın (HROV) ve uydu sistemlerimizin tasarım aşamaları hız kesmeden devam ediyor.
            <span className="pulse-dot" style={{ marginLeft: "30px" }}></span> <b>DUYURU:</b> Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu (DDİAT) yeni dönem projeleri için hazırlıklarını tamamlıyor!
            <span className="pulse-dot" style={{ marginLeft: "30px" }}></span> <b>SİSTEM:</b> Kaskat PID kontrolcü ve telemetri loglama testleri başarıyla sonuçlandı.
          </div>
        </div>

        <header id="hero" onMouseMove={handleHeroMouseMove} onMouseLeave={() => setGlitchShadow("none")}>
          <div className="hero-container">
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="btn-close"></span><span className="btn-min"></span><span className="btn-max"></span>
                <span className="terminal-title">bash - root@mete-ddiat</span>
              </div>
              <div className="terminal-body">
                <p className="command">{">"} ./init_ecosystem.sh</p>
                <p className="output text-green">Yükleniyor... M.E.T.E. Otonom Araç Sistemleri [OK]</p>
                <p className="output text-green">Yükleniyor... DDİAT Araştırma Modelleri [OK]</p>
                <p className="typewriter">{typedText}</p>
              </div>
            </div>
            <h1 className="glitch-text" style={{ textShadow: glitchShadow }}>MÜHENDİSLİK & YAPAY ZEKA</h1>
            <p className="hero-sub">Otonom robotik sistemler, model uydular ve dil modellerinin kesişim noktası.</p>
          </div>
        </header>
        
        {/* Hakkımızda Bölümü */}
        <section id="hakkimizda">
          <h2 className="section-title"><span className="gradient-text">#</span> Biz Kimiz?</h2>
          <div className="about-grid">
            <div className="about-card mete-card">
              <i className="fa-solid fa-microchip card-icon"></i>
              <h3>M.E.T.E.</h3>
              <h4 className="sub-title">Mühendislik Elektronik ve Teknoloji Ekibi</h4>
              <p>Donanım ve yazılımın sınırlarını zorlayan, çok disiplinli bir mühendislik gücüyüz. Geliştirdiğimiz otonom su altı araçları (HROV), insansız su üstü deniz sistemleri ve model uydu projeleri ile geleceğin otonom teknolojilerini uçtan uca kendimiz üretiyoruz. Mekanik tasarımlarımızdan gömülü sistemlerimize kadar her aşamada; Jetson Nano, Pixhawk, YOLO tabanlı nesne tespiti ve karmaşık 6-DOF hareket algoritmalarını harmanlayarak uluslararası standartlarda üretim yapıyoruz.</p>
              <div className="tech-stack"><span>Python</span><span>C++</span><span>OpenCV</span><span>PyQt6</span><span>MATLAB</span></div>
            </div>
            <div className="about-card ddi-card">
              <i className="fa-solid fa-network-wired card-icon"></i>
              <h3>DDİAT</h3>
              <h4 className="sub-title">Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu</h4>
              <p>Akdeniz Üniversitesi çatısı altında, makine öğrenmesi ve büyük dil modellerinin (LLM) akademik ve pratik uygulamalarına odaklanıyoruz. Semantik analiz, veri madenciliği ve Türkçe diline özgü yapay zeka mimarileri üzerine derinlemesine araştırmalar yürüterek, teorik bilgiyi mühendislik çözümlerine dönüştürüyoruz.</p>
              <div className="tech-stack"><span>PyTorch</span><span>FastAPI</span><span>LLM</span><span>NLP</span></div>
            </div>
          </div>
        </section>

        {/* Sponsorlar */}
        <section id="sponsorlar">
          <h2 className="section-title text-center"><span className="gradient-text">#</span> Destekçilerimiz</h2>
          <p className="text-center" style={{ color: "#888", marginBottom: "40px" }}>Birlikte daha güçlü, daha ileriye.</p>
          <div className="sponsor-grid">
            <div className="sponsor-item">
              <i className="fa-solid fa-flask sponsor-icon"></i>
              <p>Antalya Bilim Merkezi</p>
            </div>
            <div className="sponsor-item placeholder-sponsor">
              <i className="fa-solid fa-plus sponsor-icon"></i>
              <p>Sponsorumuz Olun</p>
            </div>
          </div>
        </section>

        {/* Sosyal Ağ */}
        <section id="instagram">
          <h2 className="section-title"><span className="gradient-text">#</span> Sosyal Ağ</h2>
          <div className="insta-grid">
            <a href="https://www.instagram.com/akdeniznlp/" target="_blank" rel="noreferrer" className="insta-card">
              <div className="insta-overlay" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.9), rgba(0,0,0,0.85))" }}></div>
              <div className="insta-content">
                <img src="/assets/ddi-logo.png" alt="DDİAT" className="insta-card-logo" />
                <div className="insta-text">
                  <h3>@akdeniznlp</h3>
                  <p>DDİAT yapay zeka etkinlikleri, araştırma duyuruları ve seminerler.</p>
                </div>
              </div>
              <div className="insta-footer"><i className="fa-brands fa-instagram"></i><span className="btn-insta">Takip Et</span></div>
            </a>
            <a href="https://www.instagram.com/mete.tech_team?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="insta-card">
              <div className="insta-overlay" style={{ background: "linear-gradient(135deg, rgba(255,94,98,0.9), rgba(0,0,0,0.85))" }}></div>
              <div className="insta-content">
                <img src="/assets/mete-logo.png" alt="METE" className="insta-card-logo" />
                <div className="insta-text">
                  <h3>@mete.tech_team</h3>
                  <p>Atölyeden anlık kareler, tasarım süreçleri ve mühendislik günlüklerimiz.</p>
                </div>
              </div>
              <div className="insta-footer"><i className="fa-brands fa-instagram"></i><span className="btn-insta">Takip Et</span></div>
            </a>
          </div>
        </section>
        
        {/* İletişim */}
        <section id="iletisim" className="contact-section">
          <div className="container">
            <h2 className="section-title text-center"><span className="gradient-text">#</span> Bize Ulaşın</h2>
            <p className="text-center" style={{ color: "#888", marginBottom: "40px" }}>İş birlikleri, sponsorluk ve sorularınız için ağımıza bağlanın.</p>
            
            <div className="contact-grid">
              <div className="contact-info-card">
                <h3>İletişim Bilgileri</h3>
                <ul className="contact-list">
                  <li><i className="fa-solid fa-envelope"></i> <span>ardakaplan1425@gmail.com</span></li>
                  <li><i className="fa-solid fa-location-dot"></i> <span>Akdeniz Üniversitesi, Antalya</span></li>
                  <li><i className="fa-solid fa-phone"></i> <span>+90 (535) 081 14 10</span></li>
                </ul>
              </div>
              
              <form action="https://formspree.io/f/mppabbpb" method="POST" className="cyber-form contact-form">
                <div className="input-group">
                  <input type="text" name="Ad_Soyad" required placeholder=" " />
                  <label>Adınız Soyadınız</label>
                </div>
                <div className="input-group">
                  <input type="email" name="E_Posta" required placeholder=" " />
                  <label>E-Posta Adresiniz</label>
                </div>
                <div className="input-group">
                  <textarea name="Mesaj" required rows={4} placeholder=" "></textarea>
                  <label>Mesajınız</label>
                </div>
                <input type="hidden" name="_next" value="https://seninsiteninadresi.com" />
                <button type="submit" className="btn-glow w-100">MESAJI İLET //{">"}</button>
              </form>
            </div>
          </div>
        </section>

        {/* Başvuru */}
        <section id="basvuru" className="apply-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Sisteme Katıl</h2>
              <p>Yeni yetenekler arıyoruz. Hangi ekibe katılmak istersin?</p>
            </div>
            <form action="https://formspree.io/f/mnpawwdq" method="POST" className="cyber-form">
              <div className="input-group">
                <input type="text" name="Basvuru_Yapan_Kişi" required placeholder=" " />
                <label>Ad Soyad</label>
              </div>
              <div className="input-group">
                <input type="email" name="Basvuru_Eposta" required placeholder=" " />
                <label>E-Posta</label>
              </div>
              <div className="input-group select-group">
                <select name="Tercih_Edilen_Ekip" required defaultValue="">
                  <option value="" disabled>Hedef Ekip Seçin</option>
                  <option value="M.E.T.E.">M.E.T.E. (Donanım/Yazılım/Mekanik)</option>
                  <option value="DDİAT">DDİAT (Yapay Zeka/Araştırma)</option>
                </select>
              </div>
              <div className="input-group">
                <textarea name="Basvuru_Nedeni" required rows={3} placeholder=" "></textarea>
                <label>Neden bizimle olmak istiyorsun?</label>
              </div>
              <input type="hidden" name="_next" value="https://seninsiteninadresi.com" />
              <button type="submit" className="btn-glow w-100">BAŞVURU YAP //{">"}</button>
            </form>
          </div>
        </section>
      </div>


      {/* --- ÜYE PANELİ MODALI --- */}
      {isLoginModalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setIsLoginModalOpen(false) }}>
          <div className="modal-box">
            <span className="close-modal" onClick={() => setIsLoginModalOpen(false)}>&times;</span>
            <div className="modal-header">
              <i className="fa-solid fa-shield-halved fa-2x"></i>
              <h2>Gizli Ağ Erişimi</h2>
              <p className="modal-desc">Sistem kaynaklarına erişim sağlamak için kimliğinizi doğrulayın.</p>
            </div>

            <div className="auth-tabs">
              <button className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => {setAuthTab('login'); setAuthMsg({text:"", type:""})}}>Giriş Yap</button>
              <button className={`tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => {setAuthTab('register'); setAuthMsg({text:"", type:""})}}>Kayıt Ol</button>
            </div>

            {authTab === 'login' ? (
              <form className="auth-form active" onSubmit={handleLogin}>
                <div className="input-group">
                  <input type="email" required placeholder=" " value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  <label>Kayıtlı E-Posta Adresi</label>
                </div>
                <div className="input-group">
                  <input type="password" required placeholder=" " value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                  <label>Parola</label>
                </div>
                <button type="submit" className="btn-glow w-100">AĞA BAĞLAN</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
                
                <div className="admin-note">
                  <i className="fa-solid fa-lock"></i>
                  <span>Sisteme giriş izniniz <b>Admin (Arda Kaplan)</b> tarafından doğrulanıp aktifleştirilmektedir.</span>
                </div>
              </form>
            ) : (
              <form className="auth-form active" onSubmit={handleRegister}>
                <div className="input-group">
                  <input type="text" required placeholder=" " value={regName} onChange={(e) => setRegName(e.target.value)} />
                  <label>Adınız Soyadınız</label>
                </div>
                <div className="input-group">
                  <input type="email" required placeholder=" " value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  <label>E-Posta Adresi (Üniversite/Kişisel)</label>
                </div>
                <div className="input-group">
                  <input type="password" required placeholder=" " value={regPass} onChange={(e) => setRegPass(e.target.value)} />
                  <label>Bir Parola Belirleyin</label>
                </div>
                <button type="submit" className="btn-glow w-100">ONAY İÇİN BAŞVUR</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
              </form>
            )}
          </div>
        </div>
      )}


      {/* --- GİZLİ ADMİN PANELİ --- */}
      {isAdminPanelOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-dashboard" style={{ background: '#0a0a0f', padding: '2rem', borderRadius: '10px', width: '90%', maxWidth: '1000px', border: '1px solid var(--accent-red)' }}>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2><i className="fa-solid fa-terminal"></i> ROOT // ADMIN PANEL</h2>
                <p>Ağ Yöneticisi: {currentUser}</p>
              </div>
              <button className="btn-outline" onClick={() => setIsAdminPanelOpen(false)}>Sistemden Çık</button>
            </div>
            
            <div className="admin-content">
              <h3>Bekleyen Başvurular</h3>
              <div className="table-container">
                <table className="cyber-table">
                  <thead><tr><th>İsim</th><th>E-Posta</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'pending').map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.name}</td><td>{user.email}</td>
                        <td><button className="btn-action btn-approve" onClick={() => changeUserStatus(user.email, 'approved')}>Ağa İzin Ver</button></td>
                      </tr>
                    ))}
                    {allUsersDB.filter(u => u.status === 'pending').length === 0 && (
                      <tr><td colSpan={3} style={{color:'#666', textAlign: 'center', padding: '15px'}}>Bekleyen başvuru yok.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h3 style={{ marginTop: '40px' }}>Onaylı Üyeler</h3>
              <div className="table-container">
                <table className="cyber-table">
                  <thead><tr><th>İsim</th><th>E-Posta</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'approved').map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.name}</td><td>{user.email}</td>
                        <td><button className="btn-action btn-revoke" onClick={() => changeUserStatus(user.email, 'pending')}>Yetkiyi İptal Et</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* --- ÜYE KONTROL MERKEZİ (DASHBOARD) --- */}
      {isDashboardOpen && (
        <div className="dashboard-fullscreen" style={{ display: "block", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "#09090b", zIndex: 9999, overflowY: "auto" }}>
          <div className="dash-navbar" style={{ padding: "20px", display: "flex", justifyContent: "space-between", background: "#121218", borderBottom: "1px solid #222" }}>
            <div className="dash-brand"><i className="fa-solid fa-terminal"></i> ROOT // KOMUTA MERKEZİ</div>
            <button className="btn-outline" onClick={() => setIsDashboardOpen(false)}>Ağdan Çık (Logout)</button>
          </div>
          
          <div className="dash-grid" style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            
            {/* Sistem Durumu */}
            <div className="dash-card" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-server"></i> Sistem Durumu Bildir</h3>
              <input type="text" placeholder="Sistem Adı (Örn: Pixhawk)" value={sysNameInput} onChange={(e) => setSysNameInput(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333" }} />
              <input type="text" placeholder="Durum (Örn: Bağlı, 45°C)" value={sysStatusInput} onChange={(e) => setSysStatusInput(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "15px", background: "#0a0a0f", color: "white", border: "1px solid #333" }} />
              <button className="btn-glow" style={{ width: "100%" }} onClick={handleAddSystemStatus}>Durum Ekle</button>
              
              <div style={{ marginTop: "20px" }}>
                {systemStatusDB.map((sys, idx) => (
                  <div key={idx} className="status-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                    <span>{sys.name}</span>
                    <div><span className="pulse-dot"></span> {sys.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aktif İstasyonlar */}
            <div className="dash-card" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-users"></i> Aktif İstasyonlar</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <span>Arda Kaplan (Admin)</span>
                <span className="text-green">[{currentUser.includes("Admin") ? "Şu An Aktif" : "Yetkili"}]</span>
              </div>
              {approvedUsers.map((user, idx) => {
                const isOnline = user.name === currentUser;
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222', color: '#888' }}>
                    <span>{user.name}</span>
                    <span style={{ color: isOnline ? '#10b981' : '#666' }}>[{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}]</span>
                  </div>
                );
              })}
            </div>

            {/* Görev Ekleme ve Listeler */}
            <div className="dash-card" style={{ gridColumn: "span 2", background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-plus"></i> Yeni Görev Planla</h3>
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <input type="text" placeholder="Görev Adı" value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ flex: 2, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333" }} />
                <input type="text" placeholder="Sorumlu" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333" }} />
                <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333" }}>
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Test Ediliyor">Test Ediliyor</option>
                </select>
                <button className="btn-glow" onClick={handleAddTask}>Yayınla</button>
              </div>

              <h3 style={{ marginTop: '30px' }}><i className="fa-solid fa-list-check"></i> Aktif Görevler</h3>
              <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                <thead><tr style={{ color: "#888" }}><th>Görev</th><th>Sorumlu</th><th>Durum</th><th>İşlem</th></tr></thead>
                <tbody>
                  {tasksDB.filter(t => !t.isCompleted).map(task => (
                    <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                      <td style={{ padding: "10px 0" }}>{task.name}</td>
                      <td>{task.assignee}</td>
                      <td style={{ color: task.status === 'Test Ediliyor' ? '#f59e0b' : '#36d1dc' }}>{task.status}</td>
                      <td><button className="btn-outline" onClick={() => completeTask(task.id)}>Tamamla</button></td>
                    </tr>
                  ))}
                  {tasksDB.filter(t => !t.isCompleted).length === 0 && <tr><td colSpan={4} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Aktif görev bulunmuyor.</td></tr>}
                </tbody>
              </table>
              
              <h3 style={{ marginTop: '30px', color: '#10b981' }}><i className="fa-solid fa-check-double"></i> Tamamlananlar</h3>
              <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                <thead><tr style={{ color: "#888" }}><th>Görev</th><th>Sorumlu</th><th>Tarih</th></tr></thead>
                <tbody>
                  {tasksDB.filter(t => t.isCompleted).map(task => (
                    <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                      <td style={{ padding: "10px 0", textDecoration: 'line-through', color: '#666' }}>{task.name}</td>
                      <td>{task.assignee}</td>
                      <td className="text-green">{task.dateCompleted}</td>
                    </tr>
                  ))}
                  {tasksDB.filter(t => t.isCompleted).length === 0 && <tr><td colSpan={3} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Henüz tamamlanan görev yok.</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </>
  );
}