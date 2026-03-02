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
  confirmed: { label: "원장 컨펌", color: D.green, bg: "#34D39922" },
  in_treatment: { label: "치료 진행중", color: D.purple, bg: "#A78BFA22" },
};

const patients = [
  { id: "P-001", name: "김민준", age: 58, cancer: "폐암 3기", status: "ai_done", date: "2025.03.14", branch: "강남점", phone: "010-1234-5678", consult: "항암치료 2회 완료 후 면역 기능 강화 목적으로 내원 희망. 통증 NRS 5/10. 부친 폐암 병력.", files: ["CT결과_2025.03.pdf", "혈액검사_2025.03.pdf"] },
  { id: "P-002", name: "이서연", age: 46, cancer: "유방암 2기", status: "consulting", date: "2025.03.13", branch: "강남점", phone: "010-2345-6789", consult: "수술 후 회복 중. 항암부작용으로 피로감 극심. 영양 집중치료 문의.", files: ["수술확인서.pdf"] },
  { id: "P-003", name: "박지호", age: 63, cancer: "대장암 2기", status: "confirmed", date: "2025.03.12", branch: "강남점", phone: "010-3456-7890", consult: "기존 치료 병행 희망. 고주파 온열치료에 관심 많음. 당뇨 병력 있음.", files: ["진단서.pdf", "처방전.pdf"] },
  { id: "P-004", name: "최유진", age: 51, cancer: "위암 1기", status: "in_treatment", date: "2025.03.10", branch: "강남점", phone: "010-4567-8901", consult: "조기 발견. 수술 없이 비침습적 치료 선호. 영양 상태 양호.", files: ["내시경결과.pdf"] },
  { id: "P-005", name: "정승현", age: 67, cancer: "간암 3기", status: "new", date: "2025.03.15", branch: "강남점", phone: "010-5678-9012", consult: "", files: [] },
  { id: "P-006", name: "한소희", age: 44, cancer: "갑상선암 1기", status: "ai_pending", date: "2025.03.15", branch: "강남점", phone: "010-6789-0123", consult: "조기 발견, 수술 전 면역력 강화 희망. 직장인으로 주말 치료 선호.", files: ["초음파결과.pdf"] },
  { id: "P-007", name: "윤재석", age: 72, cancer: "전립선암 2기", status: "ai_done", date: "2025.03.14", branch: "강남점", phone: "010-7890-1234", consult: "고령으로 수술 부담. 비침습적 치료 우선 검토. 고혈압 약 복용 중.", files: ["MRI결과.pdf", "혈액검사.pdf"] },
  { id: "P-008", name: "송미영", age: 55, cancer: "췌장암 2기", status: "ai_done", date: "2025.03.13", branch: "강남점", phone: "010-8901-2345", consult: "항암 1차 완료. 부작용으로 체중 감소 심함. 영양 치료 병행 필수.", files: ["CT결과.pdf", "영양상태평가.pdf"] },
];

// 오늘 일정 (원장용)
const todaySchedule = [
  { time: "09:00", patient: "박지호", type: "면역강화 프로그램", room: "1번 치료실", status: "done" },
  { time: "10:00", patient: "최유진", type: "비타민C 치료", room: "2번 치료실", status: "done" },
  { time: "11:00", patient: "김민준", type: "초진 상담", room: "상담실", status: "current" },
  { time: "14:00", patient: "윤재석", type: "AI 분석 검토", room: "원장실", status: "upcoming" },
  { time: "15:00", patient: "송미영", type: "치료 계획 상담", room: "상담실", status: "upcoming" },
  { time: "16:30", patient: "한소희", type: "초진 상담", room: "상담실", status: "upcoming" },
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

/* ─── PATIENT FORM (5-Step) ──────────────────────────────────────── */
function PatientForm({ onBack, onDashboard }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    // Step 1: 기본 정보
    name: "", gender: "", birth: "", phone: "", address: "",
    // Step 2: 신체 정보
    height: "", weight: "", insurance: "", visitSource: "",
    // Step 3: 암 진단 정보
    cancer: "", diagnosisDate: "", hospital: "", surgery: "", metastasis: "",
    // Step 4: 치료 이력
    chemo: "", radiation: "", conditions: [],
    // Step 5: 생활습관
    diet: "", bowel: "", sleep: "", exercise: "",
  });
  const steps = ["기본 정보", "신체 정보", "암 진단 정보", "치료 이력", "생활습관"];

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggleCondition = (c) => setData(d => ({
    ...d,
    conditions: d.conditions.includes(c) ? d.conditions.filter(x => x !== c) : [...d.conditions, c]
  }));

  // 완료 화면
  if (step === 5) return (
    <div style={{ minHeight: "100vh", background: D.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${D.teal}22`, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: D.teal }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: D.text, marginBottom: 12 }}>접수가 완료되었습니다</h2>
        <p style={{ fontSize: 15, color: D.textDim, lineHeight: 1.8, marginBottom: 32 }}>접수번호 <strong style={{ color: D.teal }}>P-2406</strong>으로 등록되었습니다.<br />담당 상담사가 영업일 기준 1일 이내 연락드립니다.</p>
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 12, padding: 24, marginBottom: 32, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: D.textMuted, marginBottom: 16 }}>진행 단계</div>
          {["✅ 온라인 접수 완료", "⏳ 상담사 배정 중", "○ 검사 분석", "○ 원장 확인", "○ 치료 프로그램 안내"].map((s, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < 4 ? `1px solid ${D.border}` : "none", fontSize: 14, color: i === 0 ? D.teal : i === 1 ? D.amber : D.textMuted }}>{s}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 8, border: `1px solid ${D.border}`, background: "transparent", color: D.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>메인으로 돌아가기</button>
          <button onClick={onDashboard} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>환자 대시보드 보기 →</button>
        </div>
      </div>
    </div>
  );

  const inputStyle = { width: "100%", padding: "12px 16px", border: `1px solid ${D.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: D.text, outline: "none", background: D.surfaceHigh, transition: "border-color 0.2s", boxSizing: "border-box" };
  const labelStyle = { fontSize: 13, color: D.textDim, fontWeight: 600, display: "block", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: D.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: D.surface, borderBottom: `1px solid ${D.border}`, padding: isMobile ? "0 16px" : "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: D.textMuted }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: D.text }}>온라인 문진표</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40, overflowX: "auto", paddingBottom: 4 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 80 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? D.teal : i === step ? D.teal : D.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i <= step ? "#0A0F1A" : D.textMuted, transition: "all 0.3s" }}>{i < step ? "✓" : i + 1}</div>
                <div style={{ fontSize: 10, color: i <= step ? D.teal : D.textMuted, fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>{s}</div>
              </div>
              {i < 4 && <div style={{ height: 2, width: 24, background: i < step ? D.teal : D.border, margin: "0 2px", marginBottom: 22, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 32 }}>
          {/* STEP 1: 기본 정보 */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: D.text, marginBottom: 4 }}>기본 정보</h3>
              <div>
                <label style={labelStyle}>성함</label>
                <input type="text" placeholder="홍길동" value={data.name} onChange={e => set("name", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>성별</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["남", "여"].map(g => (
                    <div key={g} onClick={() => set("gender", g)} style={{ flex: 1, textAlign: "center", padding: "12px", border: `1px solid ${data.gender === g ? D.teal : D.border}`, borderRadius: 10, cursor: "pointer", background: data.gender === g ? `${D.teal}18` : "transparent", color: data.gender === g ? D.teal : D.textDim, fontWeight: data.gender === g ? 600 : 400, transition: "all 0.15s" }}>{g}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>생년월일</label>
                <input type="text" placeholder="1966.04.15" value={data.birth} onChange={e => set("birth", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>연락처 (본인)</label>
                <input type="tel" placeholder="010-0000-0000" value={data.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>주소</label>
                <input type="text" placeholder="서울특별시 강남구 테헤란로 123" value={data.address} onChange={e => set("address", e.target.value)} style={inputStyle} />
              </div>
              <button onClick={() => setStep(1)} style={{ padding: "13px", borderRadius: 10, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>다음 단계 →</button>
            </div>
          )}

          {/* STEP 2: 신체 정보 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: D.text }}>신체 정보</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>키 (cm)</label>
                  <input type="number" placeholder="170" value={data.height} onChange={e => set("height", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>체중 (kg)</label>
                  <input type="number" placeholder="65" value={data.weight} onChange={e => set("weight", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>실손보험 여부</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["가입", "미가입", "모름"].map(v => (
                    <div key={v} onClick={() => set("insurance", v)} style={{ flex: 1, textAlign: "center", padding: "12px", border: `1px solid ${data.insurance === v ? D.teal : D.border}`, borderRadius: 10, cursor: "pointer", background: data.insurance === v ? `${D.teal}18` : "transparent", color: data.insurance === v ? D.teal : D.textDim, fontWeight: data.insurance === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>내원 경로</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["지인소개", "인터넷", "SNS", "병원추천", "기타"].map(v => (
                    <div key={v} onClick={() => set("visitSource", v)} style={{ padding: "10px 16px", border: `1px solid ${data.visitSource === v ? D.teal : D.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer", background: data.visitSource === v ? `${D.teal}18` : "transparent", color: data.visitSource === v ? D.teal : D.textDim, fontWeight: data.visitSource === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(0)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${D.border}`, background: "transparent", color: D.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(2)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다음 단계 →</button>
              </div>
            </div>
          )}

          {/* STEP 3: 암 진단 정보 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: D.text }}>암 진단 정보</h3>
              <div>
                <label style={labelStyle}>진단명</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["폐암", "유방암", "대장암", "위암", "간암", "갑상선암", "기타"].map(c => (
                    <div key={c} onClick={() => set("cancer", c)} style={{ padding: "10px 16px", border: `1px solid ${data.cancer === c ? D.teal : D.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer", background: data.cancer === c ? `${D.teal}18` : "transparent", color: data.cancer === c ? D.teal : D.textDim, fontWeight: data.cancer === c ? 600 : 400, transition: "all 0.15s" }}>{c}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>진단일자</label>
                <input type="text" placeholder="2024.10.15" value={data.diagnosisDate} onChange={e => set("diagnosisDate", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>치료 병원</label>
                <input type="text" placeholder="아미랑의원" value={data.hospital} onChange={e => set("hospital", e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>수술 여부</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["예", "아니오"].map(v => (
                      <div key={v} onClick={() => set("surgery", v)} style={{ flex: 1, textAlign: "center", padding: "10px", border: `1px solid ${data.surgery === v ? D.teal : D.border}`, borderRadius: 8, cursor: "pointer", background: data.surgery === v ? `${D.teal}18` : "transparent", color: data.surgery === v ? D.teal : D.textDim, fontWeight: data.surgery === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>전이 여부</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["예", "아니오"].map(v => (
                      <div key={v} onClick={() => set("metastasis", v)} style={{ flex: 1, textAlign: "center", padding: "10px", border: `1px solid ${data.metastasis === v ? D.teal : D.border}`, borderRadius: 8, cursor: "pointer", background: data.metastasis === v ? `${D.teal}18` : "transparent", color: data.metastasis === v ? D.teal : D.textDim, fontWeight: data.metastasis === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${D.border}`, background: "transparent", color: D.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다음 단계 →</button>
              </div>
            </div>
          )}

          {/* STEP 4: 치료 이력 */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: D.text }}>치료 이력</h3>
              <div>
                <label style={labelStyle}>항암치료</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["없음", "진행중", "완료"].map(v => (
                    <div key={v} onClick={() => set("chemo", v)} style={{ flex: 1, textAlign: "center", padding: "12px", border: `1px solid ${data.chemo === v ? D.teal : D.border}`, borderRadius: 10, cursor: "pointer", background: data.chemo === v ? `${D.teal}18` : "transparent", color: data.chemo === v ? D.teal : D.textDim, fontWeight: data.chemo === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>방사선치료</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["예", "아니오"].map(v => (
                    <div key={v} onClick={() => set("radiation", v)} style={{ flex: 1, textAlign: "center", padding: "12px", border: `1px solid ${data.radiation === v ? D.teal : D.border}`, borderRadius: 10, cursor: "pointer", background: data.radiation === v ? `${D.teal}18` : "transparent", color: data.radiation === v ? D.teal : D.textDim, fontWeight: data.radiation === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>기왕력 (해당 항목 선택)</label>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
                  {["고혈압", "당뇨", "B형간염", "고지혈증", "갑상선질환", "알러지"].map(c => (
                    <div key={c} onClick={() => toggleCondition(c)} style={{ padding: "10px 12px", border: `1px solid ${data.conditions.includes(c) ? D.purple : D.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer", background: data.conditions.includes(c) ? `${D.purple}18` : "transparent", color: data.conditions.includes(c) ? D.purple : D.textDim, fontWeight: data.conditions.includes(c) ? 600 : 400, transition: "all 0.15s", textAlign: "center" }}>
                      {data.conditions.includes(c) ? "✓ " : ""}{c}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${D.border}`, background: "transparent", color: D.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(4)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다음 단계 →</button>
              </div>
            </div>
          )}

          {/* STEP 5: 생활습관 & 파일 업로드 */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: D.text }}>생활습관 및 파일 업로드</h3>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
                {[["식습관", "diet"], ["배변", "bowel"], ["수면", "sleep"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 6 }}>
                      {["불량", "보통", "양호"].map(v => (
                        <div key={v} onClick={() => set(key, v)} style={{ flex: isMobile ? 1 : undefined, padding: "12px", border: `1px solid ${data[key] === v ? D.teal : D.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer", background: data[key] === v ? `${D.teal}18` : "transparent", color: data[key] === v ? D.teal : D.textDim, textAlign: "center", transition: "all 0.15s" }}>{v}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={labelStyle}>운동 빈도</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["안함", "주 1-2회", "주 3-4회", "주 5회 이상"].map(v => (
                    <div key={v} onClick={() => set("exercise", v)} style={{ flex: 1, textAlign: "center", padding: "10px 6px", border: `1px solid ${data.exercise === v ? D.teal : D.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer", background: data.exercise === v ? `${D.teal}18` : "transparent", color: data.exercise === v ? D.teal : D.textDim, fontWeight: data.exercise === v ? 600 : 400, transition: "all 0.15s" }}>{v}</div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>진료기록 업로드</label>
                <div style={{ border: `2px dashed ${D.border}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", background: D.surfaceHigh }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
                  <div style={{ fontSize: 14, color: D.textDim, marginBottom: 8 }}>파일을 여기에 드래그하거나 클릭하여 업로드</div>
                  <div style={{ fontSize: 12, color: D.textMuted, marginBottom: 16 }}>CT/MRI, 혈액검사, 조직검사 결과 등 (PDF, JPG, PNG)</div>
                  <button style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${D.border}`, background: D.surface, fontSize: 13, color: D.textDim, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>파일 선택</button>
                </div>
              </div>

              <div style={{ padding: "14px 18px", background: `${D.teal}12`, border: `1px solid ${D.teal}33`, borderRadius: 10, fontSize: 13, color: D.teal, lineHeight: 1.7 }}>
                💡 제출된 자료는 상담사가 확인 후 AI 보조 분석에 활용됩니다. 본 시스템은 진료 또는 처방이 아닙니다.
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1px solid ${D.border}`, background: "transparent", color: D.textDim, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← 이전</button>
                <button onClick={() => setStep(5)} style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: D.teal, color: "#0A0F1A", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>접수 완료 →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PATIENT DASHBOARD ─────────────────────────────────────────── */
function PatientDashboard({ onLogout }) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("status");
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday

  const patientInfo = { name: "김민준", cancer: "폐암 3기", hospital: "아미랑의원 강남점", registerDate: "2026.03.02" };

  const progressSteps = [
    { label: "접수", status: "done" },
    { label: "상담", status: "done" },
    { label: "검사분석", status: "done" },
    { label: "원장검토", status: "current" },
    { label: "치료시작", status: "pending" },
  ];

  const timeline = [
    { date: "2026.03.02", event: "온라인 접수 완료", icon: "📝" },
    { date: "2026.03.03", event: "상담사 배정 - 박미영", icon: "👤" },
    { date: "2026.03.04", event: "초기 상담 완료", icon: "💬" },
    { date: "2026.03.05", event: "검사 분석 완료", icon: "📋" },
    { date: "2026.03.06", event: "원장 검토 진행중", icon: "🩺" },
  ];

  const documents = [
    { name: "CT결과_2026.03.pdf", date: "2026.03.02", status: "확인완료" },
    { name: "혈액검사_2026.03.pdf", date: "2026.03.02", status: "확인완료" },
    { name: "문진표.pdf", date: "2026.03.02", status: "확인완료" },
  ];

  const medications = [
    { name: "마그밀", dosage: "500mg", frequency: "1일 3회 식후", caution: "충분한 물과 함께 복용" },
    { name: "둘락칸", dosage: "15ml", frequency: "1일 1회 취침 전", caution: "복용 후 충분한 수분 섭취" },
    { name: "맥페란", dosage: "5mg", frequency: "1일 3회 식전 30분", caution: "졸음 유발 가능, 운전 주의" },
    { name: "이멘드", dosage: "125mg", frequency: "항암 당일 1회", caution: "항암치료 1시간 전 복용" },
  ];

  const programTiers = {
    BASIC: [
      { name: "고농도 비타민C", included: true },
      { name: "티옥트산", included: true },
      { name: "글루타치온", included: true },
    ],
    PREMIUM: [
      { name: "싸이모신알파1", included: true },
      { name: "태반추출물", included: false },
    ],
    "ADD-ON": [
      { name: "글루타민", included: true },
      { name: "지질수액", included: false },
      { name: "마이어스칵테일", included: false },
    ],
  };

  const postCareNotes = [
    { icon: "💧", title: "수분 섭취", desc: "시술 후 2시간 동안 물 500ml 이상 섭취" },
    { icon: "🚗", title: "운전 주의", desc: "시술 당일 장거리 운전 자제" },
    { icon: "🛁", title: "샤워", desc: "시술 부위 6시간 후 샤워 가능" },
    { icon: "📞", title: "이상 증상", desc: "두통, 발열 시 즉시 연락" },
  ];

  const testResults = [
    { name: "G6PD 검사", value: "정상", date: "2026.03.03" },
    { name: "활성산소 검사", value: "82 μmol/L", date: "2026.03.03" },
    { name: "비타민C 농도", value: "0.8 mg/dL", date: "2026.03.03" },
  ];

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
  const mealPlans = [
    { breakfast: ["현미밥", "바지락미역국", "조기찜", "숙주나물", "양배추샐러드"], lunch: ["현미밥", "비지찌개", "주꾸미볶음", "봄동겉절이", "과일"], dinner: ["현미밥", "고추장찌개", "닭살구이", "브로콜리무침", "샐러드"] },
    { breakfast: ["잡곡밥", "북어국", "연어구이", "시금치나물", "두부조림"], lunch: ["현미밥", "된장찌개", "불고기", "콩나물무침", "김치"], dinner: ["현미밥", "청국장", "고등어조림", "도라지무침", "과일"] },
    { breakfast: ["현미밥", "소고기무국", "계란찜", "미나리무침", "깍두기"], lunch: ["잡곡밥", "순두부찌개", "닭볶음탕", "오이무침", "샐러드"], dinner: ["현미밥", "콩나물국", "제육볶음", "취나물", "과일"] },
    { breakfast: ["현미밥", "시래기국", "갈치조림", "호박나물", "배추김치"], lunch: ["잡곡밥", "김치찌개", "떡갈비", "무생채", "샐러드"], dinner: ["현미밥", "미역국", "삼치구이", "고사리나물", "과일"] },
    { breakfast: ["잡곡밥", "황태국", "두부구이", "비타민나물", "깍두기"], lunch: ["현미밥", "부대찌개", "소불고기", "도토리묵", "과일"], dinner: ["현미밥", "어묵국", "코다리조림", "청경채볶음", "샐러드"] },
    { breakfast: ["현미밥", "북어국", "연두부", "부추무침", "김치"], lunch: ["비빔밥", "맑은국", "과일"], dinner: ["현미밥", "매운탕", "닭가슴살샐러드", "과일"] },
    { breakfast: ["잡곡밥", "소고기미역국", "계란말이", "나물모둠", "깍두기"], lunch: ["현미밥", "감자탕", "잡채", "샐러드"], dinner: ["현미밥", "된장국", "생선구이", "과일모둠"] },
  ];

  const appointments = [
    { date: "2026.03.18", time: "10:00", type: "면역강화 프로그램", session: "1/24", status: "예정" },
    { date: "2026.03.21", time: "10:00", type: "면역강화 프로그램", session: "2/24", status: "예정" },
    { date: "2026.03.25", time: "10:00", type: "면역강화 프로그램", session: "3/24", status: "예정" },
  ];

  const tabStyle = (active) => ({
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: active ? 700 : 400,
    color: active ? D.teal : D.textMuted,
    background: active ? `${D.teal}15` : "transparent",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  });

  return (
    <div style={{ minHeight: "100vh", background: D.bg, fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap'); * { box-sizing:border-box; } ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:${D.border};border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ background: D.surface, borderBottom: `1px solid ${D.border}`, padding: isMobile ? "0 16px" : "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: D.teal }}>아미랑</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: D.text }}>의원</span>
          </div>
          {!isMobile && <><div style={{ width: 1, height: 16, background: D.border }} /><span style={{ fontSize: 13, color: D.textMuted }}>환자 포털</span></>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: D.text, fontWeight: 600 }}>{patientInfo.name}님</span>
          <button onClick={onLogout} style={{ padding: isMobile ? "8px 16px" : "6px 14px", borderRadius: 8, border: `1px solid ${D.border}`, background: "transparent", color: D.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>로그아웃</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        {/* Progress Tracker */}
        <DCard style={{ marginBottom: 24, padding: "24px 32px" }}>
          <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 20, letterSpacing: "0.05em" }}>진행 상태</div>
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: D.amber }}>
                {progressSteps.filter(s => s.status === "done").length + 1}/{progressSteps.length} 단계
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.amber }}>
                  {progressSteps.find(s => s.status === "current")?.label} 진행중
                </div>
                <div style={{ fontSize: 11, color: D.textMuted, marginTop: 2 }}>
                  완료: {progressSteps.filter(s => s.status === "done").map(s => s.label).join(" · ")}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {progressSteps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: s.status === "done" ? D.teal : s.status === "current" ? D.amber : D.surfaceHigh,
                      border: s.status === "current" ? `2px solid ${D.amber}` : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: s.status === "done" ? "#0A0F1A" : s.status === "current" ? D.amber : D.textMuted,
                    }}>
                      {s.status === "done" ? "✓" : s.status === "current" ? "◐" : "○"}
                    </div>
                    <div style={{ fontSize: 11, color: s.status === "done" ? D.teal : s.status === "current" ? D.amber : D.textMuted, marginTop: 8, fontWeight: s.status === "current" ? 600 : 400 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: D.textMuted, marginTop: 2 }}>
                      {s.status === "done" ? "완료" : s.status === "current" ? "진행중" : "대기"}
                    </div>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div style={{ height: 2, flex: 1, background: s.status === "done" ? D.teal : D.border, marginBottom: 32, marginLeft: -8, marginRight: -8 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </DCard>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          {[
            ["status", "내 현황"],
            ["medication", "복약지도서"],
            ["program", "추천 프로그램"],
            ["meal", "식단표"],
            ["appointment", "예약"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>{label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "status" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <DCard>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>내 정보</div>
              {[
                ["진단명", patientInfo.cancer],
                ["담당병원", patientInfo.hospital],
                ["접수일", patientInfo.registerDate],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${D.border}`, fontSize: 13 }}>
                  <span style={{ color: D.textMuted }}>{k}</span>
                  <span style={{ color: D.text, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </DCard>

            <DCard>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>진행 타임라인</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ fontSize: 18 }}>{t.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, color: D.text, fontWeight: 500 }}>{t.event}</div>
                      <div style={{ fontSize: 11, color: D.textMuted }}>{t.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DCard>

            <DCard style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>제출 서류</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {documents.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: D.surfaceHigh, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>📄</span>
                      <div>
                        <div style={{ fontSize: 13, color: D.text, fontWeight: 500 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: D.textMuted }}>{d.date}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "4px 10px", background: `${D.teal}22`, color: D.teal, borderRadius: 20, fontWeight: 600 }}>{d.status}</span>
                  </div>
                ))}
              </div>
            </DCard>
          </div>
        )}

        {tab === "medication" && (
          <div>
            <DCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, letterSpacing: "0.05em" }}>복약지도서</div>
                  <div style={{ fontSize: 11, color: D.textMuted, marginTop: 4 }}>처방일: 2026.03.06 | 담당의: 이재원</div>
                </div>
                <DBtn variant="ghost" size="sm">PDF 다운로드</DBtn>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {medications.map((m, i) => (
                  <div key={i} style={{ padding: "16px", background: D.surfaceHigh, borderRadius: 10, border: `1px solid ${D.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: D.teal, marginBottom: 8 }}>{m.name}</div>
                    <div style={{ fontSize: 13, color: D.text, marginBottom: 4 }}>{m.dosage}</div>
                    <div style={{ fontSize: 12, color: D.textDim, marginBottom: 8 }}>{m.frequency}</div>
                    <div style={{ fontSize: 11, color: D.amber, background: `${D.amber}15`, padding: "6px 10px", borderRadius: 6 }}>⚠ {m.caution}</div>
                  </div>
                ))}
              </div>
            </DCard>

            <DCard style={{ background: `${D.amber}0A`, borderColor: `${D.amber}33` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: D.amber, marginBottom: 12 }}>일반적 주의사항</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: D.textDim, lineHeight: 1.8 }}>
                <li>처방된 약은 정해진 시간에 규칙적으로 복용하세요.</li>
                <li>증상이 호전되어도 임의로 복용을 중단하지 마세요.</li>
                <li>다른 약물이나 건강식품 복용 시 반드시 상담하세요.</li>
                <li>이상 반응 발생 시 즉시 병원에 연락하세요.</li>
              </ul>
            </DCard>
          </div>
        )}

        {tab === "program" && (
          <div>
            <DCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 24 }}>💉</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: D.text }}>항산화 네트워크 주사 프로그램</div>
                  <div style={{ fontSize: 12, color: D.textMuted }}>면역 기능 강화를 위한 맞춤 프로그램</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(programTiers).map(([tier, items]) => (
                  <div key={tier}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tier === "BASIC" ? D.teal : tier === "PREMIUM" ? D.purple : D.amber, marginBottom: 10 }}>{tier}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {items.map((item, i) => (
                        <div key={i} style={{
                          padding: "8px 14px",
                          background: item.included ? `${D.teal}15` : D.surfaceHigh,
                          border: `1px solid ${item.included ? D.teal : D.border}`,
                          borderRadius: 20,
                          fontSize: 12,
                          color: item.included ? D.teal : D.textMuted,
                          fontWeight: item.included ? 600 : 400,
                        }}>
                          {item.included ? "✓ " : "— "}{item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DCard>

            <DCard style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>치료 후 주의사항</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {postCareNotes.map((n, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: D.surfaceHigh, borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 20 }}>{n.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: D.text, marginBottom: 4 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: D.textMuted }}>{n.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </DCard>

            <DCard>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>검사 정보</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {testResults.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < testResults.length - 1 ? `1px solid ${D.border}` : "none" }}>
                    <span style={{ fontSize: 13, color: D.textDim }}>{t.name}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, color: D.teal, fontWeight: 600 }}>{t.value}</span>
                      <span style={{ fontSize: 11, color: D.textMuted, marginLeft: 8 }}>{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DCard>
          </div>
        )}

        {tab === "meal" && (
          <div>
            <DCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, letterSpacing: "0.05em" }}>주간 식단표</div>
                  <span style={{ fontSize: 10, padding: "3px 10px", background: `${D.teal}22`, color: D.teal, borderRadius: 20, fontWeight: 600 }}>맞춤 식단</span>
                </div>
                <DBtn variant="ghost" size="sm">PDF 다운로드</DBtn>
              </div>

              {/* Week Calendar */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    style={{
                      textAlign: "center",
                      padding: "12px 8px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: selectedDay === i ? D.teal : D.surfaceHigh,
                      color: selectedDay === i ? "#0A0F1A" : D.textDim,
                      fontWeight: selectedDay === i ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 12 }}>{day}</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>{3 + i}</div>
                  </div>
                ))}
              </div>

              {/* Meal Plan */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["조식", "breakfast", "🌅"],
                  ["중식", "lunch", "☀️"],
                  ["석식", "dinner", "🌙"],
                ].map(([label, key, icon]) => (
                  <div key={key} style={{ padding: "16px 18px", background: D.surfaceHigh, borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: D.text }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {mealPlans[selectedDay][key].map((item, i) => (
                        <span key={i} style={{ padding: "6px 12px", background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, fontSize: 12, color: D.textDim }}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DCard>
          </div>
        )}

        {tab === "appointment" && (
          <div>
            {/* Next Appointment */}
            <DCard style={{ marginBottom: 16, background: `${D.purple}0A`, borderColor: `${D.purple}44` }}>
              <div style={{ fontSize: 12, color: D.purple, fontWeight: 700, marginBottom: 12, letterSpacing: "0.05em" }}>다음 예약</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: D.text }}>{appointments[0].date} {appointments[0].time}</div>
                  <div style={{ fontSize: 13, color: D.textDim, marginTop: 4 }}>{appointments[0].type} · 세션 {appointments[0].session}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, padding: "4px 12px", background: `${D.purple}22`, color: D.purple, borderRadius: 20, fontWeight: 600 }}>{appointments[0].status}</span>
                </div>
              </div>
            </DCard>

            {/* Appointment List */}
            <DCard style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>예약 내역</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {appointments.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: D.surfaceHigh, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: D.purple }}>{a.time}</div>
                        <div style={{ fontSize: 10, color: D.textMuted }}>{a.date}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: D.text, fontWeight: 500 }}>{a.type}</div>
                        <div style={{ fontSize: 11, color: D.textMuted }}>세션 {a.session}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "4px 10px", background: `${D.teal}22`, color: D.teal, borderRadius: 20, fontWeight: 600 }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </DCard>

            {/* New Appointment Request */}
            <DCard>
              <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 16, letterSpacing: "0.05em" }}>새 예약 요청</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: D.textDim, display: "block", marginBottom: 6 }}>예약 유형</label>
                  <select style={{ width: "100%", padding: "10px 14px", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, color: D.text, fontSize: 13, fontFamily: "inherit" }}>
                    <option>면역강화 프로그램</option>
                    <option>고용량 비타민C</option>
                    <option>상담 예약</option>
                    <option>검사 예약</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: D.textDim, display: "block", marginBottom: 6 }}>희망 날짜</label>
                  <input type="text" placeholder="2026.03.28" style={{ width: "100%", padding: "10px 14px", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, color: D.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: D.textDim, display: "block", marginBottom: 6 }}>희망 시간</label>
                  <select style={{ width: "100%", padding: "10px 14px", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, color: D.text, fontSize: 13, fontFamily: "inherit" }}>
                    <option>오전 (09:00-12:00)</option>
                    <option>오후 (13:00-17:00)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: D.textDim, display: "block", marginBottom: 6 }}>메모</label>
                  <input type="text" placeholder="요청사항" style={{ width: "100%", padding: "10px 14px", background: D.surfaceHigh, border: `1px solid ${D.border}`, borderRadius: 8, color: D.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              </div>
              <DBtn style={{ width: "100%" }}>예약 요청하기</DBtn>
              <div style={{ fontSize: 11, color: D.textMuted, textAlign: "center", marginTop: 12 }}>예약 요청 후 병원에서 확정 연락드립니다.</div>
            </DCard>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MOBILE HOOK ───────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ─── DEMO START ─────────────────────────────────────────────────── */
function DemoStart({ onLogin, onApply }) {
  const [hovProblem, setHovProblem] = useState(null);
  const [hovStep, setHovStep] = useState(null);
  const [hovRole, setHovRole] = useState(null);

  const problems = [
    { icon: "🔒", title: "전문의 의존성", desc: "암 진료는 전문의만 가능 — 브랜치 확장의 가장 큰 병목" },
    { icon: "👥", title: "과다한 인력 필요", desc: "상담, 진료, 치료, 관리까지 — 브랜치당 필요 인력이 너무 많음" },
    { icon: "📋", title: "전문의 업무 과중", desc: "암 환자 특성상 상담·케어가 복잡하고 시간 소모가 큼" },
  ];

  const workflowSteps = [
    { icon: "👤", title: "환자 접수", desc: "온라인 문진표 작성\n진료기록 업로드" },
    { icon: "💬", title: "영업 상담", desc: "1차 상담 진행\nCRM 기록, AI 분석 요청" },
    { icon: "🤖", title: "AI 분석", desc: "진료기록 + 의료지식 종합\n치료 프로그램 제안" },
    { icon: "🩺", title: "원장 컨펌", desc: "AI 리포트 검토\n프로그램 선택, 최종 승인" },
    { icon: "💉", title: "간호 치료", desc: "스케줄 관리\n세션 기록, 특이사항 보고" },
  ];

  const roles = [
    {
      id: "patient", icon: "👤", label: "환자", color: D.green, isApply: true,
      features: ["온라인 접수 신청", "문진표 작성", "진료기록 업로드", "진행 현황 확인"],
      btnLabel: "체험하기 →",
    },
    {
      id: "sales", icon: "💬", label: "영업 담당", color: D.amber,
      features: ["신규 환자 접수 확인", "상담 내용 CRM 기록", "진료기록 파일 관리", "AI 분석 요청"],
      btnLabel: "체험하기 →",
    },
    {
      id: "director", icon: "🩺", label: "원장", color: D.teal,
      features: ["AI 분석 리포트 검토", "유사 케이스 & 참조 근거 확인", "치료 프로그램 선택", "최종 컨펌 & 간호팀 전달"],
      btnLabel: "체험하기 →",
    },
    {
      id: "nurse", icon: "💉", label: "간호사", color: D.purple,
      features: ["원장 지시사항 확인", "치료 스케줄 관리", "세션 완료 기록", "특이사항 보고"],
      btnLabel: "체험하기 →",
    },
  ];

  const sec = {
    maxWidth: 960,
    margin: "0 auto",
    padding: "80px 40px",
  };

  return (
    <div style={{ minHeight: "100vh", background: D.bg, fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif", overflow: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── 섹션 1: Hero ── */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 400, height: 400, background: `radial-gradient(circle, ${D.teal}12 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 350, height: 350, background: `radial-gradient(circle, ${D.purple}12 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: `${D.teal}15`, border: `1px solid ${D.teal}33`, borderRadius: 20, marginBottom: 32, animation: "fadeInUp 0.6s ease both" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: D.teal, animation: "pulse 2s infinite", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: D.teal, fontWeight: 600, letterSpacing: "0.06em" }}>DEMO VERSION</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 60px)",
          fontWeight: 900,
          marginBottom: 20,
          background: `linear-gradient(135deg, ${D.text} 0%, ${D.teal} 55%, ${D.purple} 100%)`,
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "gradient 6s ease infinite, fadeInUp 0.7s 0.1s ease both",
          lineHeight: 1.15,
        }}>
          아미랑의원 AI 솔루션
        </h1>

        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: D.textDim, maxWidth: 560, lineHeight: 1.7, marginBottom: 12, animation: "fadeInUp 0.7s 0.2s ease both" }}>
          효율적인 프랜차이즈 확산을 위한 <strong style={{ color: D.teal }}>AI 시스템</strong>
        </p>
        <p style={{ fontSize: 15, color: D.textMuted, maxWidth: 480, lineHeight: 1.7, marginBottom: 52, animation: "fadeInUp 0.7s 0.3s ease both" }}>
          암 전문의가 아니더라도, 안정적인 병원 운영이 가능하도록
        </p>

        <a
          href="#problems"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 36px",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${D.teal}, ${D.tealDim})`,
            color: "#0A0F1A",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 6px 28px ${D.teal}40`,
            transition: "transform 0.2s, box-shadow 0.2s",
            animation: "fadeInUp 0.7s 0.4s ease both",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 36px ${D.teal}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 6px 28px ${D.teal}40`; }}
        >
          솔루션 살펴보기 ↓
        </a>
      </div>

      {/* ── 섹션 2: 어려움 ── */}
      <div id="problems" style={{ ...sec, borderTop: `1px solid ${D.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: `${D.red}15`, border: `1px solid ${D.red}33`, borderRadius: 20, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: D.red, fontWeight: 600, letterSpacing: "0.05em" }}>CHALLENGE</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: D.text, marginBottom: 12 }}>
            암 병원 프랜차이즈의 현실적 어려움
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 48 }}>
          {problems.map((p, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovProblem(i)}
              onMouseLeave={() => setHovProblem(null)}
              style={{
                padding: "32px 28px",
                background: hovProblem === i ? D.surfaceHigh : D.surface,
                border: `1px solid ${hovProblem === i ? D.red + "55" : D.border}`,
                borderRadius: 16,
                transition: "all 0.25s",
                transform: hovProblem === i ? "translateY(-4px)" : "none",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: D.text, marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: D.textMuted, lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          padding: "28px 32px",
          background: `linear-gradient(135deg, ${D.teal}0A, ${D.teal}18)`,
          border: `1px solid ${D.teal}33`,
          borderRadius: 16,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 15, color: D.textDim, lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: D.teal }}>AI 에이전트 시스템</strong>이 반복 업무를 자동화하고, 전문의의 판단력을 시스템으로 확산시켜{" "}
            <strong style={{ color: D.teal }}>적은 인력으로도 안정적인 브랜치 운영</strong>을 가능하게 합니다.
          </p>
        </div>
      </div>

      {/* ── 섹션 3: 워크플로우 ── */}
      <div style={{ ...sec, borderTop: `1px solid ${D.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: `${D.blue}15`, border: `1px solid ${D.blue}33`, borderRadius: 20, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: D.blue, fontWeight: 600, letterSpacing: "0.05em" }}>WORKFLOW</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: D.text, marginBottom: 12 }}>
            전체 워크플로우
          </h2>
          <p style={{ fontSize: 14, color: D.textMuted }}>환자 첫 접촉부터 치료 완료까지 하나의 흐름으로</p>
        </div>

        {/* Arrow flow */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 48, overflowX: "auto", paddingBottom: 4 }}>
          {workflowSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 160 }}>
              <div
                onMouseEnter={() => setHovStep(i)}
                onMouseLeave={() => setHovStep(null)}
                style={{
                  flex: 1,
                  padding: "24px 14px",
                  background: hovStep === i ? D.surfaceHigh : D.surface,
                  border: `1px solid ${hovStep === i ? D.teal + "55" : D.border}`,
                  borderRadius: 14,
                  textAlign: "center",
                  transition: "all 0.25s",
                  transform: hovStep === i ? "translateY(-4px)" : "none",
                  position: "relative",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{step.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: hovStep === i ? D.teal : D.text, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 11, color: D.textMuted, lineHeight: 1.6, whiteSpace: "pre-line" }}>{step.desc}</div>
              </div>
              {i < workflowSteps.length - 1 && (
                <div style={{ padding: "0 6px", color: D.textMuted, fontSize: 18, flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Learning AI highlight box */}
        <div style={{
          padding: "28px 32px",
          background: `linear-gradient(135deg, ${D.purple}0A, ${D.purple}18)`,
          border: `1px solid ${D.purple}44`,
          borderRadius: 16,
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>🧠</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: D.purple, marginBottom: 8 }}>학습하는 AI</div>
            <p style={{ fontSize: 14, color: D.textDim, lineHeight: 1.8, margin: 0 }}>
              원장이 수정하고 보완할수록, AI는 계속 똑똑해집니다. 전문의의 판단 노하우가 시스템에 축적되어,{" "}
              <strong style={{ color: D.purple }}>브랜치 전체의 진료 품질이 함께 높아집니다.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── 섹션 4: 역할별 기능 ── */}
      <div style={{ ...sec, borderTop: `1px solid ${D.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: `${D.teal}15`, border: `1px solid ${D.teal}33`, borderRadius: 20, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: D.teal, fontWeight: 600, letterSpacing: "0.05em" }}>DEMO</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: D.text, marginBottom: 12 }}>
            역할별 기능 체험
          </h2>
          <p style={{ fontSize: 14, color: D.textMuted }}>각 역할의 데모 화면을 직접 체험해보세요</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {roles.map((r) => (
            <div
              key={r.id}
              onMouseEnter={() => setHovRole(r.id)}
              onMouseLeave={() => setHovRole(null)}
              style={{
                padding: "32px 28px",
                background: hovRole === r.id ? D.surfaceHigh : D.surface,
                border: `1px solid ${hovRole === r.id ? r.color + "66" : D.border}`,
                borderRadius: 18,
                transition: "all 0.25s",
                transform: hovRole === r.id ? "translateY(-4px)" : "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{r.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: r.color, marginBottom: 20 }}>{r.label}</div>
              <ul style={{ margin: "0 0 28px 0", padding: "0 0 0 18px", listStyle: "none" }}>
                {r.features.map((f, fi) => (
                  <li key={fi} style={{ fontSize: 13, color: D.textDim, lineHeight: 1.8, display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: r.color, marginTop: 2, flexShrink: 0 }}>·</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "auto" }}>
                <button
                  onClick={() => r.isApply ? onApply() : onLogin(r.id)}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: 10,
                    border: `1px solid ${r.color}55`,
                    background: hovRole === r.id ? `${r.color}22` : `${r.color}12`,
                    color: r.color,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    textAlign: "center",
                  }}
                >
                  {r.btnLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${D.border}`, padding: "32px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: D.textMuted }}>
          © 2025 아미랑의원 AI 솔루션 · Demo Version
        </div>
      </div>
    </div>
  );
}

/* ─── SALES DASHBOARD ───────────────────────────────────────────── */
function SalesDashboard() {
  const [patientList, setPatientList] = useState(patients);
  const [sel, setSel] = useState(patients[0]);
  const [tab, setTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([
    { time: "03.14 14:30", text: "초기 전화 상담 완료. 면역치료에 관심 많음. 내원 의향 있음.", type: "전화" },
    { time: "03.15 10:00", text: "진료기록 검토. CT결과 확인. AI 분석 요청 예정.", type: "메모" },
  ]);
  const [aiSent, setAiSent] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(n => [...n, { time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }), text: newNote, type: "메모" }]);
    setNewNote("");
  };

  // Change patient status
  const changeStatus = (patientId, newStatus) => {
    setPatientList(list => list.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
    if (sel?.id === patientId) {
      setSel(prev => ({ ...prev, status: newStatus }));
    }
    setNotes(n => [...n, { time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }), text: `상태 변경: ${statusCfg[newStatus]?.label || newStatus}`, type: "시스템" }]);
  };

  // Filter and sort patients
  const filteredPatients = patientList
    .filter(p => {
      if (searchTerm && !p.name.includes(searchTerm) && !p.phone.includes(searchTerm)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") return b.date.localeCompare(a.date);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 0, height: "calc(100vh - 56px)", overflow: "hidden" }}>
        {/* Patient List with Filters */}
        <div style={{ borderRight: `1px solid ${D.border}`, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Filters - Simple */}
          <div style={{ padding: "12px", borderBottom: `1px solid ${D.border}`, background: D.surfaceHigh }}>
            <input
              type="text"
              placeholder="이름 또는 연락처 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${D.border}`, background: D.surface, color: D.text, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${D.border}`, background: D.surface, color: D.text, fontSize: 12, outline: "none" }}
              >
                <option value="all">전체 상태</option>
                <option value="new">신규 접수</option>
                <option value="consulting">상담중</option>
                <option value="ai_pending">AI 대기</option>
                <option value="ai_done">분석 완료</option>
                <option value="confirmed">컨펌</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${D.border}`, background: D.surface, color: D.text, fontSize: 12, outline: "none" }}
              >
                <option value="date">최신순</option>
                <option value="name">이름순</option>
              </select>
            </div>
          </div>

          {/* Patient List */}
          <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, letterSpacing: "0.1em", marginBottom: 10, padding: "0 4px" }}>검색 결과 · {filteredPatients.length}명</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredPatients.map(p => (
                <div key={p.id} onClick={() => { setSel(p); setTab("info"); setAiSent(false); }} style={{ padding: "12px", borderRadius: 10, background: sel?.id === p.id ? D.surfaceHigh : "transparent", border: `1px solid ${sel?.id === p.id ? D.border : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${D.teal}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: D.teal }}>{p.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: D.text }}>{p.name} <span style={{ fontSize: 12, color: D.textMuted, fontWeight: 400 }}>{p.age}세</span></div>
                        <div style={{ fontSize: 11, color: D.textMuted }}>{p.cancer}</div>
                      </div>
                    </div>
                    <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} style={{ padding: "6px", borderRadius: 6, background: `${D.teal}22`, color: D.teal, fontSize: 14, textDecoration: "none" }} title="전화 걸기">📞</a>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <DTag status={p.status} />
                    <span style={{ fontSize: 11, color: D.textMuted }}>{p.date}</span>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: D.textMuted, fontSize: 13 }}>검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        </div>

        {/* Detail */}
        {sel && (
        <div style={{ overflow: "auto", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: D.text }}>{sel.name}</h2>
                <span style={{ fontSize: 14, color: D.textMuted }}>{sel.age}세 · {sel.cancer}</span>
              </div>
              <div style={{ fontSize: 13, color: D.textMuted }}>접수번호 {sel.id} · 연락처 {sel.phone} · {sel.branch}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={sel.status}
                onChange={e => changeStatus(sel.id, e.target.value)}
                style={{
                  padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, height: 38,
                  border: `1px solid ${statusCfg[sel.status]?.color || D.border}`,
                  background: statusCfg[sel.status]?.bg || D.surface,
                  color: statusCfg[sel.status]?.color || D.text,
                  outline: "none", cursor: "pointer"
                }}
              >
                <option value="new">신규 접수</option>
                <option value="consulting">상담 진행중</option>
                <option value="ai_pending">AI 분석 대기</option>
                <option value="ai_done">분석 완료</option>
                <option value="confirmed">원장 컨펌</option>
                <option value="in_treatment">치료 진행중</option>
              </select>
              {!aiSent ? (
                <DBtn onClick={() => { setAiSent(true); changeStatus(sel.id, "ai_pending"); }} style={{ height: 38 }}>AI 분석 요청</DBtn>
              ) : (
                <DBtn variant="teal" style={{ height: 38 }} disabled>✓ 분석 요청됨</DBtn>
              )}
            </div>
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
  const steps = ["환자 문진 데이터 파싱...", "과거 진료기록 벡터 임베딩 분석...", "RAG DB 유사 케이스 23건 검색...", "의학 문헌 17편 참조...", "프로그램 적합도 스코어링...", "원장 판단 로직 적용...", "최종 리포트 생성 완료 ✓"];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => { if (s >= steps.length - 1) { clearInterval(iv); setTimeout(onDone, 600); return s; } return s + 1; }), 650);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(${D.teal} ${step * 14}%, transparent 0)`, animation: "spin 1s linear infinite", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: D.teal }}>AI 에이전트 분석 중</div>
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
  const [sideTab, setSideTab] = useState("confirm"); // confirm | schedule

  const waiting = patients.filter(p => ["ai_done", "ai_pending"].includes(p.status));

  const toggleProg = (id) => setSelectedProgs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const selectPatient = (p) => { setSel(p); setPhase("idle"); setSelectedProgs([]); setNote(""); };

  // 이슈 데이터
  const issues = [
    { type: "urgent", text: "김민준 환자 컨펌 24시간 초과", time: "2시간 전" },
    { type: "info", text: "송미영 환자 영양상태 재평가 필요", time: "오늘" },
    { type: "warning", text: "내일 오전 예약 6건 (과밀)", time: "1시간 전" },
  ];

  // 월간 캘린더 데이터 (간단한 목업)
  const calendarData = {
    month: "2025년 3월",
    days: [
      { d: 17, count: 4 }, { d: 18, count: 6, today: true }, { d: 19, count: 3 }, { d: 20, count: 5 }, { d: 21, count: 4 },
      { d: 24, count: 7 }, { d: 25, count: 5 }, { d: 26, count: 4 }, { d: 27, count: 6 }, { d: 28, count: 3 },
    ]
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 56px)", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${D.border}`, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* 탭 */}
        <div style={{ display: "flex", borderBottom: `1px solid ${D.border}` }}>
          {[{ id: "confirm", label: "컨펌 대기" }, { id: "schedule", label: "오늘 일정" }, { id: "patients", label: "환자 목록" }].map(t => (
            <div key={t.id} onClick={() => setSideTab(t.id)} style={{ flex: 1, padding: "12px 8px", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: sideTab === t.id ? 700 : 400, color: sideTab === t.id ? D.teal : D.textMuted, borderBottom: `2px solid ${sideTab === t.id ? D.teal : "transparent"}`, transition: "all 0.15s" }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
          {sideTab === "confirm" && (
            <>
              {waiting.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: D.textMuted, fontSize: 13 }}>컨펌 대기 환자가 없습니다</div>
              ) : waiting.map(p => (
                <div key={p.id} onClick={() => selectPatient(p)} style={{ padding: "12px", borderRadius: 10, background: sel?.id === p.id ? D.surfaceHigh : "transparent", border: `1px solid ${sel?.id === p.id ? D.border : "transparent"}`, cursor: "pointer", marginBottom: 6, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: D.text }}>{p.name}</span>
                    <DTag status={p.status} />
                  </div>
                  <div style={{ fontSize: 12, color: D.textMuted }}>{p.age}세 · {p.cancer}</div>
                </div>
              ))}
            </>
          )}
          {sideTab === "schedule" && (
            <>
              {todaySchedule.map((s, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: s.status === "current" ? `${D.teal}15` : "transparent", border: `1px solid ${s.status === "current" ? D.teal : D.border}`, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: s.status === "done" ? D.textMuted : D.text }}>{s.time}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: s.status === "done" ? D.surfaceHigh : s.status === "current" ? D.teal : D.surfaceHigh, color: s.status === "done" ? D.textMuted : s.status === "current" ? D.bg : D.textDim, fontWeight: 600 }}>
                      {s.status === "done" ? "완료" : s.status === "current" ? "진행중" : "예정"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: s.status === "done" ? D.textMuted : D.text, fontWeight: 500 }}>{s.patient}</div>
                  <div style={{ fontSize: 11, color: D.textMuted }}>{s.type} · {s.room}</div>
                </div>
              ))}
            </>
          )}
          {sideTab === "patients" && (
            <>
              {patients.map(p => (
                <div key={p.id} onClick={() => selectPatient(p)} style={{ padding: "10px 12px", borderRadius: 8, background: sel?.id === p.id ? D.surfaceHigh : "transparent", border: `1px solid ${sel?.id === p.id ? D.border : "transparent"}`, cursor: "pointer", marginBottom: 6, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{p.name}</span>
                    <DTag status={p.status} />
                  </div>
                  <div style={{ fontSize: 11, color: D.textMuted }}>{p.age}세 · {p.cancer}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ overflow: "auto", padding: 20 }}>
        {!sel ? (
          <div>
            {/* 헤더 */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: D.text, marginBottom: 4 }}>오늘의 현황</h2>
              <div style={{ fontSize: 13, color: D.textMuted }}>2025년 3월 18일 화요일</div>
            </div>

            {/* 상단: 현황 숫자 + 이슈 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* 현황 숫자 */}
              <DCard style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted, marginBottom: 14 }}>오늘 현황</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "예약 환자", value: "6", color: D.teal },
                    { label: "치료 완료", value: "2", color: D.green },
                    { label: "컨펌 대기", value: waiting.length.toString(), color: D.amber },
                    { label: "신규 접수", value: "3", color: D.blue },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: D.surfaceHigh, borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: D.textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </DCard>

              {/* 이슈 */}
              <DCard style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted, marginBottom: 14 }}>주의 필요</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {issues.map((issue, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: issue.type === "urgent" ? `${D.red}12` : D.surfaceHigh, borderRadius: 6, border: `1px solid ${issue.type === "urgent" ? `${D.red}33` : D.border}` }}>
                      <span style={{ fontSize: 12 }}>{issue.type === "urgent" ? "🚨" : issue.type === "warning" ? "⚠️" : "ℹ️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: issue.type === "urgent" ? D.red : D.text }}>{issue.text}</div>
                        <div style={{ fontSize: 10, color: D.textMuted }}>{issue.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </DCard>
            </div>

            {/* 중단: 오늘 일정 */}
            <DCard style={{ marginBottom: 16, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted, marginBottom: 14 }}>오늘 일정</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {todaySchedule.map((s, i) => (
                  <div key={i} style={{ minWidth: 130, padding: "12px", borderRadius: 8, background: s.status === "current" ? `${D.teal}15` : D.surfaceHigh, border: `1px solid ${s.status === "current" ? D.teal : "transparent"}`, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: s.status === "current" ? D.teal : D.textMuted, fontWeight: 700, marginBottom: 4 }}>{s.time}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.status === "done" ? D.textMuted : D.text, marginBottom: 2 }}>{s.patient}</div>
                    <div style={{ fontSize: 10, color: D.textMuted }}>{s.type}</div>
                  </div>
                ))}
              </div>
            </DCard>

            {/* 하단: 월간 캘린더 */}
            <DCard style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: D.textMuted }}>월간 일정</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button style={{ background: "none", border: "none", color: D.textMuted, cursor: "pointer", fontSize: 14 }}>◀</button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{calendarData.month}</span>
                  <button style={{ background: "none", border: "none", color: D.textMuted, cursor: "pointer", fontSize: 14 }}>▶</button>
                </div>
              </div>
              {/* 요일 헤더 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
                {["월", "화", "수", "목", "금"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, color: D.textMuted, padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              {/* 날짜 그리드 (2주치) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {calendarData.days.map((day, i) => (
                  <div key={i} style={{ padding: "10px 6px", borderRadius: 8, background: day.today ? `${D.teal}18` : D.surfaceHigh, border: `1px solid ${day.today ? D.teal : "transparent"}`, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 14, fontWeight: day.today ? 700 : 500, color: day.today ? D.teal : D.text, marginBottom: 4 }}>{day.d}</div>
                    <div style={{ fontSize: 10, color: day.count > 5 ? D.amber : D.textMuted }}>{day.count}건</div>
                  </div>
                ))}
              </div>
            </DCard>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setSel(null)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${D.border}`, background: D.surface, color: D.textDim, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="대시보드로 돌아가기">←</button>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: D.text }}>{sel.name}</h2>
                    <span style={{ color: D.textMuted, fontSize: 14 }}>{sel.age}세 · {sel.cancer}</span>
                    <DTag status={sel.status} />
                  </div>
                  <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{sel.id} · {sel.branch}</div>
                </div>
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
                  <div style={{ fontSize: 11, color: D.teal, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>AI 분석 요약</div>
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
                    <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700 }}>치료 프로그램 선택 <span style={{ color: D.amber }}>*원장 직접 선택</span></div>
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
                  <div style={{ fontSize: 12, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>원장 지시사항</div>
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
            <div style={{ fontSize: 12, color: D.textMuted, marginBottom: 20 }}>이재원 원장 컨펌 · {selSchedule.date} {selSchedule.time}</div>

            <DCard style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>처방 프로그램</div>
              <div style={{ padding: "14px", background: `${D.purple}11`, border: `1px solid ${D.purple}33`, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: D.text, marginBottom: 4 }}>{selSchedule.program}</div>
                <div style={{ fontSize: 12, color: D.textMuted }}>세션 진행: <strong style={{ color: D.purple }}>{selSchedule.session}</strong></div>
              </div>
            </DCard>

            <DCard style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 700, marginBottom: 10 }}>원장 지시사항</div>
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
  director: { label: "원장", color: D.teal, sub: "AI 분석 · 컨펌" },
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
          <span style={{ fontSize: 16, fontWeight: 900, color: D.teal }}>아미랑</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: D.text }}>의원</span>
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
  const [view, setView] = useState("demo"); // demo | apply | dashboard | patient-dashboard
  const [role, setRole] = useState(null);

  if (view === "apply") return <PatientForm onBack={() => setView("demo")} onDashboard={() => setView("patient-dashboard")} />;
  if (view === "patient-dashboard") return <PatientDashboard onLogout={() => setView("demo")} />;
  if (view === "dashboard") return <Dashboard role={role} onLogout={() => { setRole(null); setView("demo"); }} />;
  return <DemoStart onApply={() => setView("apply")} onLogin={r => { setRole(r); setView("dashboard"); }} />;
}
