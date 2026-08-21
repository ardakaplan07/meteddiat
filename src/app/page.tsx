"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  // Modal ve sekme state'leri
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Form handle fonksiyonları (Örnek)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada script.js'teki giriş mantığınızı işletebilirsiniz.
    // Örnek olarak direkt dashboard'u açalım:
    setIsLoginModalOpen(false);
    setIsDashboardOpen(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Kayıt başvurusu alındı.");
  };

  return (
    <>
      {/* Animasyonlu Arka Plan */}
      <div className="code-bg-overlay"></div>

      {/* Navigasyon */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo-pill">
            <img src="/assets/ddi-logo.png" alt="DDİAT" />
            <img src="/assets/mete-logo.png" alt="M.E.T.E." />
          </div>
          <span className="brand-text">
            DDİAT <span className="gradient-text">|</span> METE
          </span>
        </div>
        <ul className="nav-links">
          <li><a href="#hero">// Başlangıç</a></li>
          <li><a href="#hakkimizda">Hakkımızda()</a></li>
          <li><a href="#instagram">Sosyal</a></li>
          <li><a href="#iletisim">Bize Ulaşın</a></li>
          <li><a href="#basvuru" className="btn-outline">Sisteme Katıl</a></li>
          <li>
            <button className="btn-glow" onClick={() => setIsLoginModalOpen(true)}>
              <i className="fa-solid fa-terminal"></i> Üye Paneli
            </button>
          </li>
        </ul>
      </nav>

      {/* Duyuru Ticker */}
      <div className="announcement-ticker">
        <div className="ticker-content">
          <span className="pulse-dot"></span> <b>GÜNCELLEME:</b> Otonom su altı araçlarımızın (HROV) ve uydu sistemlerimizin tasarım aşamaları hız kesmeden devam ediyor.
          <span className="pulse-dot" style={{ marginLeft: "30px" }}></span> <b>DUYURU:</b> Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu (DDİAT) yeni dönem projeleri için hazırlıklarını tamamlıyor!
          <span className="pulse-dot" style={{ marginLeft: "30px" }}></span> <b>SİSTEM:</b> Kaskat PID kontrolcü ve telemetri loglama testleri başarıyla sonuçlandı.
        </div>
      </div>

      {/* Hero Section */}
      <header id="hero">
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
              <p className="typewriter">Geleceğin donanımını ve algoritmasını üretiyoruz.</p>
            </div>
          </div>
          <h1 className="glitch-text" data-text="MÜHENDİSLİK & YAPAY ZEKA">MÜHENDİSLİK & YAPAY ZEKA</h1>
          <p className="hero-sub">Otonom robotik sistemler, model uydular ve dil modellerinin kesişim noktası.</p>
        </div>
      </header>

      {/* Hakkımızda */}
      <section id="hakkimizda">
        <h2 className="section-title"><span className="gradient-text">#</span> Biz Kimiz?</h2>
        <div className="about-grid">
          <div className="about-card mete-card">
            <i className="fa-solid fa-microchip card-icon"></i>
            <h3>M.E.T.E.</h3>
            <h4 className="sub-title">Mühendislik Elektronik ve Teknoloji Ekibi</h4>
            <p>Donanım ve yazılımın sınırlarını zorlayan, çok disiplinli bir mühendislik gücüyüz. Geliştirdiğimiz otonom su altı araçları (HROV)...</p>
            <div className="tech-stack">
              <span>Python</span><span>C++</span><span>OpenCV</span><span>PyQt6</span><span>MATLAB</span>
            </div>
          </div>
          <div className="about-card ddi-card">
            <i className="fa-solid fa-network-wired card-icon"></i>
            <h3>DDİAT</h3>
            <h4 className="sub-title">Akdeniz Doğal Dil İşleme ve Araştırma Topluluğu</h4>
            <p>Akdeniz Üniversitesi çatısı altında, makine öğrenmesi ve büyük dil modellerinin (LLM) akademik ve pratik uygulamalarına odaklanıyoruz...</p>
            <div className="tech-stack">
              <span>PyTorch</span><span>FastAPI</span><span>LLM</span><span>NLP</span>
            </div>
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

      {/* Instagram Akışları */}
      <section id="instagram">
        <h2 className="section-title"><span className="gradient-text">#</span> Sosyal Ağ</h2>
        <div className="insta-grid">
          <a href="https://www.instagram.com/akdeniznlp/" target="_blank" rel="noreferrer" className="insta-card">
            <div className="insta-overlay" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.9), rgba(0,0,0,0.85))" }}></div>
            <div className="insta-content">
              <img src="/assets/ddi-logo.png" alt="DDİAT Logo" className="insta-card-logo" />
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
          <a href="https://www.instagram.com/mete.tech_team" target="_blank" rel="noreferrer" className="insta-card">
            <div className="insta-overlay" style={{ background: "linear-gradient(135deg, rgba(255,94,98,0.9), rgba(0,0,0,0.85))" }}></div>
            <div className="insta-content">
              <img src="/assets/mete-logo.png" alt="METE Logo" className="insta-card-logo" />
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

      {/* Başvuru Formu */}
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

      {/* --- MODALLAR --- */}

      {/* Üye Paneli Modalı */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <span className="close-modal" onClick={() => setIsLoginModalOpen(false)}>&times;</span>
            <div className="modal-header">
              <i className="fa-solid fa-shield-halved fa-2x"></i>
              <h2>Gizli Ağ Erişimi</h2>
              <p className="modal-desc">Sistem kaynaklarına erişim sağlamak için kimliğinizi doğrulayın.</p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`tab-btn ${authTab === "login" ? "active" : ""}`} 
                onClick={() => setAuthTab("login")}
              >Giriş Yap</button>
              <button 
                className={`tab-btn ${authTab === "register" ? "active" : ""}`} 
                onClick={() => setAuthTab("register")}
              >Kayıt Ol</button>
            </div>

            {authTab === "login" ? (
              <form id="loginForm" className="auth-form active" onSubmit={handleLogin}>
                <div className="input-group">
                  <input type="email" id="loginEmail" required placeholder=" " />
                  <label>Kayıtlı E-Posta Adresi</label>
                </div>
                <div className="input-group">
                  <input type="password" id="loginPass" required placeholder=" " />
                  <label>Parola</label>
                </div>
                <button type="submit" className="btn-glow w-100">AĞA BAĞLAN</button>
                <div className="admin-note" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <i className="fa-solid fa-lock"></i>
                  <span>Sisteme giriş izniniz <b>Admin (Arda Kaplan)</b> tarafından doğrulanıp aktifleştirilmektedir.</span>
                </div>
              </form>
            ) : (
              <form id="registerForm" className="auth-form active" onSubmit={handleRegister}>
                <div className="input-group">
                  <input type="text" id="regName" required placeholder=" " />
                  <label>Adınız Soyadınız</label>
                </div>
                <div className="input-group">
                  <input type="email" id="regEmail" required placeholder=" " />
                  <label>E-Posta Adresi (Üniversite/Kişisel)</label>
                </div>
                <div className="input-group">
                  <input type="password" id="regPass" required placeholder=" " />
                  <label>Bir Parola Belirleyin</label>
                </div>
                <button type="submit" className="btn-glow w-100">ONAY İÇİN BAŞVUR</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD (ÜYE KONTROL MERKEZİ) */}
      {isDashboardOpen && (
        <div className="dashboard-fullscreen" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "#09090b", zIndex: 9999, overflowY: "auto" }}>
          <div className="dash-navbar" style={{ padding: "20px", display: "flex", justifyContent: "space-between", background: "#121218" }}>
            <div className="dash-brand"><i className="fa-solid fa-terminal"></i> ROOT // KOMUTA MERKEZİ</div>
            <button className="btn-outline" onClick={() => setIsDashboardOpen(false)}>Ağdan Çık (Logout)</button>
          </div>
          
          <div className="dash-grid" style={{ padding: "20px" }}>
            <div className="dash-card">
              <h3><i className="fa-solid fa-server"></i> Sistem Durumu Bildir</h3>
              <p>React State ile yönetilebilir dinamik liste buraya gelebilir.</p>
            </div>
            <div className="dash-card">
              <h3><i className="fa-solid fa-users"></i> Aktif İstasyonlar</h3>
            </div>
          </div>
        </div>
      )}

    </>
  );
}