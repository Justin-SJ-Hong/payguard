import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentWebhook {
  authResultCode: string
  authResultMsg: string
  tid: string
  orderId: string
  amount: number
  currency: string
  authToken: string
  signature: string
  timestamp: string
}

serve(async (req) => {
  // CORS preflight request 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 환경 변수에서 Supabase 정보 가져오기
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Nicepay 설정
    const nicepaySecretKey = Deno.env.get('NICEPAY_SECRET_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // POST 데이터 파싱
    const formData = await req.formData()
    const webhookData: PaymentWebhook = {
      authResultCode: formData.get('authResultCode') as string,
      authResultMsg: formData.get('authResultMsg') as string,
      tid: formData.get('tid') as string,
      orderId: formData.get('orderId') as string,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as string,
      authToken: formData.get('authToken') as string,
      signature: formData.get('signature') as string,
      timestamp: formData.get('timestamp') as string
    }

    console.log('웹훅 데이터 수신:', webhookData)

    // 1. 결제 결과 검증
    if (webhookData.authResultCode !== '0000') {
      console.error('결제 실패:', webhookData.authResultMsg)
      
      // 결제 요청 상태를 실패로 업데이트
      await updatePaymentRequestStatus(supabase, webhookData.orderId, 'failed', webhookData.authResultMsg)
      
      return new Response(
        JSON.stringify({
          success: false,
          message: '결제 실패',
          error: webhookData.authResultMsg
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // 2. 서명 검증 (보안 강화)
    if (!verifySignature(webhookData, nicepaySecretKey)) {
      console.error('서명 검증 실패')
      
      return new Response(
        JSON.stringify({
          success: false,
          message: '서명 검증 실패'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // 3. 결제 요청 상태 업데이트
    const { data: paymentRequest, error: updateError } = await updatePaymentRequestStatus(
      supabase, 
      webhookData.orderId, 
      'completed', 
      null,
      webhookData
    )

    if (updateError) {
      throw new Error(`결제 요청 상태 업데이트 실패: ${updateError.message}`)
    }

    // 4. 결제 완료 이메일 전송
    if (paymentRequest) {
      await sendPaymentCompletionEmail(paymentRequest, webhookData)
    }

    // 5. 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        message: '결제 완료 처리 성공',
        orderId: webhookData.orderId,
        tid: webhookData.tid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('웹훅 처리 오류:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// 결제 요청 상태 업데이트
async function updatePaymentRequestStatus(
  supabase: any, 
  orderId: string, 
  status: string, 
  errorMessage: string | null,
  webhookData?: PaymentWebhook
) {
  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  if (webhookData) {
    updateData.nicepay_response = webhookData
  }

  const { data, error } = await supabase
    .from('payment_requests')
    .update(updateData)
    .eq('order_id', orderId)
    .select()
    .single()

  if (error) {
    throw new Error(`결제 요청 상태 업데이트 실패: ${error.message}`)
  }

  return data
}

// 서명 검증 (보안 강화)
function verifySignature(webhookData: PaymentWebhook, secretKey: string): boolean {
  try {
    // 나이스페이 서명 검증 로직
    // 실제 구현에서는 나이스페이 공식 문서의 서명 검증 방법 사용
    const expectedSignature = generateSignature(webhookData, secretKey)
    return expectedSignature === webhookData.signature
  } catch (error) {
    console.error('서명 검증 오류:', error)
    return false
  }
}

// 서명 생성 (예시)
function generateSignature(webhookData: PaymentWebhook, secretKey: string): string {
  // 나이스페이 공식 문서에 따른 서명 생성 로직 구현
  // 이는 예시이며, 실제로는 나이스페이에서 제공하는 방법 사용
  const dataToSign = `${webhookData.orderId}${webhookData.amount}${webhookData.currency}${webhookData.timestamp}`
  
  // HMAC-SHA256 서명 생성 (예시)
  // 실제 구현에서는 나이스페이 공식 방법 사용
  return btoa(dataToSign + secretKey).substring(0, 32)
}

// 결제 완료 이메일 전송
async function sendPaymentCompletionEmail(paymentRequest: any, webhookData: PaymentWebhook) {
  try {
    const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID')!
    const emailjsTemplateId = Deno.env.get('EMAILJS_COMPLETION_TEMPLATE_ID')!
    const emailjsUserId = Deno.env.get('EMAILJS_USER_ID')!

    const emailData = {
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsUserId,
      template_params: {
        to_email: paymentRequest.freelancer_email,
        to_name: paymentRequest.freelancer_name,
        from_name: paymentRequest.client_name,
        contract_title: paymentRequest.contract_title,
        amount: paymentRequest.amount.toLocaleString(),
        currency: paymentRequest.currency,
        payment_type: paymentRequest.payment_type,
        order_id: paymentRequest.order_id,
        tid: webhookData.tid,
        completed_at: new Date().toISOString()
      }
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      throw new Error(`EmailJS API 호출 실패: ${response.status}`)
    }

    console.log(`결제 완료 이메일 전송 완료: ${paymentRequest.order_id}`)

  } catch (error) {
    console.error('결제 완료 이메일 전송 실패:', error)
  }
}
