export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">개인정보 처리방침</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">1. 개인정보의 처리 목적</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            (주)Freelance Payguard는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 
            다음의 목적 이외의 용도로는 이용하지 않습니다.
          </p>
          <div className="space-y-2 text-gray-600">
            <p>• 회원 가입 및 관리</p>
            <p>• 서비스 제공 및 운영</p>
            <p>• 계약 관리 및 서명 서비스</p>
            <p>• 결제 및 정산 서비스</p>
            <p>• 고객 상담 및 문의 응대</p>
            <p>• 마케팅 및 광고 활용 (동의 시)</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">2. 개인정보의 처리 및 보유기간</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">구체적인 개인정보 처리 및 보유기간</h3>
              <ul className="space-y-1 text-sm">
                <li>• 회원가입 정보: 회원 탈퇴 시까지</li>
                <li>• 계약 관련 정보: 계약 완료 후 5년</li>
                <li>• 결제 정보: 관련 법령에 따라 5년</li>
                <li>• 로그 기록: 3개월</li>
                <li>• 마케팅 정보: 동의 철회 시까지</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">3. 개인정보의 제3자 제공</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 
            정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 
            개인정보를 제3자에게 제공합니다.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">제3자 제공이 필요한 경우</h3>
              <ul className="space-y-1 text-sm">
                <li>• 결제 서비스 제공업체 (결제 처리 목적)</li>
                <li>• 전자서명 인증업체 (본인인증 목적)</li>
                <li>• 법령에 따른 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">4. 개인정보처리 위탁</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">위탁업체 및 위탁업무 내용</h3>
              <ul className="space-y-1 text-sm">
                <li>• AWS (Amazon Web Services): 클라우드 서버 호스팅</li>
                <li>• Supabase: 데이터베이스 및 인증 서비스</li>
                <li>• 이메일 서비스 제공업체: 고객 문의 응대</li>
              </ul>
            </div>
            <p className="text-sm">위탁계약 체결시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 
            기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 
            계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">5. 정보주체의 권리·의무 및 그 행사방법</h2>
          <div className="space-y-3 text-gray-600">
            <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <div className="space-y-2">
              <p>1) 개인정보 열람요구</p>
              <p>2) 오류 등이 있을 경우 정정 요구</p>
              <p>3) 삭제요구</p>
              <p>4) 처리정지 요구</p>
            </div>
            <p className="text-sm">제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 
            회사는 이에 대해 지체 없이 조치하겠습니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">6. 처리하는 개인정보 항목</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">수집하는 개인정보 항목</h3>
              <ul className="space-y-1 text-sm">
                <li>• 필수항목: 이메일, 비밀번호, 이름, 휴대폰번호</li>
                <li>• 선택항목: 회사명, 직책, 주소</li>
                <li>• 자동수집항목: IP주소, 쿠키, 서비스 이용기록, 접속 로그</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">7. 개인정보의 파기</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
            지체없이 해당 개인정보를 파기합니다.</p>
            <div className="space-y-2">
              <p>• 전자적 파일 형태의 정보는 기술적 방법을 사용하여 복구 및 재생할 수 없도록 안전하게 삭제</p>
              <p>• 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">8. 개인정보의 안전성 확보 조치</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보조치를 취하고 있습니다.</p>
            <div className="space-y-2">
              <p>1) 개인정보의 암호화</p>
              <p>2) 해킹 등에 대비한 기술적 대책</p>
              <p>3) 개인정보에 대한 접근 제한</p>
              <p>4) 개인정보를 취급하는 직원의 최소화 및 교육</p>
              <p>5) 개인정보보호 전담기구의 운영</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">9. 개인정보 보호책임자</h2>
          <div className="space-y-3 text-gray-600">
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 
            불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">개인정보 보호책임자</h3>
              <ul className="space-y-1 text-sm">
                <li>• 성명: Justin SeongJae Hong</li>
                <li>• 직책: CEO</li>
                <li>• 연락처: +82-10-8108-6648</li>
                <li>• 이메일: madwolves98@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">10. 개인정보 처리방침 변경</h2>
          <p className="text-gray-600 leading-relaxed">
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
            변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 text-center">
            이 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
