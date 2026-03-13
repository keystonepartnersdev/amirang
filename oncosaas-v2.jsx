import { useState, useEffect, useRef } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────── */
const L = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#E8E4DE",
  green: "#2D6A4F",
  greenLight: "#52B788",
  greenPale: "#EEF7F2",
  teal: "#40916C",
  warm: "#B7825A",
  warmPale: "#FDF5EE",
  text: "#1C1C1A",
  textMid: "#4A4A47",
  textMuted: "#8F8F8B",
  amber: "#D97706",
  red: "#DC2626",
  blue: "#2563EB",
  purple: "#7C3AED",
};

const D = {
  bg: "#0A0F1A",
  surface: "#111827",
  surfaceHigh: "#1A2436",
  border: "#1F3050",
  teal: "#34D399",
  tealDim: "#059669",
  blue: "#60A5FA",
  purple: "#A78BFA",
  amber: "#FBBF24",
  red: "#F87171",
  green: "#34D399",
  text: "#F1F5F9",
  textDim: "#94A3B8",
  textMuted: "#475569",
};

/* ─── SHARED UTILS ──────────────────────────────────────────────── */
const statusCfg = {
  new: { label: "신규 접수", color: D.blue, bg: "#2563EB22" },
  consulting: { label: "상담 진행중", color: D.amber, bg: "#FBBF2422" },
  ai_pending: { label: "AI 분석 대기", color: D.textMuted, bg: "#47556922" },
  ai_done: { label: "분석 완료", color: D.teal, bg: "#34D39922" },
  confirmed: { label: "원장님 컨펌", color: D.green, bg: "#34D39922" },
  in_treatment: { label: "치료 진행중", color: D.purple, bg: "#A78BFA22" },
};

const patients = [
  { id: "P-001", name: "김민준", age: 58, cancer: "폐암 3기", status: "ai_done", date: "2025.03.14", branch: "강남점", phone: "010-1234-5678", consult: "항암치료 2회 완료 후 면역 기능 강화 목적으로 내원 희망. 통증 NRS 5/10. 부친 폐암 병력.", files: ["CT결과_2025.03.pdf", "혈액검사_2025.03.pdf"] },
  { id: "P-002", name: "이서연", age: 46, cancer: "유방암 2기", status: "consulting", date: "2025.03.13", branch: "강남점", phone: "010-2345-6789", consult: "수술 후 회복 중. 항암부작용으로 피로감 극심. 영양 집중치료 문의.", files: ["수술확인서.pdf"] },
  { id: "P-003", name: "박지호", age: 63, cancer: "대장암 2기", status: "confirmed", date: "2025.03.12", branch: "강남점", phone: "010-3456-7890", consult: "기존 치료 병행 희망. 고주파 온열치료에 관심 많음. 당뇨 병력 있음.", files: ["진단서.pdf", "처방전.pdf"] },
  { id: "P-004", name: "최유진", age: 51, cancer: "위암 1기", status: "in_treatment", date: "2025.03.10", branch: "강남점", phone: "010-4567-8901", consult: "조기 발견. 수술 없이 비침습적 치료 선호. 영양 상태 양호.", files: ["내시경결과.pdf"] },
  { id: "P-005", name: "정승현", age: 67, cancer: "간암 3기", status: "new", date: "2025.03.15", branch: "강남점", phone: "010-5678-9012", consult: "", files: [] },
];

const programs = [
  { id: "A", name: "면역강화 프로그램 A", desc: "복합 면역치료 집중 코스", duration: "12주", sessions: 24, tags: ["고주파온열", "면역주사"] },
  { id: "B", name: "고용량 비타민C 요법", desc: "정맥주사 항산화 치료", duration: "8주", sessions: 16, tags: ["비타민C", "항산화"] },
  { id: "C", name: "고압산소치료 패키지", desc: "조직 재생 및 회복 집중", duration: "6주", sessions: 18, tags: ["고압산소", "회복"] },
  { id: "D", name: "미슬토 면역치료", desc: "자연 면역 증강 요법", duration: "16주", sessions: 32, tags: ["미슬토", "면역"] },
  { id: "E", name: "통증관리 집중 케어", desc: "통증 완화 및 삶의 질 개선", duration: "4주", sessions: 8, tags: ["통증", "완화"] },
  { id: "F", name: "영양 집중 치료", desc: "항암 영양 보충 집중 코스", duration: "6주", sessions: 12, tags: ["영양", "보충"] },
];

const nurseSchedule = [
  { id: "S-01", patientId: "P-003", patient: "박지호", date: "2025.03.18", time: "10:00", program: "면역강화 프로그램 A", session: "1/24", status: "done", note: "특이사항 없음. 컨디션 양호." },
  { id: "S-02", patientId: "P-004", patient: "최유진", date: "2025.03.18", time: "11:30", program: "고용량 비타민C 요법", session: "3/16", status: "done", note: "시술 후 약한 오한. 30분 안정 후 귀가." },
  { id: "S-03", patientId: "P-003", patient: "박지호", date: "2025.03.21", time: "10:00", program: "면역강화 프로그램 A", session: "2/24", status: "upcoming", note: "" },
  { id: "S-04", patientId: "P-004", patient: "최유진", date: "2025.03.21", time: "11:30", program: "영양 집중 치료", session: "1/12", status: "upcoming", note: "" },
  { id: "S-05", patientId: "P-003", patient: "박지호", date: "2025.03.25", time: "10:00", program: "면역강화 프로그램 A", session: "3/24", status: "upcoming", note: "" },
];

/* ─── MINI COMPONENTS ───────────────────────────────────────────── */
function DTag({ status }) {
  const c = statusCfg[status] || statusCfg.new;
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{c.label}</span>;
}

function DCard({ children, style = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return <div onMouseEnter={() => onClick && setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={{ background: D.surface, border: `1px solid ${hov && onClick ? D.tealDim : D.border}`, borderRadius: 12, padding: 20, transition: "border-color 0.2s", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>;
}

function DBtn({ children, variant = "primary", onClick, style = {}, size = "md", disabled }) {
  const [hov, setHov] = useState(false);
  const sz = { sm: { padding: "5px 14px", fontSize: 12 }, md: { padding: "9px 20px", fontSize: 13 }, lg: { padding: "13px 28px", fontSize: 15 } }[size];
  const vars = {
    primary: { background: hov ? "#2DB88A" : D.teal, color: "#0A0F1A", border: "none" },
    ghost: { background: hov ? `${D.border}88` : "transparent", color: D.textDim, border: `1px solid ${D.border}` },
    teal: { background: hov ? "#0596691A" : `${D.teal}18`, color: D.teal, border: `1px solid ${D.teal}44` },
    purple: { background: hov ? "#7C3AED1A" : `${D.purple}18`, color: D.purple, border: `1px solid ${D.purple}44` },
    amber: { background: hov ? "#D977061A" : `${D.amber}18`, color: D.amber, border: `1px solid ${D.amber}44` },
    danger: { background: hov ? "#DC26261A" : `${D.red}18`, color: D.red, border: `1px solid ${D.red}44` },
  };
  return <button disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={{ ...sz, borderRadius: 8, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, transition: "all 0.15s", opacity: disabled ? 0.5 : 1, ...vars[variant], ...style }}>{children}</button>;
}

function DStat({ label, value, color = D.teal, sub }) {
  return <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 26, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ fontSize: 11, color: D.textMuted, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</div>}
  </div>;
}

/* ─── LANDING PAGE ──────────────────────────────────────────────── */
function Landing({ onApply, onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const treatments = [
    { icon: "🌡️", name: "고주파 온열치료", desc: "체온을 상승시켜 면역력을 높이고, 열에 민감한 암세포를 선택적으로 제거합니다." },
    { icon: "💊", name: "고용량 비타민C", desc: "정맥으로 고용량 비타민C를 투여해 항산화 작용과 암세포 성장 억제를 돕습니다." },
    { icon: "💨", name: "고압산소치료", desc: "고농도 산소를 체내 깊숙이 공급해 조직 재생과 항암 치료 후 회복을 돕습니다." },
    { icon: "🌿", name: "미슬토 면역치료", desc: "자연 유래 성분으로 면역 체계를 강화하여 암세포에 대한 저항력을 높입니다." },
  ];

  const navBg = scrolled ? "rgba(255,255,255,0.96)" : "transparent";
  const navBorder = scrolled ? `1px solid ${L.border}` : "1px solid transparent";

  return (
    <div style={{ fontFamily: "'Noto Serif KR', 'Pretendard', Georgia, serif", background: L.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #EEF7F2; color: #2D6A4F; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: navBg, border: navBorder, backdropFilter: "blur(12px)", transition: "all 0.3s", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${L.green}, ${L.greenLight})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>아</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: L.text, letterSpacing: "-0.02em" }}>아미랑의원</div>
        </div>
        <div style={{ display: "flex", gap: 32, fontFamily: "'Noto Sans KR', sans-serif" }}>
          {["소개", "치료 프로그램", "치료사례", "오시는 길"].map(m => (
            <span key={m} style={{ fontSize: 14, color: L.textMid, cursor: "pointer", fontWeight: 500 }}>{m}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onLogin} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${L.border}`, background: "transparent", fontSize: 13, color: L.textMid, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>직원 로그인</button>
          <button onClick={onApply} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: L.green, fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>온라인 접수</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 64 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${L.greenPale} 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 90% 20%, #FDF5EE 0%, transparent 50%)` }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45%", background: `linear-gradient(135deg, ${L.greenPale}, #FFF9F5)`, clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", width: "100%" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: L.teal, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, fontFamily: "'Noto Sans KR', sans-serif" }}>암 전문 맞춤 치료</div>
            <h1 style={{ fontSize: 52, fontWeight: 700, color: L.text, lineHeight: 1.25, letterSpacing: "-0.03em", marginBottom: 24 }}>
              몸과 마음이<br />
              <span style={{ color: L.green }}>함께 치유되는</span><br />
              공간
            </h1>
            <p style={{ fontSize: 17, color: L.textMid, lineHeight: 1.85, marginBottom: 40, fontWeight: 300, fontFamily: "'Noto Sans KR', sans-serif" }}>
              아미랑의원은 암 진단부터 치료, 회복까지<br />
              환자의 삶을 중심에 둔 따뜻한 의학을 실천합니다.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onApply} style={{ padding: "15px 32px", borderRadius: 10, border: "none", background: L.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(45,106,79,0.3)" }}>
                온라인 접수 신청 →
              </button>
              <button style={{ padding: "15px 28px", borderRadius: 10, border: `1px solid ${L.border}`, background: "transparent", color: L.textMid, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                치료 프로그램 보기
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🔬", title: "수십 년의 임상경험", sub: "MD앤더슨 종신교수 자문 협력" },
              { icon: "🎯", title: "맞춤형 통합 치료", sub: "환자 상태에 따른 1:1 프로그램 설계" },
              { icon: "🤝", title: "AI 기반 치료 지원", sub: "최신 의학 데이터 기반 정밀 케어" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: "#fff", borderRadius: 12, border: `1px solid ${L.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 28, width: 50, height: 50, background: L.greenPale, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: L.text, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: L.textMuted, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 400 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TREATMENTS */}
      <div style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 12, color: L.teal, fontWeight: 600, letterSpacing: "0.15em", marginBottom: 16, fontFamily: "'Noto Sans KR', sans-serif" }}>TREATMENT PROGRAMS</div>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: L.text, letterSpacing: "-0.02em", marginBottom: 16 }}>회복을 위한 치료 프로그램</h2>
          <p style={{ fontSize: 16, color: L.textMid, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300 }}>환자의 몸 상태에 맞춘 통합 치료를 제공합니다</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {treatments.map((t, i) => (
            <div key={i} style={{ padding: "32px 28px", background: "#fff", borderRadius: 16, border: `1px solid ${L.border}`, transition: "all 0.2s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = L.greenLight; e.currentTarget.style.boxShadow = "0 8px 30px rgba(45,106,79,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{t.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 10 }}>{t.name}</div>
              <div style={{ fontSize: 14, color: L.textMid, lineHeight: 1.8, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{ background: `linear-gradient(135deg, ${L.green}, ${L.teal})`, padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>치료의 첫 걸음을 함께합니다</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 36, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300 }}>온라인으로 간편하게 접수하시면 담당 상담사가 1일 이내 연락드립니다</p>
        <button onClick={onApply} style={{ padding: "16px 40px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(4px)" }}>
          온라인 접수 신청하기 →
        </button>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "40px", borderTop: `1px solid ${L.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ fontSize: 13, color: L.textMuted }}>© 2025 아미랑의원. All rights reserved.</div>
        <div style={{ fontSize: 13, color: L.textMuted }}>서울특별시 강남구 | 대표: 김선만 | 대표전화: 02-000-0000</div>
      </div>
    </div>
  );
}

/* ─── PATIENT FORM ──────────────────────────────────────────────── */
function PatientForm({ onBack, onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", birth: "", phone: "", region: "", cancer: "", stage: "", symptoms: "", history: "", files: [] });
  const steps = ["기본 정보", "병력 정보", "자료 업로드", "접수 완료"];

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  if (step === 3) return (
    <div style={{ minHeight: "100vh", background: L.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: L.greenPale, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: L.text, marginBottom: 12 }}>접수가 완료되었습니다</h2>
        <p style={{ fontSize: 15, color: L.textMid, lineHeight: 1.8, marginBottom: 32 }}>접수번호 <strong style={{ color: L.green }}>P-2406</strong>으로 등록되었습니다.<br />담당 상담사가 영업일 기준 1일 이내 연락드립니다.</p>
        <div style={{ background: "#fff", border: `1px solid ${L.border}`, borderRadius: 12, padding: 24, marginBottom: 32, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: L.textMuted, marginBottom: 16 }}>진행 단계</div>
          {["✅ 온라인 접수 완료", "⏳ 상담사 배정 중", "○ AI 분석", "○ 원장님 확인", "○ 치료 프로그램 안내"].map((s, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 4 ? `1px solid ${L.border}` : "none", fontSize: 14, color: i === 0 ? L.green : i === 1 ? L.amber : L.textMuted }}>{s}</div>
          ))}
        </div>
        <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: L.green, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>메인으로 돌아가기</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: L.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${L.border}`, padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: L.textMuted }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: L.text }}>온라인 접수 신청</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          {steps.slice(0, 3).map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? L.green : i === step ? L.green : L.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i <= step ? "#fff" : L.textMuted, transition: "all 0.3s" }}>{i < step ? "✓" : i + 1}</div>
                <div style={{ fontSize: 11, color: i <= step ? L.green : L.textMuted, fontWeight: i === step ? 600 : 400 }}>{s}</div>
              </div>
              {i < 2 && <div style={{ height: 2, width: 40, background: i < step ? L.green : L.border, margin: "0 4px", marginBottom: 22, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: `1px solid ${L.border}`, borderRadius: 16, padding: 32 }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 4 }}>기본 정보</h3>
              {[["성명", "name", "홍길동", "text"], ["생년월일", "birth", "1966.04.15", "text"], ["연락처", "phone", "010-0000-0000", "tel"], ["거주 지역", "region", "경기도 성남시", "text"]].map(([label, key, ph, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, color: L.textMid, fontWeight: 600, display: "block", marginBottom: 8 }}>{label}</label>
                  <input type={type} placeholder={ph} value={data[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: L.text, outline: "none", background: L.bg, transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = L.green}
                    onBlur={e => e.target.style.borderColor = L.border} />
                </div>
              ))}
              <button onClick={() => setStep(1)} style={{ padding: "13px", borderRadius: 10, border: "none", background: L.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>다음 단계 →</button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text }}>병력 정보</h3>
              <div>
                <label style={{ fontSize: 13, color: L.textMid, fontWeight: 600, display: "block", marginBottom: 8 }}>암 종류</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["폐암", "유방암", "대장암", "위암", "간암", "갑상선암", "췌장암", "기타"].map(t => (
                    <div key={t} onClick={() => set("cancer", t)} style={{ padding: "10px 16px", border: `1px solid ${data.cancer === t ? L.green : L.border}`, borderRadius: 8, fontSize: 14, color: data.cancer === t ? L.green : L.textMid, cursor: "pointer", fontWeight: data.cancer === t ? 600 : 400, background: data.cancer === t ? L.greenPale : "#fff", transition: "all 0.15s" }}>{t}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: L.textMid, fontWeight: 600, display: "block", marginBottom: 8 }}>병기</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["1기", "2기", "3기", "4기", "미확인"].map(s => (
                    <div key={s} onClick={() => set("stage", s)} style={{ flex: 1, textAlign: "center", padding: "10px 8px", border: `1px solid ${data.stage === s ? L.green : L.border}`, borderRadius: 8, fontSize: 13, color: data.stage === s ? L.green : L.textMid, cursor: "pointer", background: data.stage === s ? L.greenPale : "#fff", fontWeight: data.stage === s ? 600 : 400, transition: "all 0.15s" }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: L.textMid, fontWeight: 600, display: "block", marginBottom: 8 }}>현재 증상 및 특이사항</label>
                <textarea rows={4} placeholder="현재 느끼시는 증상을 자세히 기입해 주세요..." value={data.symptoms} onChange={e => set("symptoms", e.target.value)} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: L.text, outline: "none", resize: "none", background: L.bg }}
                  onFocus={e => e.target.style.borderColor = L.green}
                  onBlur={e => e.target.style.borderColor = L.border} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: L.textMid, fontWeight: 600, display: "block", marginBottom: 8 }}>기존 치료 이력</label>
                <textarea rows={3} placeholder="수술, 항암치료, 방사선치료 등 이전 치료 이력을 기입해 주세요..." value={data.history} onChange={e => set("history", e.target.value)} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: L.text, outline: "none", resize: "none", background: L.bg }}
                  onFocus={e => e.target.style.borderColor = L.green}
                  onBlur={e => e.target.style.borderColor = L.border} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(0)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${L.border}`, background: "transparent", color: L.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(2)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: L.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다음 단계 →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text }}>진료기록 업로드</h3>
              <p style={{ fontSize: 13, color: L.textMuted, lineHeight: 1.7, marginTop: -10 }}>최근 검사 결과 및 진료기록을 업로드해 주시면 더 정확한 상담이 가능합니다.</p>
              {[["CT/MRI 결과지", "최근 3개월 이내 권장", true], ["혈액검사 결과지", "최근 1개월 이내 권장", true], ["조직검사 결과지", "병리 결과 포함", false], ["이전 처방전/의무기록", "선택 항목", false]].map(([name, desc, req]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", border: `1px dashed ${L.border}`, borderRadius: 10, background: L.bg }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: L.text }}>{name} {req && <span style={{ color: L.red, fontSize: 12 }}>*</span>}</div>
                    <div style={{ fontSize: 12, color: L.textMuted, marginTop: 3 }}>{desc} · PDF, JPG, PNG</div>
                  </div>
                  <button style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${L.border}`, background: "#fff", fontSize: 12, color: L.textMid, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>📎 업로드</button>
                </div>
              ))}
              <div style={{ padding: "14px 18px", background: L.greenPale, borderRadius: 10, fontSize: 13, color: L.teal, lineHeight: 1.7 }}>
                💡 제출된 자료는 상담사가 확인 후 AI 보조 분석에 활용됩니다. 본 시스템은 진료 또는 처방이 아닙니다.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${L.border}`, background: "transparent", color: L.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: L.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>접수 완료 →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── LOGIN ──────────────────────────────────────────────────────── */
function Login({ onLogin, onBack }) {
  const [sel, setSel] = useState(null);
  const roles = [
    { id: "sales", icon: "💬", label: "영업 담당", sub: "상담 CRM", color: D.amber },
    { id: "director", icon: "🩺", label: "원장님", sub: "AI 분석 · 컨펌", color: D.teal },
    { id: "nurse", icon: "💉", label: "간호사", sub: "치료 기록", color: D.purple },
    { id: "admin", icon: "🏢", label: "본사 관리자", sub: "브랜치 · 설정", color: "#F97316" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: D.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
      <button onClick={onBack} style={{ position: "absolute", top: 24, left: 24, background: "none", border: "none", cursor: "pointer", color: D.textMuted, fontSize: 22 }}>←</button>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: D.teal }}>ONCO</span>
        <span style={{ fontSize: 26, fontWeight: 900, color: D.text }}>NEXUS</span>
      </div>
      <div style={{ fontSize: 13, color: D.textMuted, marginBottom: 48 }}>직원 포털 로그인</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 200px)", gap: 12 }}>
        {roles.map(r => (
          <div key={r.id} onClick={() => setSel(r.id)} style={{ padding: "28px 20px", background: sel === r.id ? `${r.color}15` : D.surface, border: `1px solid ${sel === r.id ? r.color : D.border}`, borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: sel === r.id ? r.color : D.text, marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: D.textMuted }}>{r.sub}</div>
          </div>
        ))}
      </div>
      <button onClick={() => sel && onLogin(sel)} disabled={!sel} style={{ marginTop: 28, padding: "12px 40px", borderRadius: 10, border: "none", background: sel ? D.teal : D.surfaceHigh, color: sel ? "#0A0F1A" : D.textMuted, fontSize: 14, fontWeight: 700, cursor: sel ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s" }}>
        {sel ? `${roles.find(r => r.id === sel)?.label} 로그인 →` : "역할을 선택해 주세요"}
      </button>
    </div>
  );
}

/* ─── SALES DASHBOARD ───────────────────────────────────────────── */
function SalesDashboard() {
  const [sel, setSel] = useState(patients[0]);
  const [tab, setTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([
    { time: "03.14 14:30", text: "초기 전화 상담 완료. 면역치료에 관심 많음. 내원 의향 있음.", type: "전화" },
    { time: "03.15 10:00", text: "진료기록 검토. CT결과 확인. AI 분석 요청 예정.", type: "메모" },
  ]);
  const [aiSent, setAiSent] = useState(false);

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(n => [...n, { time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }), text: newNote, type: "메모" }]);
    setNewNote("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, height: "calc(100vh - 56px)", overflow: "hidden" }}>
      {/* Patient List */}
      <div style={{ borderRight: `1px solid ${D.border}`, overflow: "auto", padding: "16px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted, letterSpacing: "0.1em", marginBottom: 12, padding: "0 8px" }}>담당 환자 · {patients.length}명</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {patients.map(p => (
            <div key={p.id} onClick={() => { setSel(p); setTab("info"); setAiSent(false); }} style={{ padding: "14px 14px", borderRadius: 10, background: sel?.id === p.id ? D.surfaceHigh : "transparent", border: `1px solid ${sel?.id === p.id ? D.border : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${D.teal}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: D.teal }}>{p.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: D.text }}>{p.name} <span style={{ fontSize: 12, color: D.textMuted, fontWeight: 400 }}>{p.age}세</span></div>
                    <div style={{ fontSize: 11, color: D.textMuted }}>{p.cancer}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <DTag status={p.status} />
                <span style={{ fontSize: 11, color: D.textMuted }}>{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      {sel && (
        <div style={{ overflow: "auto", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: D.text }}>{sel.name}</h2>
                <span style={{ fontSize: 14, color: D.textMuted }}>{sel.age}세 · {sel.cancer}</span>
                <DTag status={sel.status} />
              </div>
              <div style={{ fontSize: 13, color: D.textMuted, marginTop: 4 }}>접수번호 {sel.id} · 연락처 {sel.phone} · {sel.branch}</div>
            </div>
            {!aiSent ? (
              <DBtn onClick={() => setAiSent(true)}>🤖 AI 분석 요청</DBtn>
            ) : (
              <span style={{ fontSize: 13, color: D.teal, fontWeight: 700 }}>✓ AI 분석 요청 완료 — 원장님 검토 대기중</span>
            )}
          </div>

          {aiSent && (
            <div style={{ background: `${D.teal}12`, border: `1px solid ${D.teal}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: D.teal }}>
              ✓ AI 에이전트에게 분석 요청이 전달되었습니다. 원장님이 확인 후 치료 계획을 수립합니다.
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${D.border}`, paddingBottom: 0 }}>
            {["info", "files", "consult"].map(t => (
              <div key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 400, color: tab === t ? D.teal : D.textMuted, borderBottom: `2px solid ${tab === t ? D.teal : "transparent"}`, marginBottom: -1, transition: "all 0.15s" }}>
                {{ info: "환자 정보", files: "파일 관리", consult: "상담 기록" }[t]}
              </div>
            ))}
          </div>

          {tab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <DCard>
                <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 14, letterSpacing: "0.05em" }}>기본 정보</div>
                {[["성명", sel.name], ["나이", `${sel.age}세`], ["진단", sel.cancer], ["지점", sel.branch], ["연락처", sel.phone], ["접수일", sel.date]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${D.border}`, fontSize: 13 }}>
                    <span style={{ color: D.textMuted }}>{k}</span>
                    <span style={{ color: D.text, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </DCard>
              <DCard>
                <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 14, letterSpacing: "0.05em" }}>문진 내용</div>
                <div style={{ fontSize: 13, color: D.textDim, lineHeight: 1.8 }}>
                  {sel.consult || <span style={{ color: D.textMuted, fontStyle: "italic" }}>문진 내용이 없습니다. 상담 후 입력해 주세요.</span>}
                </div>
              </DCard>
            </div>
          )}

          {tab === "files" && (
            <DCard>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>업로드된 파일 · {sel.files.length}개</div>
              {sel.files.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: D.textMuted, fontSize: 13 }}>아직 업로드된 파일이 없습니다</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {sel.files.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: D.surfaceHigh, borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>📄</span>
                        <div>
                          <div style={{ fontSize: 13, color: D.text, fontWeight: 500 }}>{f}</div>
                          <div style={{ fontSize: 11, color: D.textMuted }}>PDF · {(Math.random() * 3 + 0.5).toFixed(1)} MB</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <DBtn variant="ghost" size="sm">보기</DBtn>
                        <DBtn variant="ghost" size="sm">다운로드</DBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ border: `2px dashed ${D.border}`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
                <div style={{ fontSize: 13, color: D.textMuted, marginBottom: 12 }}>파일을 여기에 드롭하거나 클릭하여 업로드</div>
                <DBtn variant="ghost" size="sm">파일 선택</DBtn>
              </div>
            </DCard>
          )}

          {tab === "consult" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.map((n, i) => (
                <DCard key={i} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", background: D.surfaceHigh, borderRadius: 4, color: D.textMuted, fontWeight: 600 }}>{n.type}</span>
                    <span style={{ fontSize: 11, color: D.textMuted }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: D.textDim, lineHeight: 1.7 }}>{n.text}</div>
                </DCard>
              ))}
              <DCard style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: D.textMuted, marginBottom: 10, fontWeight: 600 }}>상담 기록 추가</div>
                <textarea rows={3} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="상담 내용을 입력하세요..." style={{ width: "100%", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, padding: "10px 14px", color: D.text, fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <DBtn variant="ghost" size="sm" style={{ flex: 1 }}>전화 상담</DBtn>
                  <DBtn variant="ghost" size="sm" style={{ flex: 1 }}>내원 상담</DBtn>
                  <DBtn size="sm" onClick={addNote} style={{ flex: 2 }}>기록 저장</DBtn>
                </div>
              </DCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── AI THINK ANIMATION ─────────────────────────────────────────── */
function AIThink({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["환자 문진 데이터 파싱...", "과거 진료기록 벡터 임베딩 분석...", "RAG DB 유사 케이스 23건 검색...", "의학 문헌 17편 참조...", "프로그램 적합도 스코어링...", "원장님 판단 로직 적용...", "최종 리포트 생성 완료 ✓"];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => { if (s >= steps.length - 1) { clearInterval(iv); setTimeout(onDone, 600); return s; } return s + 1; }), 650);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(${D.teal} ${step * 14}%, transparent 0)`, animation: "spin 1s linear infinite", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: D.teal }}>ONCO-AI 에이전트 분석 중</div>
          <div style={{ fontSize: 11, color: D.textMuted }}>RAG v2.4 · 판단로직 연동</div>
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, opacity: i <= step ? 1 : 0.2, transition: "opacity 0.4s" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: i < step ? D.teal : i === step ? D.amber : D.surfaceHigh, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#0A0F1A", fontWeight: 700 }}>{i < step ? "✓" : ""}</div>
          <span style={{ fontSize: 12, color: i <= step ? D.text : D.textMuted, fontFamily: "monospace" }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── DIRECTOR DASHBOARD ─────────────────────────────────────────── */
function DirectorDashboard() {
  const [sel, setSel] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | thinking | report | confirming | done
  const [selectedProgs, setSelectedProgs] = useState([]);
  const [note, setNote] = useState("");

  const waiting = patients.filter(p => ["ai_done", "ai_pending"].includes(p.status));

  const toggleProg = (id) => setSelectedProgs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const selectPatient = (p) => { setSel(p); setPhase("idle"); setSelectedProgs([]); setNote(""); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 56px)", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${D.border}`, overflow: "auto", padding: "16px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, padding: "0 4px" }}>
          {[{ label: "컨펌 대기", v: "3", c: D.amber }, { label: "전체 환자", v: "47", c: D.teal }].map(s => (
            <DCard key={s.label} style={{ padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D.textMuted, marginTop: 2 }}>{s.label}</div>
            </DCard>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted, letterSpacing: "0.1em", marginBottom: 10, padding: "0 6px" }}>AI 분석 완료 · 컨펌 대기</div>
        {waiting.map(p => (
          <div key={p.id} onClick={() => selectPatient(p)} style={{ padding: "12px 12px", borderRadius: 10, background: sel?.id === p.id ? D.surfaceHigh : "transparent", border: `1px solid ${sel?.id === p.id ? D.border : "transparent"}`, cursor: "pointer", marginBottom: 6, transition: "all 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: D.text }}>{p.name}</span>
              <DTag status={p.status} />
            </div>
            <div style={{ fontSize: 12, color: D.textMuted }}>{p.age}세 · {p.cancer}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ overflow: "auto", padding: 24 }}>
        {!sel ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: D.textMuted, gap: 16 }}>
            <div style={{ fontSize: 48 }}>🩺</div>
            <div style={{ fontSize: 15 }}>환자를 선택하여 AI 분석 및 컨펌을 진행합니다</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: D.text }}>{sel.name}</h2>
                  <span style={{ color: D.textMuted, fontSize: 14 }}>{sel.age}세 · {sel.cancer}</span>
                  <DTag status={sel.status} />
                </div>
                <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{sel.id} · {sel.branch}</div>
              </div>
              {phase === "idle" && <DBtn onClick={() => setPhase("thinking")}>🤖 AI 분석 실행</DBtn>}
              {phase === "done" && <span style={{ color: D.teal, fontWeight: 700, fontSize: 14 }}>✓ 컨펌 완료 — 간호팀 전달됨</span>}
            </div>

            {phase === "idle" && (
              <DCard style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
                <div style={{ fontSize: 40 }}>📋</div>
                <div style={{ fontSize: 14, color: D.textMuted, textAlign: "center" }}>AI 분석 실행 버튼을 누르면<br />영업 상담 기록, 진료기록, RAG 데이터베이스를<br />종합한 추천 리포트를 생성합니다</div>
              </DCard>
            )}

            {phase === "thinking" && (
              <DCard><AIThink onDone={() => setPhase("report")} /></DCard>
            )}

            {(phase === "report" || phase === "confirming" || phase === "done") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* AI Summary */}
                <DCard style={{ background: `${D.teal}0A`, borderColor: `${D.tealDim}66` }}>
                  <div style={{ fontSize: 11, color: D.teal, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>ONCO-AI 분석 요약</div>
                  <div style={{ fontSize: 14, color: D.text, lineHeight: 1.8 }}>
                    <strong>{sel.name}</strong> ({sel.age}세, {sel.cancer}) 환자의 진료기록·문진·영업상담 데이터를 종합 분석한 결과, 유사 케이스 <strong style={{ color: D.teal }}>23건</strong>과의 매칭을 통해 면역 기능 강화 중심의 복합 치료 접근이 적합한 것으로 판단됩니다.
                  </div>
                </DCard>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <DCard>
                    <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 12 }}>신뢰도 스코어</div>
                    {[{ l: "케이스 유사도", v: 87 }, { l: "프로그램 적합도", v: 91 }, { l: "위험 지표", v: 24 }].map(({ l, v }) => (
                      <div key={l} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: D.textDim }}>{l}</span>
                          <span style={{ color: D.teal, fontWeight: 700 }}>{v}%</span>
                        </div>
                        <div style={{ height: 4, background: D.surfaceHigh, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${v}%`, background: D.teal, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </DCard>
                  <DCard>
                    <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 12 }}>참조 근거</div>
                    {["Journal of Oncology 2023 — 폐암 3기 면역치료 효과", "원내 유사 케이스 #1847, #2103", "대한종양학회 가이드라인 2024"].map((r, i) => (
                      <div key={i} style={{ padding: "7px 10px", background: D.surfaceHigh, borderRadius: 6, fontSize: 12, color: D.textDim, marginBottom: 6 }}>📄 {r}</div>
                    ))}
                  </DCard>
                </div>

                {/* Program Selection */}
                <DCard>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700 }}>치료 프로그램 선택 <span style={{ color: D.amber }}>*원장님 직접 선택</span></div>
                    <span style={{ fontSize: 12, color: D.teal }}>{selectedProgs.length}개 선택됨</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {programs.map(p => {
                      const on = selectedProgs.includes(p.id);
                      const ai = ["A", "B"].includes(p.id); // AI recommended
                      return (
                        <div key={p.id} onClick={() => phase !== "done" && toggleProg(p.id)} style={{ padding: "14px 14px", border: `1px solid ${on ? D.teal : D.border}`, borderRadius: 10, cursor: phase === "done" ? "default" : "pointer", background: on ? `${D.teal}0E` : "transparent", transition: "all 0.15s", position: "relative" }}>
                          {ai && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 10, color: D.teal, background: `${D.teal}22`, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>AI 추천</div>}
                          <div style={{ fontSize: 13, fontWeight: 700, color: on ? D.teal : D.text, marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: D.textMuted, marginBottom: 6 }}>{p.desc}</div>
                          <div style={{ fontSize: 11, color: D.textDim }}>{p.duration} · {p.sessions}회</div>
                        </div>
                      );
                    })}
                  </div>
                </DCard>

                {/* Director Note */}
                <DCard>
                  <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>원장님 지시사항</div>
                  <textarea rows={3} value={note} onChange={e => phase !== "done" && setNote(e.target.value)} placeholder="간호팀에게 전달할 특이사항, 주의사항을 입력하세요..." disabled={phase === "done"} style={{ width: "100%", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, padding: "10px 14px", color: D.text, fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", opacity: phase === "done" ? 0.7 : 1 }} />
                </DCard>

                {phase !== "done" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <DBtn variant="ghost" style={{ flex: 1 }}>수정 요청</DBtn>
                    <DBtn variant="danger" style={{ flex: 1 }}>반려</DBtn>
                    <DBtn disabled={selectedProgs.length === 0} onClick={() => setPhase("done")} style={{ flex: 3, fontSize: 15 }}>✓ 컨펌 및 간호팀 전달</DBtn>
                  </div>
                )}

                {phase === "done" && (
                  <div style={{ padding: "16px 20px", background: `${D.teal}12`, border: `1px solid ${D.teal}44`, borderRadius: 10, fontSize: 14, color: D.teal, textAlign: "center" }}>
                    ✓ 간호팀에게 치료 프로그램이 전달되었습니다 — {selectedProgs.map(id => programs.find(p => p.id === id)?.name).join(", ")}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── NURSE DASHBOARD ───────────────────────────────────────────── */
function NurseDashboard() {
  const [selSchedule, setSelSchedule] = useState(null);
  const [records, setRecords] = useState(nurseSchedule);
  const [activeTab, setActiveTab] = useState("today");
  const [noteInput, setNoteInput] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);

  const today = records.filter(s => s.date === "2025.03.18");
  const upcoming = records.filter(s => s.status === "upcoming");
  const done = records.filter(s => s.status === "done");

  const markDone = () => {
    setRecords(r => r.map(s => s.id === selSchedule.id ? { ...s, status: "done", note: noteInput || "특이사항 없음." } : s));
    setSelSchedule(r => ({ ...r, status: "done", note: noteInput || "특이사항 없음." }));
    setShowLogModal(false);
    setNoteInput("");
  };

  const dispRecords = activeTab === "today" ? today : activeTab === "upcoming" ? upcoming : done;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "calc(100vh - 56px)", overflow: "hidden" }}>
      <div style={{ overflow: "auto", padding: 20, borderRight: `1px solid ${D.border}` }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[{ l: "오늘 세션", v: today.length + "건", c: D.purple }, { l: "완료", v: done.length + "건", c: D.teal }, { l: "예정", v: upcoming.length + "건", c: D.amber }, { l: "이번 주", v: "12건", c: D.blue }].map(s => (
            <DCard key={s.l} style={{ padding: "14px 10px", textAlign: "center" }}>
              <DStat label={s.l} value={s.v} color={s.c} />
            </DCard>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[["today", "오늘"], ["upcoming", "예정"], ["done", "완료"]].map(([id, label]) => (
            <div key={id} onClick={() => setActiveTab(id)} style={{ padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: activeTab === id ? D.surfaceHigh : "transparent", color: activeTab === id ? D.text : D.textMuted, border: `1px solid ${activeTab === id ? D.border : "transparent"}`, transition: "all 0.15s" }}>{label}</div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dispRecords.map(s => (
            <div key={s.id} onClick={() => setSelSchedule(s)} style={{ padding: "16px 18px", background: selSchedule?.id === s.id ? D.surfaceHigh : D.surface, border: `1px solid ${selSchedule?.id === s.id ? D.border : D.border}`, borderRadius: 12, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center", minWidth: 52 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.status === "done" ? D.teal : D.purple }}>{s.time}</div>
                <div style={{ fontSize: 10, color: D.textMuted }}>{s.date.slice(5)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{s.patient}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: s.status === "done" ? `${D.teal}22` : `${D.purple}22`, color: s.status === "done" ? D.teal : D.purple, fontWeight: 600 }}>{s.status === "done" ? "완료" : "예정"}</span>
                </div>
                <div style={{ fontSize: 12, color: D.textMuted }}>{s.program} · {s.session}</div>
                {s.note && s.status === "done" && <div style={{ fontSize: 12, color: D.textDim, marginTop: 4 }}>📝 {s.note}</div>}
              </div>
              {s.status === "upcoming" && <DBtn variant="teal" size="sm" onClick={e => { e.stopPropagation(); setSelSchedule(s); setShowLogModal(true); }}>기록하기</DBtn>}
            </div>
          ))}
          {dispRecords.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: D.textMuted, fontSize: 14 }}>해당 항목이 없습니다</div>}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ overflow: "auto", padding: 20 }}>
        {selSchedule ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: D.text, marginBottom: 4 }}>{selSchedule.patient} 치료 지시서</div>
            <div style={{ fontSize: 12, color: D.textMuted, marginBottom: 20 }}>이재원 원장님 컨펌 · {selSchedule.date} {selSchedule.time}</div>

            <DCard style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>처방 프로그램</div>
              <div style={{ padding: "14px", background: `${D.purple}11`, border: `1px solid ${D.purple}33`, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: D.text, marginBottom: 4 }}>{selSchedule.program}</div>
                <div style={{ fontSize: 12, color: D.textMuted }}>세션 진행: <strong style={{ color: D.purple }}>{selSchedule.session}</strong></div>
              </div>
            </DCard>

            <DCard style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>원장님 지시사항</div>
              <div style={{ padding: "12px 14px", background: `${D.amber}11`, border: `1px solid ${D.amber}33`, borderRadius: 8, fontSize: 13, color: D.textDim, lineHeight: 1.7 }}>
                ⚠ 신장 기능 수치 재확인 필요. 시술 전 혈압 체크 필수. 이상 반응 시 즉시 보고.
              </div>
            </DCard>

            {selSchedule.status === "done" && (
              <DCard style={{ background: `${D.teal}0A`, borderColor: `${D.tealDim}44` }}>
                <div style={{ fontSize: 11, color: D.teal, fontWeight: 700, marginBottom: 8 }}>치료 기록</div>
                <div style={{ fontSize: 13, color: D.textDim }}>{selSchedule.note}</div>
              </DCard>
            )}

            {selSchedule.status === "upcoming" && !showLogModal && (
              <DBtn onClick={() => setShowLogModal(true)} style={{ width: "100%", justifyContent: "center" }} variant="purple">치료 완료 기록하기</DBtn>
            )}

            {showLogModal && (
              <DCard style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 12 }}>치료 기록 입력</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {["특이사항 없음", "경미한 반응", "중단/보고"].map(t => (
                    <div key={t} onClick={() => setNoteInput(t === "특이사항 없음" ? "" : t)} style={{ flex: 1, textAlign: "center", padding: "8px 6px", border: `1px solid ${D.border}`, borderRadius: 8, fontSize: 12, color: D.textMuted, cursor: "pointer", background: D.surfaceHigh }}>{t}</div>
                  ))}
                </div>
                <textarea rows={3} value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="특이사항을 입력하세요..." style={{ width: "100%", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, padding: "10px 14px", color: D.text, fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <DBtn variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => setShowLogModal(false)}>취소</DBtn>
                  <DBtn size="sm" style={{ flex: 2 }} onClick={markDone}>✓ 완료 처리</DBtn>
                </div>
              </DCard>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: D.textMuted }}>
            <div style={{ fontSize: 40 }}>💉</div>
            <div style={{ fontSize: 14 }}>세션을 선택하면 지시사항을 확인합니다</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── DASHBOARD LAYOUT ───────────────────────────────────────────── */
const roleCfg = {
  sales: { label: "영업 담당", color: D.amber, sub: "상담 CRM" },
  director: { label: "원장님", color: D.teal, sub: "AI 분석 · 컨펌" },
  nurse: { label: "간호사", color: D.purple, sub: "치료 기록" },
  admin: { label: "본사 관리자", color: "#F97316", sub: "관리" },
};

function Dashboard({ role, onLogout }) {
  const cfg = roleCfg[role];
  const Content = { sales: SalesDashboard, director: DirectorDashboard, nurse: NurseDashboard, admin: () => <div style={{ padding: 40, color: D.textMuted }}>관리자 화면 준비 중</div> }[role];

  return (
    <div style={{ minHeight: "100vh", background: D.bg, fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif", color: D.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform:rotate(360deg); } } * { box-sizing:border-box; } ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:${D.border};border-radius:2px}`}</style>
      {/* Topbar */}
      <div style={{ height: 56, background: D.surface, borderBottom: `1px solid ${D.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: D.teal }}>ONCO</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: D.text }}>NEXUS</span>
        </div>
        <div style={{ width: 1, height: 16, background: D.border }} />
        <span style={{ fontSize: 13, color: D.textMuted }}>강남 본점</span>
        <div style={{ flex: 1 }} />
        <span style={{ padding: "4px 12px", borderRadius: 20, background: `${cfg.color}22`, color: cfg.color, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
        <button onClick={onLogout} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${D.border}`, background: "transparent", color: D.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>로그아웃</button>
      </div>
      <Content />
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("landing"); // landing | apply | login | dashboard
  const [role, setRole] = useState(null);

  if (view === "apply") return <PatientForm onBack={() => setView("landing")} onDone={() => setView("landing")} />;
  if (view === "login") return <Login onBack={() => setView("landing")} onLogin={r => { setRole(r); setView("dashboard"); }} />;
  if (view === "dashboard") return <Dashboard role={role} onLogout={() => { setRole(null); setView("landing"); }} />;
  return <Landing onApply={() => setView("apply")} onLogin={() => setView("login")} />;
}
