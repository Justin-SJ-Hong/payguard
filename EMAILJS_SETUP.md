# EmailJS 설정 가이드

## 1. EmailJS 계정 설정

### 1.1 계정 생성
1. [EmailJS](https://www.emailjs.com/)에 접속하여 가입
2. 무료 계정으로 시작 (월 200건 이메일 전송 가능)

### 1.2 이메일 서비스 추가
1. EmailJS 대시보드에서 "Email Services" 클릭
2. "Add New Service" 클릭
3. 이메일 제공업체 선택 (Gmail, Outlook 등)
4. 계정 정보 입력하여 연결

## 2. 이메일 템플릿 생성

### 2.1 템플릿 생성
1. "Email Templates" 클릭
2. "Create New Template" 클릭
3. 템플릿 이름: "Proposal Email"

### 2.2 템플릿 내용 예시
```html
<!DOCTYPE html>
<html>
<head>
    <title>계약 제안서</title>
</head>
<body>
    <h1>📋 계약 제안서</h1>
    <p>안녕하세요, {{to_name}}님</p>
    
    <h2>📝 프로젝트 개요</h2>
    <p><strong>프로젝트명:</strong> {{project_title}}</p>
    <p><strong>프로젝트 설명:</strong> {{project_description}}</p>
    <p><strong>작업 기간:</strong> {{start_date}} ~ {{end_date}}</p>
    
    <h2>💰 금액 정보</h2>
    <p><strong>총 계약 금액:</strong> ${{total_amount}}</p>
    <p><strong>선불 비율:</strong> {{prepay_ratio}}%</p>
    <p><strong>후불 비율:</strong> {{postpay_ratio}}%</p>
    
    <h2>🎯 작업 범위</h2>
    <p>{{scope}}</p>
    
    {{#if message}}
    <h2>💬 제안 메시지</h2>
    <p>{{message}}</p>
    {{/if}}
    
    <p>문의사항이 있으시면 언제든지 연락주세요.</p>
</body>
</html>
```

## 3. 환경 변수 설정

### 3.1 .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력:

```env
VITE_EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID=YOUR_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

### 3.2 ID 찾는 방법
1. **Service ID**: Email Services 페이지에서 확인
2. **Template ID**: Email Templates 페이지에서 확인
3. **Public Key**: Account > API Keys에서 확인

## 4. 테스트

### 4.1 개발 서버 실행
```bash
npm run dev
```

### 4.2 제안서 작성 테스트
1. `/proposals/new` 페이지 접속
2. 제안서 정보 입력
3. "제안 보내기" 버튼 클릭
4. 이메일 전송 확인

## 5. 문제 해결

### 5.1 일반적인 오류
- **"Service ID not found"**: Service ID가 올바른지 확인
- **"Template ID not found"**: Template ID가 올바른지 확인
- **"Public Key invalid"**: Public Key가 올바른지 확인

### 5.2 이메일이 전송되지 않는 경우
1. EmailJS 대시보드에서 전송 로그 확인
2. 이메일 서비스 연결 상태 확인
3. 템플릿 변수명이 올바른지 확인

## 6. 무료 계정 제한사항

- **월 200건** 이메일 전송
- **100건** 템플릿 저장
- **1개** 이메일 서비스 연결

더 많은 기능이 필요하면 유료 플랜으로 업그레이드 가능합니다. 