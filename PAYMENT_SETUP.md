# PayGuard 결제 시스템 설정 가이드

## 개요
이 문서는 PayGuard에서 나이스페이 Start API를 사용한 자동 결제 요청 시스템 설정 방법을 설명합니다.

## 1. 환경 변수 설정

### Supabase Edge Function 환경 변수
다음 환경 변수들을 Supabase Edge Function에 설정해야 합니다:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Nicepay 설정
NICEPAY_CLIENT_ID=your-nicepay-client-id
NICEPAY_SECRET_KEY=your-nicepay-secret-key
NICEPAY_RETURN_URL=https://your-domain.com/payment/complete

# EmailJS 설정
EMAILJS_SERVICE_ID=your-emailjs-service-id
EMAILJS_TEMPLATE_ID=your-emailjs-template-id
EMAILJS_USER_ID=your-emailjs-user-id
```

### GitHub Secrets 설정
GitHub Actions에서 사용할 시크릿을 설정해야 합니다:

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase 익명 키

## 2. Nicepay 설정

### 1) 나이스페이 계정 생성
- [나이스페이 Start](https://start.nicepay.co.kr)에서 계정 생성
- 상점 등록 및 승인 대기

### 2) 개발 정보 설정
- **KEY 정보**: Server 승인 모델, Basic 인증 방식 선택
- **IP보안**: 개발/운영 서버 IP 등록
- **웹훅**: 결제 완료 시 수신할 엔드포인트 등록

### 3) 테스트 환경
- 샌드박스 환경에서 먼저 테스트
- 테스트 완료 후 운영계로 전환

## 3. EmailJS 설정

### 1) EmailJS 계정 생성
- [EmailJS](https://www.emailjs.com/)에서 계정 생성
- 이메일 서비스 연결 (Gmail, Outlook 등)

### 2) 템플릿 설정
- `payment-request` 템플릿 생성
- 제공된 HTML 템플릿 사용
- 템플릿 ID 확인

### 3) 서비스 ID 및 사용자 ID 확인
- EmailJS 대시보드에서 서비스 ID와 사용자 ID 확인

## 4. 데이터베이스 설정

### 1) 결제 요청 로그 테이블 생성
```sql
-- supabase/migrations/create_payment_requests_table.sql 실행
```

### 2) 테이블 권한 설정
```sql
-- RLS 정책 확인 및 필요시 수정
-- 관리자 권한으로 결제 요청 로그 조회 가능하도록 설정
```

## 5. 배포 및 테스트

### 1) Edge Function 배포
```bash
# Supabase CLI로 Edge Function 배포
supabase functions deploy request-payment
```

### 2) 환경 변수 설정
```bash
# Edge Function 환경 변수 설정
supabase secrets set --env-file .env.local
```

### 3) 테스트
- Edge Function 직접 호출하여 테스트
- 로그 확인 및 오류 수정

## 6. Cron 작업 설정

### 1) GitHub Actions 자동 실행
- 매일 자정 (UTC)에 자동 실행
- 수동 실행도 가능 (workflow_dispatch)

### 2) 모니터링
- GitHub Actions 로그 확인
- Supabase Edge Function 로그 확인
- 결제 요청 로그 테이블 모니터링

## 7. 결제 흐름

### 1) 자동 결제 요청
```
매일 자정 → Edge Function 실행 → 오늘 결제 예정 계약 조회 → 결제 요청 생성 → 이메일 전송
```

### 2) 결제 처리
```
클라이언트 이메일 수신 → 결제 링크 클릭 → 나이스페이 결제창 → 결제 완료 → 웹훅 수신
```

### 3) 상태 관리
```
requested → processing → completed/failed
```

## 8. 트러블슈팅

### 일반적인 문제들

#### 1) Edge Function 실행 실패
- 환경 변수 확인
- Supabase 권한 확인
- 로그 확인

#### 2) 이메일 전송 실패
- EmailJS 설정 확인
- 템플릿 ID 확인
- API 키 확인

#### 3) 결제 요청 실패
- Nicepay 설정 확인
- IP 제한 확인
- 클라이언트 키 확인

### 로그 확인 방법
```bash
# Supabase Edge Function 로그
supabase functions logs request-payment

# GitHub Actions 로그
# GitHub 저장소 → Actions 탭에서 확인
```

## 9. 보안 고려사항

### 1) API 키 보안
- 서비스 롤 키는 서버에서만 사용
- 클라이언트 키는 공개되어도 안전
- 정기적인 키 재발급

### 2) IP 제한
- 허용된 IP에서만 API 호출 가능
- 개발/운영 환경 IP 분리

### 3) 데이터 검증
- 결제 요청 데이터 위변조 방지
- 금액 및 계약 정보 검증

## 10. 확장 계획

### 1) PayPal 연동
- 국내↔해외, 해외↔해외 거래
- PayPal API 연동
- 통화별 결제 처리

### 2) 추가 결제 수단
- 계좌이체
- 가상계좌
- 간편결제

### 3) 고급 기능
- 결제 실패 시 재시도
- 부분 취소
- 환불 처리

## 문의 및 지원

문제가 발생하거나 추가 지원이 필요한 경우:
1. Supabase Edge Function 로그 확인
2. GitHub Actions 로그 확인
3. 나이스페이 기술지원팀 문의
4. EmailJS 지원팀 문의
