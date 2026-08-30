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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "forgot">("login");
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
  
  // Şifremi Unuttum Formu
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");

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

  // --- E-POSTA DOĞRULAMA FONKSİYONU ---
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // --- EFEKTLER (useEffect) ---

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
    if (isDashboardOpen) {
      fetchApprovedUsers();
      fetchTasks();
      fetchSystemStatus();
      
      const interval = setInterval(() => {
        fetchApprovedUsers();
        fetchTasks();
        fetchSystemStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isDashboardOpen]);

  // ÇEVRİMİÇİ/ÇEVRİMDIŞI KESİN ÇÖZÜMÜ (Mobil Uygulama Kapanma ve Sekme Değişimi)
  useEffect(() => {
    if (!currentUser || currentUser === "Admin") return;

    const updateOnlineStatus = (isOnline: boolean) => {
      const url = `${SUPABASE_URL}/rest/v1/users?name=eq.${encodeURIComponent(currentUser)}`;
      fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_online: isOnline }),
        keepalive: true // Tarayıcı aniden kapansa bile sinyali yollar
      }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateOnlineStatus(false);
      } else {
        updateOnlineStatus(true);
      }
    };

    const handleUnload = () => {
      updateOnlineStatus(false);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleUnload); // Mobil tarayıcılar için kritik
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [currentUser]);


  // --- SUPABASE VERİ ÇEKME FONKSİYONLARI ---
  
  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) setAllUsersDB(data);
  };

  const fetchApprovedUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('status', 'approved');
    if (!error && data) setApprovedUsers(data);
  };

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*');
    if (data) setTasksDB(data);
  };

  const fetchSystemStatus = async () => {
    const { data } = await supabase.from('system_status').select('*');
    if (data) setSystemStatusDB(data);
  };

  // --- YETKİLENDİRME (AUTH) FONKSİYONLARI ---

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(regEmail)) {
      setAuthMsg({ text: "Geçersiz e-posta formatı! Lütfen geçerli bir adres girin.", type: "error" });
      return;
    }

    if (regEmail === ADMIN_EMAIL) {
      setAuthMsg({ text: "Bu e-posta adresi yönetici hesabıdır, kullanılamaz!", type: "error" });
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert([{ name: regName, email: regEmail, password: regPass, status: 'pending', is_online: false }]);

    if (error) {
      setAuthMsg({ text: "Bir hata oluştu veya bu e-posta zaten sistemde kayıtlı!", type: "error" });
    } else {
      setAuthMsg({ text: "Başvurunuz alındı. Admin onayladıktan sonra giriş yapabileceksiniz.", type: "success" });
      setRegName(""); setRegEmail(""); setRegPass("");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(loginEmail)) {
      setAuthMsg({ text: "Lütfen geçerli bir e-posta adresi girin.", type: "error" });
      return;
    }

    if (loginEmail === ADMIN_EMAIL && loginPass === ADMIN_PASS) {
      setAuthMsg({ text: "", type: "" });
      setCurrentUser("Admin");
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
      await supabase.from('users').update({ is_online: true }).eq('email', loginEmail);
      
      setAuthMsg({ text: "Erişim Sağlandı: Komuta Merkezine Aktarılıyor...", type: "success" });
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setIsDashboardOpen(true);
        setLoginEmail(""); setLoginPass(""); setAuthMsg({ text: "", type: "" });
      }, 1500);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      setAuthMsg({ text: "Lütfen geçerli bir e-posta adresi girin.", type: "error" });
      return;
    }

    const { data: users, error: searchError } = await supabase.from('users').select('*').eq('email', resetEmail);
    
    if (searchError || !users || users.length === 0) {
      setAuthMsg({ text: "Sistemde böyle bir e-posta adresi bulunamadı.", type: "error" });
      return;
    }

    const { error: updateError } = await supabase.from('users').update({ password: resetNewPass }).eq('email', resetEmail);

    if (!updateError) {
      setAuthMsg({ text: "Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.", type: "success" });
      setResetEmail(""); setResetNewPass("");
      setTimeout(() => { setAuthTab("login"); setAuthMsg({ text: "", type: "" }); }, 2000);
    } else {
      setAuthMsg({ text: "Şifre güncellenirken bir hata oluştu.", type: "error" });
    }
  };

  const handleLogout = async () => {
    if (currentUser !== "Admin") {
      await supabase.from('users').update({ is_online: false }).eq('name', currentUser);
    }
    setIsDashboardOpen(false);
    setIsAdminPanelOpen(false);
    setCurrentUser("");
  };

  // --- ADMİN İŞLEMLERİ ---
  const changeUserStatus = async (email: string, newStatus: string) => {
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('email', email);
    if (!error) fetchAllUsers();
    else alert("Yetki değiştirilirken hata oluştu!");
  };

  // --- DASHBOARD (GÖREV) İŞLEMLERİ ---
  const handleAddTask = async () => {
    if (!taskName || !taskAssignee) return alert("Lütfen görev adı ve sorumlu kişi girin.");

    const { error } = await supabase.from('tasks').insert([{ 
      id: Date.now(), 
      name: taskName, 
      assignee: taskAssignee, 
      status: taskStatus, 
      is_completed: false 
    }]);

    if (error) {
      console.error("Görev Eklenemedi: ", error);
      alert("Görev Buluta Eklenemedi! Hata detayı konsolda.");
    } else {
      setTaskName(""); setTaskAssignee("");
      fetchTasks();
    }
  };

  const completeTask = async (taskId: number) => {
    const d = new Date();
    const dateStr = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    
    await supabase.from('tasks').update({ is_completed: true, date_completed: dateStr }).eq('id', taskId);
    fetchTasks();
  };

  // --- SİSTEM DURUMU (SİL VE GÜNCELLE FONKSİYONLARI) ---
  const handleAddSystemStatus = async () => {
    if (!sysNameInput || !sysStatusInput) return;
    
    const { error } = await supabase.from('system_status').insert([{ 
      id: Date.now(), 
      name: sysNameInput, 
      status: sysStatusInput 
    }]);

    if (error) {
      console.error("Sistem Eklenemedi: ", error);
      alert("Sistem durumu buluta eklenemedi!");
    } else {
      setSysNameInput(""); setSysStatusInput("");
      fetchSystemStatus();
    }
  };

  const deleteSystemStatus = async (id: number) => {
    if(!confirm("Bu sistemi silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from('system_status').delete().eq('id', id);
    if (!error) fetchSystemStatus();
    else alert("Silinirken bir hata oluştu!");
  };

  const editSystemStatus = async (sys: any) => {
    const newStatus = prompt(`"${sys.name}" için yeni durumu girin:`, sys.status);
    if (newStatus && newStatus !== sys.status) {
      const { error } = await supabase.from('system_status').update({ status: newStatus }).eq('id', sys.id);
      if (!error) fetchSystemStatus();
      else alert("Güncellenirken bir hata oluştu!");
    }
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

          <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </div>

          <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#hero" onClick={() => setIsMobileMenuOpen(false)}>// Başlangıç</a></li>
            <li><a href="#hakkimizda" onClick={() => setIsMobileMenuOpen(false)}>Hakkımızda()</a></li>
            <li><a href="#instagram" onClick={() => setIsMobileMenuOpen(false)}>Sosyal</a></li>
            <li><a href="#iletisim" onClick={() => setIsMobileMenuOpen(false)}>Bize Ulaşın</a></li>
            <li><a href="#basvuru" className="btn-outline" onClick={() => setIsMobileMenuOpen(false)}>Sisteme Katıl</a></li>
            <li>
              <button className="btn-glow" onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); setAuthTab('login'); setAuthMsg({text:"", type:""}); }}>
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
        
        <section id="hakkimizda">
          <h2 className="section-title"><span className="gradient-text">#</span> Biz Kimiz?</h2>
          <div className="about-grid">
            <div className="about-card mete-card">
              <i className="fa-solid fa-microchip card-icon"></i>
              <h3>M.E.T.E.</h3>
              <h4 className="sub-title">Mühendislik Elektronik ve Teknoloji Ekibi</h4>
              <p>Donanım ve yazılımın sınırlarını zorlayan, çok disiplinli bir mühendislik gücüyüz. Geliştirdiğimiz otonom su altı araçları (HROV), insansız su üstü deniz sistemleri ve model uydu projeleri ile geleceğin otonom teknolojilerini uçtan uca kendimiz üretiyoruz.</p>
              <div className="tech-stack"><span>Python</span><span>C++</span><span>OpenCV</span><span>PyQt6</span><span>MATLAB</span></div>
            </div>
            <div className="about-card ddi-card">
              <i className="fa-solid fa-network-wired card-icon"></i>
              <h3>DDİAT</h3>
              <h4 className="sub-title">Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu</h4>
              <p>Akdeniz Üniversitesi çatısı altında, makine öğrenmesi ve büyük dil modellerinin (LLM) akademik ve pratik uygulamalarına odaklanıyoruz. Semantik analiz, veri madenciliği ve Türkçe diline özgü yapay zeka mimarileri üzerine araştırmalar yürütüyoruz.</p>
              <div className="tech-stack"><span>PyTorch</span><span>FastAPI</span><span>LLM</span><span>NLP</span></div>
            </div>
          </div>
        </section>

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
                <div className="input-group"><input type="text" name="Ad_Soyad" required placeholder=" " /><label>Adınız Soyadınız</label></div>
                <div className="input-group"><input type="email" name="E_Posta" required placeholder=" " /><label>E-Posta Adresiniz</label></div>
                <div className="input-group"><textarea name="Mesaj" required rows={4} placeholder=" "></textarea><label>Mesajınız</label></div>
                <input type="hidden" name="_next" value="https://seninsiteninadresi.com" />
                <button type="submit" className="btn-glow w-100">MESAJI İLET //{">"}</button>
              </form>
            </div>
          </div>
        </section>

        {/* YAPAY ZEKA TEMALI YENİ BAŞVURU FORMU (Glassmorphism & Neon Aura) */}
        <section id="basvuru" style={{ position: "relative", display: "flex", justifyContent: "center", padding: "120px 20px", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#050505" }}>
          
          {/* Çok daha güçlü Neon Parlama Efektleri (Arkaplan) */}
          <div style={{ position: "absolute", top: "50%", left: "30%", transform: "translate(-50%, -50%)", width: "400px", height: "400px", background: "rgba(54, 209, 220, 0.4)", filter: "blur(120px)", zIndex: 0, pointerEvents: "none", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", top: "50%", right: "10%", transform: "translate(0, -50%)", width: "400px", height: "400px", background: "rgba(255, 94, 98, 0.3)", filter: "blur(120px)", zIndex: 0, pointerEvents: "none", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", zIndex: 0 }}></div>
          
          {/* className="form-container" KASITLI OLARAK SİLİNDİ - Eski CSS ezmesin diye */}
          <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "850px", margin: "0 auto", background: "rgba(20, 20, 25, 0.45)", backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderTop: "1px solid rgba(255, 255, 255, 0.2)", boxShadow: "0 25px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)", borderRadius: "24px", padding: "50px 40px" }}>
            
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
              <h2 style={{ color: "#fff", textTransform: "uppercase", letterSpacing: "3px", margin: "0 0 10px 0", textShadow: "0 0 20px rgba(54, 209, 220, 0.8)", fontFamily: "var(--font-code)", fontSize: "2.2rem", fontWeight: "900" }}>SİSTEME KATIL</h2>
              <p style={{ color: "#a9a9bc", fontSize: "1rem" }}>Yapay zeka ve mühendislik ağımıza entegre olmak için kimlik verilerinizi girin.</p>
            </div>
            
            <form action="https://formspree.io/f/mnpawwdq" method="POST" style={{ position: "relative" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="text" name="Ad_Soyad" required placeholder=" " style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <label style={{ color: "#888" }}>Ad Soyad</label>
                </div>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="email" name="E_Posta" required placeholder=" " style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <label style={{ color: "#888" }}>E-Posta Adresi</label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "25px" }}>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="tel" name="Telefon" required placeholder=" " style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <label style={{ color: "#888" }}>Telefon Numarası</label>
                </div>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="text" name="Universite_Bolum" required placeholder=" " style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <label style={{ color: "#888" }}>Üniversite & Bölüm</label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "25px" }}>
                <div className="input-group select-group" style={{ marginBottom: "0" }}>
                  <select name="Sinif" required defaultValue="" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                    <option value="" disabled style={{ background: "#111" }}>Sınıfınızı Seçin</option>
                    <option value="Hazırlık" style={{ background: "#111" }}>Hazırlık</option>
                    <option value="1. Sınıf" style={{ background: "#111" }}>1. Sınıf</option>
                    <option value="2. Sınıf" style={{ background: "#111" }}>2. Sınıf</option>
                    <option value="3. Sınıf" style={{ background: "#111" }}>3. Sınıf</option>
                    <option value="4. Sınıf" style={{ background: "#111" }}>4. Sınıf</option>
                    <option value="Yüksek Lisans / Mezun" style={{ background: "#111" }}>Yüksek Lisans / Mezun</option>
                  </select>
                </div>
                <div className="input-group select-group" style={{ marginBottom: "0" }}>
                  <select name="Tercih_Edilen_Ekip" required defaultValue="" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                    <option value="" disabled style={{ background: "#111" }}>Hedef Ekip Seçin</option>
                    <option value="M.E.T.E." style={{ background: "#111" }}>M.E.T.E. (Donanım/Yazılım)</option>
                    <option value="DDİAT" style={{ background: "#111" }}>DDİAT (Yapay Zeka)</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "25px" }}>
                <textarea name="Basvuru_Nedeni" required rows={4} placeholder=" " style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}></textarea>
                <label style={{ color: "#888" }}>Sisteme Katılım Amacınız & Becerileriniz</label>
              </div>
              
              <input type="hidden" name="_next" value="https://seninsiteninadresi.com" />
              <button type="submit" className="btn-glow w-100" style={{ padding: "18px", marginTop: "15px", letterSpacing: "2px", fontWeight: "bold", boxShadow: "0 0 20px rgba(54, 209, 220, 0.2)" }}>VERİLERİ İŞLE VE BAŞVUR // {">"}</button>
            </form>
          </div>
        </section>
      </div>

      {/* --- ÜYE PANELİ MODALI (BOŞLUĞA TIKLAYINCA KAPANMA İPTAL EDİLDİ) --- */}
      {isLoginModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <span className="close-modal" onClick={() => setIsLoginModalOpen(false)}>&times;</span>
            <div className="modal-header"><i className="fa-solid fa-shield-halved fa-2x"></i><h2>Gizli Ağ Erişimi</h2><p className="modal-desc">Sistem kaynaklarına erişim sağlamak için kimliğinizi doğrulayın.</p></div>
            
            {authTab !== "forgot" && (
              <div className="auth-tabs">
                <button className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => {setAuthTab('login'); setAuthMsg({text:"", type:""})}}>Giriş Yap</button>
                <button className={`tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => {setAuthTab('register'); setAuthMsg({text:"", type:""})}}>Kayıt Ol</button>
              </div>
            )}

            {authTab === 'login' ? (
              <form className="auth-form active" onSubmit={handleLogin}>
                <div className="input-group"><input type="email" required placeholder=" " value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /><label>Kayıtlı E-Posta Adresi</label></div>
                <div className="input-group" style={{ marginBottom: "10px" }}><input type="password" required placeholder=" " value={loginPass} onChange={(e) => setLoginPass(e.target.value)} /><label>Parola</label></div>
                
                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary-glow)", cursor: "pointer" }} onClick={() => {setAuthTab('forgot'); setAuthMsg({text:"", type:""})}}>Şifremi Unuttum?</span>
                </div>

                <button type="submit" className="btn-glow w-100">AĞA BAĞLAN</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
                <div className="admin-note"><i className="fa-solid fa-lock"></i><span>Sisteme giriş izniniz <b>Admin</b> tarafından doğrulanıp aktifleştirilmektedir.</span></div>
              </form>
            ) : authTab === 'register' ? (
              <form className="auth-form active" onSubmit={handleRegister}>
                <div className="input-group"><input type="text" required placeholder=" " value={regName} onChange={(e) => setRegName(e.target.value)} /><label>Adınız Soyadınız</label></div>
                <div className="input-group"><input type="email" required placeholder=" " value={regEmail} onChange={(e) => setRegEmail(e.target.value)} /><label>E-Posta Adresi (Geçerli Format)</label></div>
                <div className="input-group"><input type="password" required placeholder=" " value={regPass} onChange={(e) => setRegPass(e.target.value)} /><label>Bir Parola Belirleyin</label></div>
                <button type="submit" className="btn-glow w-100">ONAY İÇİN BAŞVUR</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
              </form>
            ) : (
              <form className="auth-form active" onSubmit={handleForgotPassword}>
                <h3 style={{ color: "#fff", marginBottom: "20px", textAlign: "center", fontSize: "1rem" }}>Şifre Yenileme</h3>
                <div className="input-group"><input type="email" required placeholder=" " value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /><label>Sistemdeki E-Posta Adresiniz</label></div>
                <div className="input-group"><input type="password" required placeholder=" " value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} /><label>Yeni Parola Belirleyin</label></div>
                <button type="submit" className="btn-glow w-100">ŞİFREMİ GÜNCELLE</button>
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => {setAuthTab('login'); setAuthMsg({text:"", type:""})}}>Giriş Ekranına Dön</span>
                </div>
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
            <div className="admin-header">
              <div><h2><i className="fa-solid fa-terminal"></i> ROOT // ADMIN PANEL</h2><p>Ağ Yöneticisi: {currentUser}</p></div>
              <button className="btn-outline" onClick={handleLogout}>Sistemden Çık</button>
            </div>
            <div className="admin-content">
              <h3>Bekleyen Başvurular</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table">
                  <thead><tr><th>İsim</th><th>E-Posta</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'pending').map((user, idx) => (
                      <tr key={idx}><td>{user.name}</td><td>{user.email}</td><td><button className="btn-action btn-approve" onClick={() => changeUserStatus(user.email, 'approved')}>Ağa İzin Ver</button></td></tr>
                    ))}
                    {allUsersDB.filter(u => u.status === 'pending').length === 0 && (<tr><td colSpan={3} style={{color:'#666', textAlign: 'center', padding: '15px'}}>Bekleyen başvuru yok.</td></tr>)}
                  </tbody>
                </table>
              </div>
              <h3 style={{ marginTop: '40px' }}>Onaylı Üyeler</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table">
                  <thead><tr><th>İsim</th><th>E-Posta</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'approved').map((user, idx) => (
                      <tr key={idx}><td>{user.name}</td><td>{user.email}</td><td><button className="btn-action btn-revoke" onClick={() => changeUserStatus(user.email, 'pending')}>Yetkiyi İptal Et</button></td></tr>
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
            <button className="btn-outline" onClick={handleLogout}>Ağdan Çık (Logout)</button>
          </div>
          
          <div className="dash-grid" style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            
            <div className="dash-card" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-server"></i> Sistem Durumu Bildir</h3>
              <div className="flex-col-mobile" style={{ display: "flex", gap: "10px" }}>
                <input type="text" placeholder="Sistem Adı (Örn: Pixhawk)" value={sysNameInput} onChange={(e) => setSysNameInput(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <input type="text" placeholder="Durum (Örn: Bağlı, 45°C)" value={sysStatusInput} onChange={(e) => setSysStatusInput(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <button className="btn-glow" onClick={handleAddSystemStatus}>Durum Ekle</button>
              </div>
              
              <div style={{ marginTop: "20px", maxHeight: "350px", overflowY: "auto", paddingRight: "5px" }}>
                {systemStatusDB.map((sys, idx) => (
                  <div key={sys.id || idx} className="status-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222' }}>
                    <div>
                      <span style={{ color: '#fff' }}>{sys.name}</span>
                      <div style={{ marginTop: '5px' }}><span className="pulse-dot"></span> {sys.status}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#36d1dc', color: '#36d1dc' }} onClick={() => editSystemStatus(sys)}>Düzenle</button>
                      <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#ff5e62', color: '#ff5e62' }} onClick={() => deleteSystemStatus(sys.id)}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-users"></i> Aktif İstasyonlar</h3>
              
              <div style={{ marginTop: "10px", maxHeight: "350px", overflowY: "auto", paddingRight: "5px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                  <span>Admin</span>
                  <span className="text-green">[{currentUser === "Admin" ? "Şu An Aktif" : "Yetkili"}]</span>
                </div>
                {approvedUsers.map((user, idx) => {
                  const isOnline = user.name === currentUser || user.is_online;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222', color: '#888' }}>
                      <span>{user.name}</span>
                      <span style={{ color: isOnline ? '#10b981' : '#666' }}>[{isOnline ? 'Çevrimiçi' : 'Uzakta/Çevrimdışı'}]</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dash-card col-span-2" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-plus"></i> Yeni Görev Planla</h3>
              <div className="flex-col-mobile" style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <input type="text" placeholder="Görev Adı" value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ flex: 2, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <input type="text" placeholder="Sorumlu" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} style={{ flex: 1, padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }}>
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Test Ediliyor">Test Ediliyor</option>
                </select>
                <button className="btn-glow" onClick={handleAddTask}>Yayınla</button>
              </div>

              <h3 style={{ marginTop: '30px' }}><i className="fa-solid fa-list-check"></i> Aktif Görevler</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                  <thead><tr style={{ color: "#888" }}><th>Görev</th><th>Sorumlu</th><th>Durum</th><th>İşlem</th></tr></thead>
                  <tbody>
                    {tasksDB.filter(t => !t.is_completed).map(task => (
                      <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                        <td style={{ padding: "10px 0" }}>{task.name}</td>
                        <td>{task.assignee}</td>
                        <td style={{ color: task.status === 'Test Ediliyor' ? '#f59e0b' : '#36d1dc' }}>{task.status}</td>
                        <td><button className="btn-outline" onClick={() => completeTask(task.id)}>Tamamla</button></td>
                      </tr>
                    ))}
                    {tasksDB.filter(t => !t.is_completed).length === 0 && <tr><td colSpan={4} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Aktif görev bulunmuyor.</td></tr>}
                  </tbody>
                </table>
              </div>
              
              <h3 style={{ marginTop: '30px', color: '#10b981' }}><i className="fa-solid fa-check-double"></i> Tamamlananlar</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                  <thead><tr style={{ color: "#888" }}><th>Görev</th><th>Sorumlu</th><th>Tarih</th></tr></thead>
                  <tbody>
                    {tasksDB.filter(t => t.is_completed).map(task => (
                      <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                        <td style={{ padding: "10px 0", textDecoration: 'line-through', color: '#666' }}>{task.name}</td>
                        <td>{task.assignee}</td>
                        <td className="text-green">{task.date_completed}</td>
                      </tr>
                    ))}
                    {tasksDB.filter(t => t.is_completed).length === 0 && <tr><td colSpan={3} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Henüz tamamlanan görev yok.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );
}