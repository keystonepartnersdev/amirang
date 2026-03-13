# ONCO NEXUS — 프로젝트 개요 및 아키텍처

> **Claude Code를 위한 핸드오프 문서**  
> 이 문서는 ONCO NEXUS B2B SaaS 프로젝트의 전체 맥락, 도메인 로직, 기술 아키텍처를 담고 있다.  
> 새로운 개발 세션에서 이 문서를 먼저 읽고 작업을 이어가라.

---

## 1. 프로젝트 개요

### 1.1 무엇을 만드는가

**ONCO NEXUS**는 암 전문 병원 프랜차이즈를 위한 B2B SaaS 플랫폼이다.

핵심 목적은 다음 두 가지다:

1. **암 전문의(본점 원장님)의 지식을 시스템화**해서, 일반의(브랜치 원장님)도 전문의 수준의 치료 판단을 내릴 수 있게 지원한다.
2. **환자 접수 → 영업 상담 → AI 분석 → 원장님 컨펌 → 간호 치료**의 전체 플로우를 디지털화한다.

### 1.2 비즈니스 구조

```
본사 (강남 본점)
├── 본점 원장님 (종양 전문의) — AI 컨펌 최종 권한
├── 영업팀
└── 간호팀

브랜치 (최대 10개 목표)
├── 브랜치 원장님 (일반의 가능) — 1차 판단, 불확실 시 본점에 에스컬레이션
├── 영업담당 (브랜치별 1명 이상)
└── 간호팀
```

### 1.3 중요한 법적 맥락

> ⚠️ 이 시스템은 **진료 또는 처방 시스템이 아니다.**
> AI 에이전트는 의사(원장님)의 판단을 **보조**하는 역할만 한다.
> 모든 최종 결정은 반드시 원장님이 확인하고 컨펌해야 한다.
> UI 어디에서도 AI가 직접 환자에게 처방하거나 진단하는 것처럼 표현하면 안 된다.

---

## 2. 사용자 역할 (Roles)

| Role | 설명 | 주요 기능 |
|------|------|-----------|
| `patient` | 암 환자 | 온라인 접수, 문진표 작성, 진료기록 업로드, 진행 현황 확인 |
| `sales` | 영업 담당 (브랜치별) | 1차 상담 CRM — 환자 파일 관리, 상담 기록, AI 분석 요청 |
| `director` | 원장님 (본점 또는 브랜치) | AI 리포트 검토, 프로그램 선택, 최종 컨펌, 간호팀 지시 |
| `nurse` | 간호사 (브랜치별) | 치료 스케줄 확인, 세션 완료 기록, 특이사항 입력 |
| `admin` | 본사 관리자 | 브랜치 관리, 치료 프로그램 배포, RAG/AI 설정, 전체 통계 |

### 2.1 브랜치 원장님 에스컬레이션 로직

```
브랜치 원장님이 AI 리포트를 보고 판단:
  ├── 확신 있음 → 직접 컨펌
  └── 불확실함 → 본점 원장님에게 에스컬레이션 요청
                  → 본점 원장님 컨펌 → 브랜치로 결과 내려옴
```

---

## 3. 핵심 워크플로우

### 3.1 전체 플로우

```
[환자]
  │ 랜딩페이지에서 온라인 접수
  │ 문진표 작성 + 진료기록 업로드 (PDF/JPG/PNG)
  ▼
[영업담당]
  │ 접수된 환자 확인
  │ 1차 전화/내원/온라인 상담 진행
  │ 상담 내용 CRM에 기록
  │ 파일 추가 업로드 가능
  │ AI 분석 요청 버튼 클릭
  ▼
[AI 에이전트 — RAG 시스템]
  │ 문진 데이터 파싱
  │ 환자 진료기록 분석
  │ RAG DB에서 유사 케이스 검색 (자체 케이스 + 공개 의학 문헌)
  │ 원장님 판단 로직 적용
  │ 추천 프로그램 스코어링
  │ 원장님용 리포트 생성
  ▼
[원장님]
  │ AI 리포트 검토
  │ 신뢰도 스코어 + 참조 근거 확인
  │ 치료 프로그램 직접 선택 (AI 추천 참고)
  │ 원장님 지시사항 입력
  │ 최종 컨펌
  ▼
[간호사]
  │ 원장님 지시서 확인
  │ 세션 스케줄 관리
  │ 치료 완료 후 기록 (완료/특이사항/중단)
  ▼
[환자]
  치료 진행 및 현황 확인
```

### 3.2 환자 상태 (Status)

```typescript
type PatientStatus =
  | 'new'          // 온라인 접수 완료, 영업 배정 전
  | 'consulting'   // 영업 담당 상담 진행중
  | 'ai_pending'   // AI 분석 요청됨, 대기중
  | 'ai_done'      // AI 분석 완료, 원장님 검토 대기
  | 'confirmed'    // 원장님 컨펌 완료, 간호팀 전달됨
  | 'in_treatment' // 치료 진행중
  | 'completed'    // 치료 완료
  | 'on_hold'      // 보류
```

---

## 4. 기술 아키텍처

### 4.1 권장 기술 스택

#### 프론트엔드
```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS
UI Components: shadcn/ui
State:         Zustand (전역), React Query (서버 상태)
Forms:         React Hook Form + Zod
File Upload:   react-dropzone
```

#### 백엔드
```
Runtime:       Node.js
Framework:     Next.js API Routes 또는 별도 Express/Fastify 서버
Language:      TypeScript
ORM:           Prisma
Database:      PostgreSQL (메인), Redis (캐시/세션)
Auth:          NextAuth.js (JWT + Role-based)
File Storage:  AWS S3 또는 Cloudflare R2
```

#### AI / RAG 시스템
```
Orchestration: LangChain (Python) 또는 LangChain.js
LLM:           Claude claude-sonnet-4-20250514 (Anthropic API)
Embedding:     text-embedding-3-large (OpenAI) 또는 Claude Embeddings
Vector DB:     pgvector (PostgreSQL 확장) 또는 Pinecone
Document Parse: LlamaParse 또는 pypdf (PDF 파싱)
```

#### 인프라
```
Hosting:       Vercel (프론트) + Railway/Render (백엔드)
또는:          AWS EC2 + RDS + S3 (풀 컨트롤 원할 경우)
CI/CD:         GitHub Actions
모니터링:      Sentry (에러), Vercel Analytics
```

### 4.2 디렉토리 구조 (권장)

```
onco-nexus/
├── apps/
│   ├── web/                    # Next.js 프론트엔드
│   │   ├── app/
│   │   │   ├── (public)/       # 랜딩페이지, 환자 접수 (비인증)
│   │   │   │   ├── page.tsx    # 랜딩
│   │   │   │   └── apply/
│   │   │   │       └── page.tsx # 환자 접수 폼
│   │   │   ├── (auth)/         # 로그인
│   │   │   │   └── login/
│   │   │   └── dashboard/      # 인증 필요
│   │   │       ├── layout.tsx  # 역할별 레이아웃 분기
│   │   │       ├── sales/      # 영업 담당 대시보드
│   │   │       ├── director/   # 원장님 대시보드
│   │   │       ├── nurse/      # 간호사 대시보드
│   │   │       └── admin/      # 본사 관리자
│   │   ├── components/
│   │   │   ├── ui/             # shadcn 기반 공통 컴포넌트
│   │   │   ├── patient/        # 환자 관련 컴포넌트
│   │   │   ├── ai/             # AI 리포트, 분석 UI
│   │   │   └── schedule/       # 스케줄/캘린더
│   │   └── lib/
│   │       ├── api.ts          # API 클라이언트
│   │       ├── auth.ts         # 인증 헬퍼
│   │       └── utils.ts
│   │
│   └── api/                    # 백엔드 (Next.js API Routes 또는 별도 서버)
│       ├── routes/
│       │   ├── patients.ts
│       │   ├── consultations.ts
│       │   ├── programs.ts
│       │   ├── schedules.ts
│       │   └── ai.ts           # AI 분석 트리거
│       └── middleware/
│           ├── auth.ts
│           └── rbac.ts         # Role-based access control
│
├── packages/
│   ├── ai-agent/               # RAG + AI 에이전트 (Python 또는 TS)
│   │   ├── rag/
│   │   │   ├── ingest.py       # 문서 색인
│   │   │   ├── retriever.py    # 유사 케이스 검색
│   │   │   └── vectorstore.py  # pgvector 연동
│   │   ├── agent/
│   │   │   ├── analyzer.py     # 환자 데이터 분석
│   │   │   ├── reporter.py     # 원장님용 리포트 생성
│   │   │   └── logic.py        # 원장님 판단 로직 적용
│   │   └── prompts/
│   │       ├── system.py       # 시스템 프롬프트
│   │       └── report.py       # 리포트 생성 프롬프트
│   │
│   └── db/                     # Prisma 스키마 및 마이그레이션
│       ├── schema.prisma
│       └── migrations/
│
└── docs/                       # 이 문서 포함 프로젝트 문서
    ├── ONCONEXUS_PROJECT.md    # ← 지금 이 파일
    ├── API.md
    └── AI_AGENT.md
```

---

## 5. 데이터베이스 스키마 (핵심 테이블)

```prisma
// packages/db/schema.prisma

model Branch {
  id        String   @id @default(cuid())
  name      String
  address   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  users     User[]
  patients  Patient[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN       // 본사 관리자
  DIRECTOR    // 원장님 (본점 또는 브랜치)
  SALES       // 영업 담당
  NURSE       // 간호사
}

model Patient {
  id          String        @id @default(cuid())
  name        String
  birthDate   DateTime
  phone       String
  region      String?
  cancerType  String
  cancerStage String?
  symptoms    String?
  history     String?       // 기존 치료 이력
  status      PatientStatus @default(NEW)
  branchId    String
  branch      Branch        @relation(fields: [branchId], references: [id])
  createdAt   DateTime      @default(now())

  files         PatientFile[]
  consultations Consultation[]
  aiReports     AIReport[]
  treatment     Treatment?
}

enum PatientStatus {
  NEW
  CONSULTING
  AI_PENDING
  AI_DONE
  CONFIRMED
  IN_TREATMENT
  COMPLETED
  ON_HOLD
}

model PatientFile {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  filename    String
  fileType    String   // CT, BLOOD_TEST, BIOPSY, PRESCRIPTION, OTHER
  storageUrl  String   // S3/R2 URL
  uploadedBy  String   // userId
  createdAt   DateTime @default(now())
}

model Consultation {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  salesId     String   // userId (영업담당)
  type        String   // PHONE, VISIT, ONLINE
  content     String   // 상담 내용
  createdAt   DateTime @default(now())
}

model AIReport {
  id              String   @id @default(cuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  summary         String   // AI 분석 요약
  recommendedProgs String[] // 추천 프로그램 ID 목록
  similarCases    Int      // 유사 케이스 수
  confidenceScore Float    // 0~100
  references      Json     // 참조 근거 목록
  rawResponse     Json     // 전체 AI 응답
  createdAt       DateTime @default(now())
}

model Treatment {
  id             String    @id @default(cuid())
  patientId      String    @unique
  patient        Patient   @relation(fields: [patientId], references: [id])
  directorId     String    // 컨펌한 원장님 userId
  programs       String[]  // 선택된 프로그램 ID 목록
  directorNote   String?   // 원장님 지시사항
  confirmedAt    DateTime  @default(now())

  sessions       TreatmentSession[]
}

model Program {
  id          String   @id @default(cuid())
  name        String
  description String
  duration    String   // "12주"
  sessions    Int      // 총 세션 수
  tags        String[]
  isActive    Boolean  @default(true)
  // 본사에서 관리, 모든 브랜치 공유
}

model TreatmentSession {
  id           String        @id @default(cuid())
  treatmentId  String
  treatment    Treatment     @relation(fields: [treatmentId], references: [id])
  programId    String
  nurseId      String?       // 담당 간호사
  scheduledAt  DateTime
  status       SessionStatus @default(UPCOMING)
  note         String?       // 특이사항
  completedAt  DateTime?
}

enum SessionStatus {
  UPCOMING
  DONE
  CANCELLED
  REPORTED   // 이상반응 보고
}
```

---

## 6. AI 에이전트 설계

### 6.1 RAG 데이터 소스

```
1. 자체 케이스 데이터베이스
   - 기존 환자 치료 기록 (익명화 필수)
   - 처방 이력 및 결과
   - 원장님이 직접 입력한 케이스 노트

2. 공개 의학 문헌
   - 대한종양학회 가이드라인
   - PubMed 공개 논문 (암 치료 관련)
   - 병원 자체 프로토콜 문서

3. 프로그램 매칭 룰
   - 원장님이 정의한 판단 로직 (암종 × 병기 × 증상 → 프로그램 추천)
```

### 6.2 AI 에이전트 호출 흐름

```
영업담당 "AI 분석 요청" 클릭
  │
  ├── POST /api/ai/analyze { patientId }
  │
  ├── [백엔드]
  │   ├── 환자 데이터 조회 (문진 + 상담기록 + 파일 메타)
  │   ├── 파일 텍스트 추출 (PDF → text)
  │   └── AI 에이전트 호출
  │
  ├── [AI 에이전트]
  │   ├── 환자 데이터 임베딩
  │   ├── pgvector에서 유사 케이스 Top-K 검색
  │   ├── 관련 의학 문헌 검색
  │   ├── 원장님 판단 로직 프롬프트 적용
  │   └── 구조화된 리포트 생성 (JSON)
  │
  ├── [리포트 저장]
  │   └── AIReport 테이블에 저장
  │
  └── Patient 상태 → AI_DONE
      원장님에게 알림 발송
```

### 6.3 AI 리포트 출력 구조 (JSON)

```typescript
interface AIReport {
  summary: string;                    // 분석 요약 (원장님용)
  recommendedPrograms: {
    programId: string;
    reason: string;
    confidence: number;               // 0~100
  }[];
  scores: {
    caseSimilarity: number;           // 유사 케이스 일치율
    programFit: number;               // 프로그램 적합도
    riskIndex: number;                // 위험 지표
  };
  references: {
    type: 'case' | 'paper' | 'guideline';
    title: string;
    relevance: string;
  }[];
  warnings: string[];                 // 주의사항 (원장님 검토 필요 항목)
  rawContext: string;                 // RAG 검색 결과 전문
}
```

---

## 7. API 엔드포인트 설계

```
# 환자
GET    /api/patients                  # 목록 (역할별 필터링)
POST   /api/patients                  # 접수 (환자 본인)
GET    /api/patients/:id              # 상세
PATCH  /api/patients/:id/status       # 상태 변경

# 파일
POST   /api/patients/:id/files        # 파일 업로드 (S3 presigned URL)
GET    /api/patients/:id/files        # 파일 목록

# 상담 기록
GET    /api/patients/:id/consultations
POST   /api/patients/:id/consultations

# AI 분석
POST   /api/ai/analyze                # 분석 요청 { patientId }
GET    /api/patients/:id/ai-report    # 리포트 조회

# 컨펌
POST   /api/treatments                # 원장님 컨펌 { patientId, programs, note }
GET    /api/treatments/:id

# 세션 스케줄
GET    /api/sessions                  # 간호사용 스케줄
PATCH  /api/sessions/:id              # 완료 처리 { status, note }

# 프로그램 (관리자)
GET    /api/programs
POST   /api/programs
PATCH  /api/programs/:id

# 브랜치 (관리자)
GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
```

---

## 8. 인증 및 권한 (RBAC)

```typescript
// 각 API는 아래 권한 매트릭스를 기준으로 접근 제어

const permissions = {
  'patients:read':        ['ADMIN', 'DIRECTOR', 'SALES', 'NURSE'],
  'patients:write':       ['ADMIN', 'SALES'],
  'consultations:write':  ['SALES'],
  'ai:trigger':           ['SALES', 'DIRECTOR'],
  'treatment:confirm':    ['DIRECTOR'],
  'sessions:read':        ['DIRECTOR', 'NURSE'],
  'sessions:complete':    ['NURSE'],
  'programs:manage':      ['ADMIN'],
  'branches:manage':      ['ADMIN'],
  'rag:manage':           ['ADMIN'],
};

// 브랜치 격리: 각 유저는 자신의 branchId에 속한 데이터만 접근 가능
// 단, ADMIN과 본점 DIRECTOR는 전체 브랜치 접근 가능
```

---

## 9. 현재 구현 상태 (프로토타입)

### 완료된 것 (MVP 목업, `oncosaas-v2.jsx`)

- [x] 랜딩페이지 (아미랑 감성, 반응형)
- [x] 환자 접수 폼 (3단계 멀티스텝)
- [x] 역할 선택 로그인 화면
- [x] 영업 CRM (환자 목록, 상담 기록, 파일 관리 탭, AI 분석 요청)
- [x] 원장님 대시보드 (AI 분석 애니메이션, 리포트, 프로그램 선택, 컨펌)
- [x] 간호사 대시보드 (스케줄 관리, 세션 완료 기록)

### 아직 안 된 것 (실제 개발 필요)

- [ ] 실제 인증/인가 (JWT, 세션)
- [ ] 백엔드 API 연동
- [ ] 파일 업로드 (S3)
- [ ] 실제 AI/RAG 파이프라인
- [ ] 본사 관리자 화면 (브랜치 관리, 프로그램 배포, RAG 설정)
- [ ] 브랜치 원장님 → 본점 원장님 에스컬레이션 플로우
- [ ] 환자 현황 조회 (환자 로그인 후 진행 상황 확인)
- [ ] 알림 시스템 (이메일/SMS/앱 푸시)
- [ ] 다국어 (한/영/중 — 현재 사이트 지원 중)

---

## 10. 개발 시 주의사항

### 의료 데이터 보안
- 환자 개인정보 및 진료기록은 **개인정보보호법** 및 **의료법** 적용 대상
- DB에 저장 시 민감 필드 암호화 필수 (AES-256)
- S3 버킷은 퍼블릭 접근 차단, presigned URL로만 접근
- 모든 API 요청 로그 보존 (감사 추적)

### AI 에이전트 제약
- AI 리포트에는 반드시 "이 분석은 원장님의 최종 판단을 보조하는 참고 자료입니다" 문구 포함
- AI가 생성한 내용을 그대로 환자에게 노출하지 않는다
- 원장님이 컨펌하지 않은 AI 리포트는 영업/간호사에게 노출되지 않는다

### 브랜치 데이터 격리
- 모든 쿼리에 `branchId` 필터 적용 (RLS 또는 미들웨어)
- 브랜치 간 환자 데이터 공유 불가 (본사 관리자, 본점 원장님 제외)

---

## 11. 다음 개발 단계 권장 순서

```
Phase 1 — 기반 (2~3주)
  ├── Next.js 프로젝트 세팅 (TypeScript, Tailwind, shadcn)
  ├── Prisma 스키마 + PostgreSQL 연결
  ├── NextAuth 인증 (이메일/PW + Role)
  └── 기본 CRUD API (patients, consultations)

Phase 2 — 핵심 플로우 (3~4주)
  ├── 환자 접수 → 영업 CRM 연동
  ├── 파일 업로드 (S3 + presigned URL)
  ├── AI 에이전트 파이프라인 (LangChain + Claude API)
  └── 원장님 컨펌 플로우

Phase 3 — 운영 기능 (2~3주)
  ├── 간호사 스케줄 + 세션 기록
  ├── 본사 관리자 (브랜치/프로그램 관리)
  ├── RAG 문서 색인 UI
  └── 알림 시스템

Phase 4 — 안정화
  ├── 보안 감사
  ├── 성능 최적화
  └── 다국어 지원
```

---

*문서 최초 작성: 2025.03*  
*기반 프로토타입: `oncosaas-v2.jsx` (단일 파일 React 목업)*  
*문의: 본 문서를 Claude Code에 컨텍스트로 제공하고 작업을 이어가세요.*
