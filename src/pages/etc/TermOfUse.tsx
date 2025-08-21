export default function TermOfUse() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">이용약관</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제1조 (목적)</h2>
          <p className="text-gray-600 leading-relaxed">
            이 약관은 (주)Freelance Payguard가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 
            기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제2조 (정의)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. "서비스"라 함은 회사가 제공하는 모든 서비스를 의미합니다.</p>
            <p>2. "회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 
            회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
            <p>3. "계정"이라 함은 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인하는 
            문자, 숫자 또는 특수문자의 조합을 말합니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제3조 (약관의 효력 및 변경)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</p>
            <p>2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
            <p>3. 약관이 변경되는 경우, 회사는 변경사항을 시행일자 7일 전부터 공지사항을 통해 공지합니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제4조 (서비스의 제공)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>계약 관리 및 서명 서비스</li>
              <li>결제 및 정산 서비스</li>
              <li>고객 관리 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
            <p>2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제5조 (서비스 이용)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.</p>
            <p>2. 회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 서비스제공화면에 공지한 바에 따릅니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제6조 (회원의 의무)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            </ul>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제7조 (개인정보보호)</h2>
          <p className="text-gray-600 leading-relaxed">
            회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하며, 개인정보의 보호 및 사용에 대해서는 
            회사가 별도로 정하는 개인정보처리방침을 적용합니다.
          </p>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제8조 (책임제한)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
            서비스 제공에 관한 책임이 면제됩니다.</p>
            <p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제9조 (분쟁해결)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 
            피해보상처리기구를 설치·운영합니다.</p>
            <p>2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-700">제10조 (재판권 및 준거법)</h2>
          <div className="space-y-2 text-gray-600">
            <p>1. 회사와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법원을 관할법원으로 합니다.</p>
            <p>2. 회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 text-center">
            이 약관은 2024년 1월 1일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}