# PayGuard - 계약 관리 시스템

PayGuard는 프리랜서와 클라이언트 간의 계약 관리를 위한 웹 애플리케이션입니다.

## 주요 기능

### 📝 제안서 관리
- 계약 제안서 작성 및 관리
- 클라이언트 정보 관리
- 프로젝트 개요 및 작업 범위 정의
- 지급 조건 설정 (선불, 중간지급, 후불)
- 파일 첨부 기능

### 📧 이메일 전송 시스템
- **제안서 자동 이메일 전송**: 제안서 작성 완료 시 클라이언트에게 자동으로 이메일 발송
- **이메일 재전송**: 제안서 상세 페이지에서 이메일 재전송 가능
- **HTML 템플릿**: 전문적인 디자인의 제안서 이메일 템플릿
- **실시간 상태 표시**: 전송 중 로딩 상태 및 성공/실패 알림

### 📊 대시보드
- 이메일 발송 현황 모니터링
- 최근 제안서 목록
- 계약 상태 추적

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Supabase
- **이메일**: EmailJS
- **상태 관리**: Redux Toolkit + Zustand
- **폼 관리**: React Hook Form

## 이메일 전송 설정 (EmailJS)

### 1. EmailJS 계정 설정

1. [EmailJS](https://www.emailjs.com/)에 가입
2. 이메일 서비스 추가 (Gmail, Outlook 등)
3. 이메일 템플릿 생성

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. EmailJS 템플릿 설정

EmailJS 대시보드에서 다음과 같은 변수들을 사용할 수 있습니다:

- `{{to_email}}` - 수신자 이메일
- `{{to_name}}` - 수신자 이름
- `{{project_title}}` - 프로젝트 제목
- `{{project_description}}` - 프로젝트 설명
- `{{start_date}}` - 시작일
- `{{end_date}}` - 종료일
- `{{total_amount}}` - 총 금액
- `{{prepay_ratio}}` - 선불 비율
- `{{postpay_ratio}}` - 후불 비율
- `{{scope}}` - 작업 범위
- `{{message}}` - 제안 메시지
- `{{html_content}}` - HTML 형식의 전체 내용

## 사용법

### 제안서 작성 및 이메일 전송

1. `/proposals/new` 페이지에서 제안서 작성
2. 모든 필수 정보 입력 (클라이언트 정보, 프로젝트 개요, 작업 범위 등)
3. "제안 보내기" 버튼 클릭
4. 제안서가 Supabase에 저장되고 클라이언트에게 이메일 자동 전송
5. 성공 시 대시보드로 자동 이동

### 이메일 재전송

1. `/proposals/:id` 페이지에서 제안서 상세 확인
2. "📧 이메일 재전송" 버튼 클릭
3. 클라이언트에게 동일한 제안서 이메일 재전송

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── proposals/      # 제안서 관련 페이지
│   └── dashboard/      # 대시보드
├── services/           # API 서비스
│   └── emailService.ts # 이메일 전송 서비스
├── store/              # 상태 관리
└── lib/                # 라이브러리 설정
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 라이선스

MIT License
