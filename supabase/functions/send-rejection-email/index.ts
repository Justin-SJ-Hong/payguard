// supabase/functions/send-rejection-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req)=>{
  // CORS 헤더 추가
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  try {
    const { proposalId, clientName, clientEmail, senderName, senderEmail, title, rejectionReason, customReason, allowResubmit, resubmitDeadline } = await req.json();
    const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
    const EMAILJS_REJECT_TEMPLATE_ID = Deno.env.get('EMAILJS_REJECT_TEMPLATE_ID');
    const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');
    const emailjsData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_REJECT_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_name: clientName,
        to_email: clientEmail,
        from_name: senderName,
        from_email: senderEmail,
        title: title,
        rejection_reason: rejectionReason,
        custom_reason: customReason || '',
        allow_resubmit: allowResubmit ? '예' : '아니오',
        resubmit_deadline: resubmitDeadline || '',
        proposal_id: proposalId
      }
    };
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailjsData)
    });
    if (!emailjsResponse.ok) {
      const errorText = await emailjsResponse.text();
      throw new Error(`EmailJS 전송 실패: ${errorText}`);
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  // const rejectionMessage = customReason || rejectionReason;
  // const resubmitMessage = allowResubmit ? `\n\n재제안이 허용되었습니다. 마감일: ${resubmitDeadline}` : '\n\n재제안은 허용되지 않습니다.';
  // const emailContent = `
  //   안녕하세요 ${clientName}님,
  //   제안서 검토 결과를 안내드립니다.
  //   ❌ 제안서가 거절되었습니다.
  //   거절 사유: ${rejectionMessage}
  //   ${resubmitMessage}
  //   감사합니다.
  // `;
  // // 이메일 전송 로직 (EmailJS 또는 다른 서비스 사용)
  // return new Response(JSON.stringify({
  //   success: true
  // }), {
  //   status: 200,
  //   headers: {
  //     "Content-Type": "application/json",
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Methods': 'POST, OPTIONS',
  //     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  //   }
  // });
  } catch (error) {
    console.error('EmailJS 전송 오류:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
});
