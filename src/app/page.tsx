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
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "forgot">("login");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const [typedText, setTypedText] = useState("");
  const [glitchShadow, setGlitchShadow] = useState("none");
  const [scrollProgress, setScrollProgress] = useState(0); 

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");

  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });

  const [currentUser, setCurrentUser] = useState("");
  const [allUsersDB, setAllUsersDB] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [tasksDB, setTasksDB] = useState<any[]>([]);
  const [systemStatusDB, setSystemStatusDB] = useState<any[]>([]);
  const [logsDB, setLogsDB] = useState<any[]>([]);

  const [taskName, setTaskName] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskStatus, setTaskStatus] = useState("Devam Ediyor");
  const [taskPriority, setTaskPriority] = useState("Normal");
  const [taskDeadline, setTaskDeadline] = useState("");
  
  const [sysNameInput, setSysNameInput] = useState("");
  const [sysStatusInput, setSysStatusInput] = useState("");

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    return target < today;
  };

  // --- EFEKTLER (useEffect) ---

  // Kusursuz Kaydırma Takibi (Görsellerin kayarak inmesi ve çizgiler için)
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("basvuru");
      if (section) {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalScroll = windowHeight + rect.height;
        const currentScroll = windowHeight - rect.top;
        
        let progress = currentScroll / totalScroll;
        // Scroll hassasiyetini artırarak parçaların tam formun hizasında birleşmesini sağlıyoruz
        progress = Math.max(0, Math.min(progress * 1.5, 1)); 
        
        setScrollProgress(progress);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); 

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
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
    if (isDashboardOpen) {
      fetchApprovedUsers();
      fetchTasks();
      fetchSystemStatus();
      fetchLogs();
      
      const interval = setInterval(() => {
        fetchApprovedUsers();
        fetchTasks();
        fetchSystemStatus();
        fetchLogs();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isDashboardOpen]);

  // ÇEVRİMİÇİ/ÇEVRİMDIŞI KESİN ÇÖZÜMÜ
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
        keepalive: true
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
    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [currentUser]);

  const fetchLogs = async () => {
    const { data, error } = await supabase.from('system_logs').select('*').order('id', { ascending: false }).limit(50);
    if (!error && data) setLogsDB(data);
  };

  const addLog = async (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const { error } = await supabase.from('system_logs').insert([{ id: Date.now(), message: msg, time: timeStr }]);
    if (!error) fetchLogs();
  };

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
      setRegName(""); 
      setRegEmail(""); 
      setRegPass("");
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
      addLog(`[AUTH] ${user.name} istasyonu ağa bağlandı.`);
      
      setAuthMsg({ text: "Erişim Sağlandı: Komuta Merkezine Aktarılıyor...", type: "success" });
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setIsDashboardOpen(true);
        setLoginEmail(""); 
        setLoginPass(""); 
        setAuthMsg({ text: "", type: "" });
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
      setResetEmail(""); 
      setResetNewPass("");
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

  const changeUserStatus = async (email: string, newStatus: string) => {
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('email', email);
    if (!error) fetchAllUsers();
    else alert("Yetki değiştirilirken hata oluştu!");
  };

  const handleAddTask = async () => {
    if (!taskName || !taskAssignee) return alert("Lütfen görev adı ve sorumlu kişi girin.");

    const { error } = await supabase.from('tasks').insert([{ 
      id: Date.now(), 
      name: taskName, 
      assignee: taskAssignee, 
      status: taskStatus, 
      priority: taskPriority, 
      deadline: taskDeadline,
      is_completed: false 
    }]);

    if (!error) {
      addLog(`[GÖREV] ${currentUser}, '${taskAssignee}' için yeni görev atadı: ${taskName} [${taskPriority}]`);
      setTaskName(""); 
      setTaskAssignee(""); 
      setTaskDeadline(""); 
      setTaskPriority("Normal");
      fetchTasks();
    } else {
      console.error(error);
      alert("Görev Buluta Eklenemedi! Lütfen 'tasks' tablosuna 'priority' ve 'deadline' sütunlarını eklediğinizden emin olun.");
    }
  };

  const completeTask = async (taskId: number) => {
    const d = new Date();
    const dateStr = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    await supabase.from('tasks').update({ is_completed: true, date_completed: dateStr }).eq('id', taskId);
    addLog(`[GÖREV] ${currentUser} bir görevi tamamlandı olarak işaretledi.`);
    fetchTasks();
  };

  const handleAddSystemStatus = async () => {
    if (!sysNameInput || !sysStatusInput) return;
    const { error } = await supabase.from('system_status').insert([{ 
      id: Date.now(), 
      name: sysNameInput, 
      status: sysStatusInput 
    }]);
    if (!error) {
      addLog(`[SİSTEM] ${currentUser}, '${sysNameInput}' sistemini ekledi. Durum: ${sysStatusInput}`);
      setSysNameInput(""); 
      setSysStatusInput("");
      fetchSystemStatus();
    }
  };

  const deleteSystemStatus = async (id: number) => {
    if(!confirm("Bu sistemi silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from('system_status').delete().eq('id', id);
    if (!error) {
      addLog(`[SİSTEM] ${currentUser} bir sistem durumunu veritabanından sildi.`);
      fetchSystemStatus();
    }
  };

  const editSystemStatus = async (sys: any) => {
    const newStatus = prompt(`"${sys.name}" için yeni durumu girin:`, sys.status);
    if (newStatus && newStatus !== sys.status) {
      const { error } = await supabase.from('system_status').update({ status: newStatus }).eq('id', sys.id);
      if (!error) {
        addLog(`[SİSTEM] ${currentUser}, '${sys.name}' durumunu '${newStatus}' olarak güncelledi.`);
        fetchSystemStatus();
      }
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

      <div style={{ display: isDashboardOpen || isAdminPanelOpen ? "none" : "block", position: "relative", zIndex: 1 }}>
        
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
                <span className="btn-close"></span>
                <span className="btn-min"></span>
                <span className="btn-max"></span>
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
              <div className="tech-stack">
                <span>Python</span>
                <span>C++</span>
                <span>OpenCV</span>
                <span>PyQt6</span>
                <span>MATLAB</span>
              </div>
            </div>
            <div className="about-card ddi-card">
              <i className="fa-solid fa-network-wired card-icon"></i>
              <h3>DDİAT</h3>
              <h4 className="sub-title">Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu</h4>
              <p>Akdeniz Üniversitesi çatısı altında, makine öğrenmesi ve büyük dil modellerinin (LLM) akademik ve pratik uygulamalarına odaklanıyoruz. Semantik analiz, veri madenciliği ve Türkçe diline özgü yapay zeka mimarileri üzerine araştırmalar yürütüyoruz.</p>
              <div className="tech-stack">
                <span>PyTorch</span>
                <span>FastAPI</span>
                <span>LLM</span>
                <span>NLP</span>
              </div>
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
              <div className="insta-footer">
                <i className="fa-brands fa-instagram"></i>
                <span className="btn-insta">Takip Et</span>
              </div>
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
              <div className="insta-footer">
                <i className="fa-brands fa-instagram"></i>
                <span className="btn-insta">Takip Et</span>
              </div>
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


        {/* ============================================================================== */}
        {/* YENİ SİSTEM: BLUEPRINT'TEN GERÇEĞE KAYARAK İNEN PARÇALAR (TAM İSTEDİĞİN GİBİ) */}
        {/* ============================================================================== */}
        <section id="basvuru" style={{ position: "relative", minHeight: "1300px", padding: "120px 0 450px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#08080c", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
          
          {/* ORTADAKİ GLASSMORPHISM BAŞVURU FORMU */}
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "800px", margin: "0 auto", background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderTop: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 25px 50px rgba(0,0,0,0.8)", borderRadius: "24px", padding: "50px 40px" }}>
            
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
              <h2 style={{ color: "#fff", textTransform: "uppercase", letterSpacing: "3px", margin: "0 0 10px 0", textShadow: "0 0 15px rgba(255, 255, 255, 0.3)", fontFamily: "var(--font-code)", fontSize: "2.2rem", fontWeight: "900" }}>SİSTEME KATIL</h2>
              <p style={{ color: "#a9a9bc", fontSize: "1rem" }}>Yapay zeka ve mühendislik ağımıza entegre olmak için kimlik verilerinizi girin.</p>
            </div>
            
            <form action="https://formspree.io/f/mnpawwdq" method="POST" style={{ position: "relative" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="text" name="Ad_Soyad" required placeholder=" " style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <label style={{ color: "#888" }}>Ad Soyad</label>
                </div>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="email" name="E_Posta" required placeholder=" " style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <label style={{ color: "#888" }}>E-Posta Adresi</label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "25px" }}>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="tel" name="Telefon" required placeholder=" " style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <label style={{ color: "#888" }}>Telefon Numarası</label>
                </div>
                <div className="input-group" style={{ marginBottom: "0" }}>
                  <input type="text" name="Universite_Bolum" required placeholder=" " style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <label style={{ color: "#888" }}>Üniversite & Bölüm</label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginTop: "25px" }}>
                <div className="input-group select-group" style={{ marginBottom: "0" }}>
                  <select name="Sinif" required defaultValue="" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }}>
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
                  <select name="Tercih_Edilen_Ekip" required defaultValue="" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }}>
                    <option value="" disabled style={{ background: "#111" }}>Hedef Ekip Seçin</option>
                    <option value="M.E.T.E." style={{ background: "#111" }}>M.E.T.E. (Donanım/Yazılım)</option>
                    <option value="DDİAT" style={{ background: "#111" }}>DDİAT (Yapay Zeka)</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "25px" }}>
                <textarea name="Basvuru_Nedeni" required rows={4} placeholder=" " style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}></textarea>
                <label style={{ color: "#888" }}>Sisteme Katılım Amacınız & Becerileriniz</label>
              </div>
              
              <input type="hidden" name="_next" value="https://seninsiteninadresi.com" />
              <button type="submit" className="btn-glow w-100" style={{ padding: "18px", marginTop: "15px", letterSpacing: "2px", fontWeight: "bold", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                VERİLERİ İŞLE VE BAŞVUR // {">"}
              </button>
            </form>
          </div>

          {/* ================= ARKA PLAN SİBER ANİMASYON KATMANI (Z-INDEX 0) ================= */}
          <div className="hide-on-mobile" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
            
            {/* --- ADIM 1: SABİT TEKNİK ÇİZİMLER (BLUEPRINTS) EN ÜST KÖŞELERDE --- */}
            
            {/* SOL Blueprint (M.E.T.E.) */}
            <div style={{ position: "absolute", left: "5%", top: "15%", width: "15%", opacity: 0.7, filter: "drop-shadow(0 0 10px rgba(54, 209, 220, 0.4))" }}>
              <svg viewBox="0 0 200 300" stroke="#36d1dc" fill="none" strokeWidth="3">
                <path d="M50,100 C50,60 150,60 150,100" />
                <circle cx="100" cy="70" r="10" />
                <rect x="50" y="100" width="100" height="150" rx="10" />
                <line x1="50" y1="130" x2="150" y2="130" strokeDasharray="6 6" />
                <line x1="50" y1="220" x2="150" y2="220" strokeDasharray="6 6" />
                <circle cx="100" cy="175" r="30" strokeDasharray="4 6" />
                <rect x="20" y="140" width="20" height="80" rx="4" />
                <rect x="160" y="140" width="20" height="80" rx="4" />
                <path d="M20,220 L10,260 L40,260 L30,220 Z" />
                <path d="M160,220 L150,260 L180,260 L170,220 Z" />
                <line x1="100" y1="250" x2="100" y2="300" />
              </svg>
            </div>

            {/* SAĞ Blueprint (DDİAT) */}
            <div style={{ position: "absolute", right: "5%", top: "15%", width: "15%", opacity: 0.7, filter: "drop-shadow(0 0 10px rgba(255, 94, 98, 0.4))" }}>
              <svg viewBox="0 0 240 300" stroke="#ff5e62" fill="none" strokeWidth="3">
                <path d="M90,40 Q120,10 150,40" />
                <circle cx="120" cy="50" r="5" />
                <path d="M70,70 A 60 40 0 0 1 170,70" strokeDasharray="4 6" />
                <line x1="120" y1="55" x2="120" y2="90" />
                <polygon points="90,90 150,90 170,140 150,190 90,190 70,140" />
                <circle cx="120" cy="140" r="25" />
                <circle cx="120" cy="140" r="40" strokeDasharray="4 6" />
                <rect x="10" y="110" width="60" height="60" />
                <line x1="30" y1="110" x2="30" y2="170" />
                <line x1="50" y1="110" x2="50" y2="170" />
                <line x1="10" y1="130" x2="70" y2="130" />
                <line x1="10" y1="150" x2="70" y2="150" />
                <rect x="170" y="110" width="60" height="60" />
                <line x1="190" y1="110" x2="190" y2="170" />
                <line x1="210" y1="110" x2="210" y2="170" />
                <line x1="170" y1="130" x2="230" y2="130" />
                <line x1="170" y1="150" x2="230" y2="150" />
                <line x1="120" y1="190" x2="120" y2="240" />
              </svg>
            </div>

            {/* --- ADIM 2: SCROLL İLE ÇİZİLEN LAZER BAĞLANTI ÇİZGİLERİ --- */}
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
              
              {/* Sol Mavi Lazer Çizgisi (Çizimden orta merkeze iner) */}
              <path 
                d="M 125 350 L 125 600 L 350 850 L 500 850" 
                stroke="#36d1dc" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" strokeDasharray="1500" 
                strokeDashoffset={1500 - (scrollProgress * 1500)} 
                style={{ filter: "drop-shadow(0 0 5px #36d1dc)", transition: "stroke-dashoffset 0.1s ease-out" }} 
              />
              
              {/* Sağ Kırmızı Lazer Çizgisi (Çizimden orta merkeze iner) */}
              <path 
                d="M 875 350 L 875 600 L 650 850 L 500 850" 
                stroke="#ff5e62" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" strokeDasharray="1500" 
                strokeDashoffset={1500 - (scrollProgress * 1500)} 
                style={{ filter: "drop-shadow(0 0 5px #ff5e62)", transition: "stroke-dashoffset 0.1s ease-out" }} 
              />
            </svg>

            {/* --- ADIM 3: KAYARAK İNEN VE MERKEZDE BİRLEŞEN GÖRSELLER --- */}
            {/* Ortak merkez toplanma alanı */}
            <div style={{ position: "absolute", bottom: "50px", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: "1200px", height: "450px", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              
              {/* SOL GÖRSEL: hrov-real.png (Yukarı ve soldan aşağı doğru kayar) */}
              <img 
                src="/assets/hrov-real.png" 
                alt="" 
                style={{ 
                  position: "absolute", width: "50%", left: 0, bottom: 0, objectFit: "contain",
                  transform: `translate(${-30 * (1 - scrollProgress)}vw, ${-800 * (1 - scrollProgress)}px)`, 
                  opacity: scrollProgress > 0.95 ? 0 : 1, // Tam birleştiğinde yok olur, yerini son render'a bırakır
                  transition: "transform 0.1s ease-out, opacity 0.2s ease-out",
                  filter: "drop-shadow(0 0 20px rgba(54, 209, 220, 0.3))"
                }} 
              />
              
              {/* SAĞ GÖRSEL: satellite-real.png (Yukarı ve sağdan aşağı doğru kayar) */}
              <img 
                src="/assets/satellite-real.png" 
                alt="" 
                style={{ 
                  position: "absolute", width: "50%", right: 0, bottom: 0, objectFit: "contain",
                  transform: `translate(${30 * (1 - scrollProgress)}vw, ${-800 * (1 - scrollProgress)}px)`,
                  opacity: scrollProgress > 0.95 ? 0 : 1, // Tam birleştiğinde yok olur
                  transition: "transform 0.1s ease-out, opacity 0.2s ease-out",
                  filter: "drop-shadow(0 0 20px rgba(255, 94, 98, 0.3))"
                }} 
              />
              
              {/* --- ADIM 4: 3. GÖRSELDEKİ NİHAİ SONUÇ (combined-render.png) --- */}
              {/* Parçalar merkeze ulaştığında bu görsel parlayarak ortaya çıkar */}
              <img 
                src="/assets/combined-render.png" 
                alt="Birleştirilmiş Nihai Sistem" 
                style={{
                  position: "absolute", width: "100%", left: 0, bottom: 0, objectFit: "contain",
                  opacity: scrollProgress > 0.95 ? 1 : 0, 
                  filter: "drop-shadow(0 0 40px rgba(255,255,255,0.2))",
                  transition: "opacity 0.4s ease-out"
                }} 
              />

            </div>
          </div>
        </section>
      </div>

      {/* --- ÜYE PANELİ MODALI --- */}
      {isLoginModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <span className="close-modal" onClick={() => setIsLoginModalOpen(false)}>&times;</span>
            <div className="modal-header">
              <i className="fa-solid fa-shield-halved fa-2x"></i>
              <h2>Gizli Ağ Erişimi</h2>
              <p className="modal-desc">Sistem kaynaklarına erişim sağlamak için kimliğinizi doğrulayın.</p>
            </div>
            
            {authTab !== "forgot" && (
              <div className="auth-tabs">
                <button className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => {setAuthTab('login'); setAuthMsg({text:"", type:""})}}>Giriş Yap</button>
                <button className={`tab-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => {setAuthTab('register'); setAuthMsg({text:"", type:""})}}>Kayıt Ol</button>
              </div>
            )}

            {authTab === 'login' ? (
              <form className="auth-form active" onSubmit={handleLogin}>
                <div className="input-group">
                  <input type="email" required placeholder=" " value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  <label>Kayıtlı E-Posta Adresi</label>
                </div>
                <div className="input-group" style={{ marginBottom: "10px" }}>
                  <input type="password" required placeholder=" " value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                  <label>Parola</label>
                </div>
                
                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary-glow)", cursor: "pointer" }} onClick={() => {setAuthTab('forgot'); setAuthMsg({text:"", type:""})}}>Şifremi Unuttum?</span>
                </div>

                <button type="submit" className="btn-glow w-100">AĞA BAĞLAN</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
                
                <div className="admin-note">
                  <i className="fa-solid fa-lock"></i>
                  <span>Sisteme giriş izniniz <b>Admin</b> tarafından doğrulanıp aktifleştirilmektedir.</span>
                </div>
              </form>
            ) : authTab === 'register' ? (
              <form className="auth-form active" onSubmit={handleRegister}>
                <div className="input-group">
                  <input type="text" required placeholder=" " value={regName} onChange={(e) => setRegName(e.target.value)} />
                  <label>Adınız Soyadınız</label>
                </div>
                <div className="input-group">
                  <input type="email" required placeholder=" " value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  <label>E-Posta Adresi (Geçerli Format)</label>
                </div>
                <div className="input-group">
                  <input type="password" required placeholder=" " value={regPass} onChange={(e) => setRegPass(e.target.value)} />
                  <label>Bir Parola Belirleyin</label>
                </div>
                <button type="submit" className="btn-glow w-100">ONAY İÇİN BAŞVUR</button>
                {authMsg.text && <p className={`status-msg ${authMsg.type === 'error' ? 'text-red' : 'text-green'}`}>{authMsg.text}</p>}
              </form>
            ) : (
              <form className="auth-form active" onSubmit={handleForgotPassword}>
                <h3 style={{ color: "#fff", marginBottom: "20px", textAlign: "center", fontSize: "1rem" }}>Şifre Yenileme</h3>
                <div className="input-group">
                  <input type="email" required placeholder=" " value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                  <label>Sistemdeki E-Posta Adresiniz</label>
                </div>
                <div className="input-group">
                  <input type="password" required placeholder=" " value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} />
                  <label>Yeni Parola Belirleyin</label>
                </div>
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
              <div>
                <h2><i className="fa-solid fa-terminal"></i> ROOT // ADMIN PANEL</h2>
                <p>Ağ Yöneticisi: {currentUser}</p>
              </div>
              <button className="btn-outline" onClick={handleLogout}>Sistemden Çık</button>
            </div>
            <div className="admin-content">
              <h3>Bekleyen Başvurular</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>İsim</th>
                      <th>E-Posta</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'pending').map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
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
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>İsim</th>
                      <th>E-Posta</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsersDB.filter(u => u.status === 'approved').map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
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
            <div className="dash-brand">
              <i className="fa-solid fa-terminal"></i> ROOT // KOMUTA MERKEZİ
            </div>
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
                      <div style={{ marginTop: '5px' }}>
                        <span className="pulse-dot"></span> {sys.status}
                      </div>
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
              <h3><i className="fa-solid fa-terminal"></i> Canlı Terminal Log (Operasyon Geçmişi)</h3>
              <div style={{ background: "#050505", border: "1px solid #1a1a24", borderRadius: "6px", padding: "15px", height: "250px", overflowY: "auto", fontFamily: "var(--font-code)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                {logsDB.map((log, idx) => (
                  <div key={log.id || idx} style={{ display: "flex", gap: "10px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "5px", alignItems: "flex-start" }}>
                    <span style={{ color: "#666", minWidth: "75px" }}>[{log.time}]</span>
                    <span style={{ color: log.message.includes("[AUTH]") ? "#36d1dc" : log.message.includes("[GÖREV]") ? "#f59e0b" : "#10b981", whiteSpace: "nowrap" }}>root@mete:~#</span>
                    <span style={{ color: "#d1d5db" }}>{log.message}</span>
                  </div>
                ))}
                {logsDB.length === 0 && <span style={{ color: "#666" }}>Sistem logları bekleniyor...</span>}
              </div>
            </div>

            <div className="dash-card col-span-2" style={{ background: "#121218", padding: "20px", border: "1px solid #333", borderRadius: "8px" }}>
              <h3><i className="fa-solid fa-plus"></i> Yeni Görev Planla</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
                <input type="text" placeholder="Görev Adı" value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <input type="text" placeholder="Sorumlu" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} style={{ padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }} />
                <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} style={{ padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }}>
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Test Ediliyor">Test Ediliyor</option>
                </select>
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} style={{ padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px" }}>
                  <option value="Kritik">Kritik Öncelik</option>
                  <option value="Normal">Normal Öncelik</option>
                  <option value="Düşük">Düşük Öncelik</option>
                </select>
                <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} style={{ padding: "10px", background: "#0a0a0f", color: "white", border: "1px solid #333", borderRadius: "4px", colorScheme: "dark" }} />
                <button className="btn-glow" onClick={handleAddTask}>Yayınla</button>
              </div>

              <h3 style={{ marginTop: '30px' }}><i className="fa-solid fa-list-check"></i> Aktif Görevler</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                  <thead>
                    <tr style={{ color: "#888" }}>
                      <th>Görev</th>
                      <th>Sorumlu</th>
                      <th>Öncelik</th>
                      <th>Bitiş (Deadline)</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksDB.filter(t => !t.is_completed).map(task => (
                      <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                        <td style={{ padding: "10px 0" }}>{task.name}</td>
                        <td>{task.assignee}</td>
                        <td style={{ color: task.priority === 'Kritik' ? '#ff5e62' : task.priority === 'Düşük' ? '#888' : '#36d1dc' }}>
                          {task.priority === 'Kritik' ? '🔴 Kritik' : task.priority === 'Düşük' ? '⚪ Düşük' : '🔵 Normal'}
                        </td>
                        <td style={{ color: isOverdue(task.deadline) ? '#ff5e62' : '#d1d5db', animation: isOverdue(task.deadline) ? 'pulse 1.5s infinite' : 'none' }}>
                          {task.deadline ? new Date(task.deadline).toLocaleDateString('tr-TR') : '-'}
                        </td>
                        <td style={{ color: task.status === 'Test Ediliyor' ? '#f59e0b' : '#36d1dc' }}>{task.status}</td>
                        <td><button className="btn-outline" onClick={() => completeTask(task.id)}>Tamamla</button></td>
                      </tr>
                    ))}
                    {tasksDB.filter(t => !t.is_completed).length === 0 && (
                      <tr><td colSpan={6} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Aktif görev bulunmuyor.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <h3 style={{ marginTop: '30px', color: '#10b981' }}><i className="fa-solid fa-check-double"></i> Tamamlananlar</h3>
              <div className="table-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="cyber-table" style={{ width: "100%", textAlign: "left" }}>
                  <thead>
                    <tr style={{ color: "#888" }}>
                      <th>Görev</th>
                      <th>Sorumlu</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksDB.filter(t => t.is_completed).map(task => (
                      <tr key={task.id} style={{ borderTop: "1px solid #333" }}>
                        <td style={{ padding: "10px 0", textDecoration: 'line-through', color: '#666' }}>{task.name}</td>
                        <td>{task.assignee}</td>
                        <td className="text-green">{task.date_completed}</td>
                      </tr>
                    ))}
                    {tasksDB.filter(t => t.is_completed).length === 0 && (
                      <tr><td colSpan={3} style={{ color: '#666', textAlign: 'center', padding: '10px' }}>Henüz tamamlanan görev yok.</td></tr>
                    )}
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