# PayGuard - 프리랜서 계약 관리 시스템 (🚧 10/09 확정 예정)

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.2-green.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<div align="center">
  <img src="public/payguard.svg" alt="PayGuard Logo" width="200"/>
  
  **프리랜서와 클라이언트 간의 계약 관리를 위한 현대적인 웹 애플리케이션**
  
  [데모 보기](#) • [문서 보기](#) • [이슈 리포트](#)
</div>

## 주의사항
- PDFMonkey, EmailJS 템플릿 소스코드는 공개용이며 실제 소스코드와 연동하려면 EmailJS 내부에서 별도의 설정이 필요합니다.
- 여기 올라와있는 Edge Functions 소스코드는 공개용이자만 실제로 연동하려면 Supabase 내부에서 직접 작성하셔야 합니다.

## 공지사항
안녕하세요 Justin-SJ-Hong 개발자입니다. 원래 9/2에 하려 했고 9/5 23:30(UTC+9, 서울 시간 기준)까지 하려고 했습니다.
하지만 사정상의 이유로 결제기능 추가 및 대시보드 설정을 10/09 23:30(UTC+9, 서울 시간 기준)으로 다시 연장하게 되었습니다. 
제가 일을 너무 많이 벌려놨는데요 조금만 더 생각했으면 덜 벌려놓을수도 있었습니다. 하지만 생각이 너무 짧았던 나머지 무리하게 일을 벌렸던거 같습니다.
다시 한 번 고객 여러분께 심려를 끼쳐드려 대단히 죄송합니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [스크린샷](#스크린샷)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [사용법](#사용법)
- [프로젝트 구조](#프로젝트-구조)
- [API 문서](#api-문서)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 🎯 프로젝트 개요

PayGuard는 프리랜서가 클라이언트와의 계약을 체계적으로 관리할 수 있도록 도와주는 웹 애플리케이션입니다. 제안서 작성부터 계약 체결, 결제 관리까지 전체 워크플로우를 지원합니다.

### ✨ 핵심 가치

- **효율성**: 복잡한 계약 프로세스를 간소화
- **투명성**: 모든 거래 내역과 상태를 명확하게 표시
- **보안성**: Supabase를 통한 안전한 데이터 관리
- **사용자 경험**: 직관적이고 반응형인 UI/UX

## 🚀 주요 기능

### 📝 제안서 관리
- **스마트 폼 작성**: React Hook Form을 활용한 유연한 제안서 작성
- **템플릿 시스템**: 재사용 가능한 제안서 템플릿
- **파일 첨부**: 프로젝트 관련 문서 및 이미지 첨부
- **자동 저장**: 작성 중인 내용 자동 저장

### 📧 이메일 자동화
- **자동 전송**: 제안서 완성 시 클라이언트에게 자동 이메일 발송
- **HTML 템플릿**: 전문적인 디자인의 이메일 템플릿
- **재전송 기능**: 필요 시 이메일 재전송 가능
- **전송 상태 추적**: 실시간 전송 상태 모니터링

### 💰 결제 관리 -> 2025.10.09 까지 추가 예정
- **다양한 지급 방식**: 선불, 중간지급, 후불 지원
- **PayPal 통합**: 안전한 온라인 결제 처리
- **지급 일정 관리**: 자동 지급 일정 알림
- **수수료 계산**: 자동 수수료 및 세금 계산

### 📊 대시보드 & 분석 -> 2025.10.09 까지 추가 예정
- **실시간 모니터링**: 계약 상태 및 진행 상황 실시간 추적
- **통계 분석**: 수익, 프로젝트 완성률 등 핵심 지표 제공
- **알림 시스템**: 중요한 이벤트 및 마감일 알림

### 🔐 사용자 관리
- **회원가입/로그인**: Supabase Auth를 통한 안전한 인증
- **프로필 관리**: 사용자 정보 및 아바타 관리
- **권한 관리**: 역할 기반 접근 제어

## 🖼️ 스크린샷

<div align="center">
  <img src="public/payguard.png" alt="PayGuard Dashboard" width="400"/>
  <p><em>PayGuard 대시보드 - 계약 현황 및 통계</em></p>
</div>

## 🛠️ 기술 스택

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 환경 및 빌드
- **Material-UI (MUI)** - 현대적이고 일관된 UI 컴포넌트
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### Backend & Database
- **Supabase** - PostgreSQL 기반 백엔드 서비스
- **Supabase Auth** - 사용자 인증 및 권한 관리
- **Supabase Storage** - 파일 업로드 및 관리

### 상태 관리
- **Zustand** - 가벼운 상태 관리 라이브러리
- **Redux Toolkit** - 복잡한 상태 로직 관리

### 외부 서비스
- **EmailJS** - 이메일 전송 서비스
- **PayPal** - 결제 처리

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **React Hook Form** - 폼 상태 관리

## 💻 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Git

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/payguard.git
cd payguard
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS 설정
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# PayPal 설정 (선택사항)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `https://payguard.kro.kr/`으로 접속하세요.

### 5. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 📖 사용법 ()

### 🆕 첫 사용자 가이드

1. **회원가입**: 이메일과 비밀번호로 계정 생성
2. **프로필 설정**: 기본 정보 및 아바타 업로드
3. **첫 제안서 작성**: `/proposals/new`에서 시작

### 📝 제안서 작성 프로세스

1. **기본 정보 입력**
   - 클라이언트 정보 (이름, 이메일, 연락처)
   - 프로젝트 제목 및 설명
   - 시작일 및 종료일

2. **작업 범위 정의**
   - 세부 작업 항목
   - 예상 소요 시간
   - 필요한 리소스

3. **금액 및 지급 조건**
   - 총 프로젝트 금액
   - 지급 방식 선택 (선불/중간지급/후불)
   - 각 단계별 지급 비율

4. **제안서 검토 및 전송**
   - 모든 정보 검토
   - "제안 보내기" 클릭
   - 자동 이메일 전송

### 📧 이메일 관리

- **자동 전송**: 제안서 완성 시 자동 발송
- **재전송**: 상세 페이지에서 필요 시 재전송
- **템플릿 커스터마이징**: EmailJS 대시보드에서 템플릿 수정

### 💳 결제 처리 -> 2025.10.09 까지 구현 예정

- **PayPal 통합**: 안전한 온라인 결제
- **지급 요청**: 설정된 일정에 따른 지급 요청

## 🏗️ 프로젝트 구조 (10/9 확정 예정)

```
payguard/
├── public/                 # 정적 파일
│   ├── payguard.svg       # 로고
│   └── payguard.png       # 스크린샷
├── src/
│   ├── api/               # API 통신
│   │   └── transfi.js     # TransFi API
│   ├── components/        # 재사용 컴포넌트
│   │   ├── AddressAutocomplete.tsx
│   │   ├── AvatarUpload.tsx
│   │   ├── DateConsistencyValidator.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── dashboard/    # 대시보드
│   │   ├── proposals/    # 제안서 관리
│   │   ├── contracts/    # 계약 관리
│   │   ├── payments/     # 결제 관리
│   │   ├── clients/      # 클라이언트 관리
│   │   └── member/       # 사용자 관리
│   ├── store/            # 상태 관리
│   │   ├── userStore.ts  # 사용자 상태 (Zustand)
│   │   └── proposalStore.ts # 제안서 상태
│   ├── services/         # 비즈니스 로직
│   │   ├── contractService.ts
│   │   └── emailService.ts
│   ├── hooks/            # 커스텀 훅
│   ├── utils/            # 유틸리티 함수
│   ├── styles/           # 스타일 파일
│   ├── type/             # TypeScript 타입 정의
│   └── lib/              # 라이브러리 설정
│       └── supabase.ts   # Supabase 클라이언트
├── package.json          # 의존성 및 스크립트
├── tsconfig.json         # TypeScript 설정
├── vite.config.js        # Vite 설정
└── README.md             # 프로젝트 문서
```

## 🔌 API 문서

### Supabase API

#### 인증
```typescript
// 사용자 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 사용자 등록
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

#### 제안서 관리
```typescript
// 제안서 생성
const { data, error } = await supabase
  .from('proposals')
  .insert([proposalData])

// 제안서 조회
const { data, error } = await supabase
  .from('proposals')
  .select('*')
  .eq('user_id', userId)
```

### EmailJS API

```typescript
// 이메일 전송
const result = await emailjs.send(
  serviceId,
  templateId,
  templateParams,
  publicKey
)
```

## 🤝 기여하기

PayGuard 프로젝트에 기여하고 싶으시다면 환영합니다!

### 기여 방법

1. **Fork** 이 저장소
2. **Feature branch** 생성 (`git checkout -b feature/AmazingFeature`)
3. **Commit** 변경사항 (`git commit -m 'Add some AmazingFeature'`)
4. **Push** 브랜치 (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### 개발 가이드라인

- **코드 스타일**: ESLint 및 Prettier 규칙 준수
- **커밋 메시지**: 명확하고 설명적인 커밋 메시지 작성
- **테스트**: 새로운 기능에 대한 테스트 코드 작성
- **문서화**: 코드 변경 시 관련 문서 업데이트

### 이슈 리포트

버그를 발견하거나 기능 요청이 있으시면 [이슈 페이지](https://github.com/Justin-SJ-Hong/payguard/issues)에서 리포트해 주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 PayGuard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 감사의 말

- [React](https://reactjs.org/) - 훌륭한 UI 라이브러리
- [Supabase](https://supabase.com/) - 강력한 백엔드 서비스
- [Material-UI](https://mui.com/) - 아름다운 UI 컴포넌트
- [Vite](https://vitejs.dev/) - 빠른 개발 도구
- [EmailJS](https://www.emailjs.com/) - 이메일 전송 서비스

## 📞 연락처

- **프로젝트 링크**: [https://github.com/Justin-SJ-Hong/payguard](https://github.com/Justin-SJ-Hong/payguard)
- **이슈 리포트**: [https://github.com/Justin-SJ-Hong/payguard/issues](https://github.com/Justin-SJ-Hong/payguard/issues)
- **문의사항**: [madwolves98@gmail.com](mailto:madwolves98@gmail.com)

---

<div align="center">
  ⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요! ⭐
</div>
