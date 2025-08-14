import { supabase } from "../lib/supabase";

export const generateContractPDF = async (contractId: string, proposalId: string) => {
  try {
    // 1. 관련 테이블 데이터 조회
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractError) {
      throw new Error('계약 정보 조회 실패: ' + contractError.message);
    }

    if (!contract) {
      throw new Error('계약 정보를 찾을 수 없습니다.');
    }

    const [midpayRes, platformRes, toolRes, attachmentRes] = await Promise.all([
      supabase.from("proposal_midpays").select("*").eq("proposal_id", proposalId).order("pay_order", { ascending: true }),
      supabase.from("proposal_platforms").select("*").eq("proposal_id", proposalId),
      supabase.from("proposal_tools").select("*").eq("proposal_id", proposalId),
      supabase.from("proposal_attachments").select("*").eq("proposal_id", proposalId)
    ]);

    // 2. proposal 데이터 조회
    const { data: proposal } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (!proposal) {
      throw new Error('제안서 정보를 찾을 수 없습니다.');
    }

    // 3. PDFMonkey로 계약서 PDF 생성
    const pdfmonkeyApiKey = import.meta.env.VITE_PDFMONKEY_API_KEY;
    const pdfmonkeyTemplateId = import.meta.env.VITE_PDFMONKEY_TEMPLATE_ID;

    if (!pdfmonkeyApiKey || !pdfmonkeyTemplateId) {
      throw new Error('PDFMonkey 설정이 누락되었습니다.');
    }

    const pdfPayload = {
      document: {
        document_template_id: pdfmonkeyTemplateId,
        status: "pending",
        payload: {
            contract_id: contractId,  // 이제 안전하게 사용 가능
            proposal_id: proposalId,
            contract_status: contract.status,
            start_date: proposal.start_date,
            end_date: proposal.end_date,
            client_name: proposal.client_name,
            client_email: proposal.email,
            client_signature_url: contract.client_signature_url,
            client_signature_date: contract.client_signature_date,
            freelancer_signature_url: contract.freelancer_signature_url,
            freelancer_signature_date: contract.freelancer_signature_date,
            sender_name: proposal.sender_name,
            sender_email: proposal.sender_email,
            title: proposal.title,
            description: proposal.description,
            scope: proposal.scope,
            total_amount: proposal.total_amount,
            currency: proposal.currency,
            prepay_ratio: proposal.prepay_ratio,
            prepay_amount: Math.floor((proposal.total_amount || 0) * (proposal.prepay_ratio || 0) / 100),
            first_pay_date: proposal.first_pay_date,
            postpay_ratio: proposal.postpay_ratio,
            postpay_amount: Math.floor((proposal.total_amount || 0) * (proposal.postpay_ratio || 0) / 100),
            last_pay_date: proposal.last_pay_date,
            use_midpay: proposal.use_midpay,
            midpay_count: proposal.midpay_count,
            terms: proposal.terms,
            message: proposal.message,
            midpayAmounts: midpayRes.data || [],
            platforms: platformRes.data?.map(p => p.platform) || [],
            tools: toolRes.data?.map(t => t.tool) || [],
            attachments: attachmentRes.data?.map(att => ({
                ...att,
                file_name: decodeURIComponent(encodeURIComponent(att.file_name || '')) // UTF-8 인코딩 처리
            })) || [],
            created_at: new Date().toISOString()
        }
      }
    };

    console.log('PDFMonkey payload:', pdfPayload);

    // JSON 형식으로 보기 좋게 출력
    console.log('PDFMonkey payload (JSON):', JSON.stringify(pdfPayload, null, 2));

    const pdfRes = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${pdfmonkeyApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pdfPayload)
    });

    if (!pdfRes.ok) {
      const pdfErrorText = await pdfRes.text();
      throw new Error(`PDF 생성 실패: ${pdfRes.status} - ${pdfErrorText}`);
    }

    const pdfData = await pdfRes.json();
    console.log('PDFMonkey 응답:', pdfData);
    
    // 4. PDF 생성 완료까지 대기
    let pdfUrl = pdfData.document?.download_url;
    let attempts = 0;
    const maxAttempts = 30;

    while (!pdfUrl && attempts < maxAttempts) {
      console.log(`PDF 생성 중... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusRes = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdfData.document.id}`, {
        headers: {
          "Authorization": `Bearer ${pdfmonkeyApiKey}`,
          "Content-Type": "application/json"
        }
      });
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        console.log('PDF 상태:', statusData.document.status);
        pdfUrl = statusData.document?.download_url;
        
        if (statusData.document.status === 'success' && pdfUrl) {
          break;
        }
        if (statusData.document.status === 'error') {
          throw new Error('PDF 생성 중 오류가 발생했습니다.');
        }
      }
      attempts++;
    }

    if (!pdfUrl) {
      throw new Error('PDF 생성 시간이 초과되었습니다.');
    }

    console.log('PDF 생성 완료:', pdfUrl);

    // 5. PDF를 Supabase Storage에 저장
    const pdfResponse = await fetch(pdfUrl);
    const pdfBlob = await pdfResponse.blob();
    
    const contractFileName = `contract_${proposalId}_${Date.now()}.pdf`;

    // 현재 인증된 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
    throw new Error('사용자 인증이 필요합니다.');
    }

    const filePath = `${user.id}/${contractFileName}`;

    // 업로드 전에 버킷 정보 확인
    console.log('업로드 시도 - 버킷: contracts, 경로:', filePath);

    const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(filePath, pdfBlob, {
        contentType: 'application/pdf'
    });

    if (uploadError) {
        console.error('업로드 에러 상세:', uploadError);
        console.error('에러 메시지:', uploadError.message);
        throw new Error('계약서 PDF 저장 실패: ' + uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(filePath);

    const storedPdfUrl = publicUrlData.publicUrl;
    console.log('계약서 PDF 저장 완료:', storedPdfUrl);

    // 6. contracts 테이블에 PDF URL 업데이트
    const { error: updateError } = await supabase
      .from("contracts")
      .update({ 
        final_pdf_url: storedPdfUrl,
        pdf_generated_at: new Date().toISOString(),
        status: 'accepted'
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('PDF URL 업데이트 실패:', updateError);
    }
    
    console.log('계약서 PDF 생성 및 저장 완료');
    
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    throw error;
  }
};