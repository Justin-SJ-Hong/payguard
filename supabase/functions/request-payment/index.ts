import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  contract_id: string
  proposal_id: string
  client_name: string
  client_email: string
  freelancer_name: string
  freelancer_email: string
  title: string
  amount: number
  currency: string
  payment_type: 'prepay' | 'midpay' | 'postpay'
  payment_date: string
  order_id: string
}

interface NicepayRequest {
  clientId: string
  method: string
  orderId: string
  amount: number
  goodsName: string
  returnUrl: string
  fnError: (result: any) => void
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
    const nicepayClientId = Deno.env.get('NICEPAY_CLIENT_ID')!
    const nicepaySecretKey = Deno.env.get('NICEPAY_SECRET_KEY')!
    const nicepayReturnUrl = Deno.env.get('NICEPAY_RETURN_URL')!
    
    // EmailJS 설정
    const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID')!
    const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID')!
    const emailjsUserId = Deno.env.get('EMAILJS_USER_ID')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 오늘 날짜 가져오기
    const today = new Date().toISOString().split('T')[0]
    
    // 1. 오늘 결제 예정인 계약들 조회
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        *,
        proposals (
          *,
          proposal_midpays (*)
        )
      `)
      .eq('status', 'accepted')

    if (contractsError) {
      throw new Error(`계약 조회 실패: ${contractsError.message}`)
    }

    const paymentRequests: PaymentRequest[] = []

    // 2. 각 계약에 대해 결제 예정일 확인
    for (const contract of contracts || []) {
      const proposal = contract.proposals
      
      if (!proposal) continue

      // 선불 결제 확인
      if (proposal.prepay_ratio && proposal.prepay_ratio > 0 && proposal.first_pay_date === today) {
        const amount = Math.floor((proposal.total_amount * proposal.prepay_ratio) / 100)
        paymentRequests.push({
          contract_id: contract.id,
          proposal_id: proposal.id,
          client_name: contract.client_name,
          client_email: contract.client_email,
          freelancer_name: contract.freelancer_name,
          freelancer_email: contract.freelancer_email,
          title: contract.title,
          amount: amount,
          currency: contract.currency || 'USD',
          payment_type: 'prepay',
          payment_date: today,
          order_id: `PAY_${contract.id}_PREPAY_${Date.now()}`
        })
      }

      // 중간지급 결제 확인
      if (proposal.use_midpay && proposal.proposal_midpays) {
        for (const midpay of proposal.proposal_midpays) {
          if (midpay.pay_date === today) {
            paymentRequests.push({
              contract_id: contract.id,
              proposal_id: proposal.id,
              client_name: contract.client_name,
              client_email: contract.client_email,
              freelancer_name: contract.freelancer_name,
              freelancer_email: contract.freelancer_email,
              title: contract.title,
              amount: midpay.amount,
              currency: contract.currency || 'USD',
              payment_type: 'midpay',
              payment_date: today,
              order_id: `PAY_${contract.id}_MIDPAY_${midpay.pay_order}_${Date.now()}`
            })
          }
        }
      }

      // 후불 결제 확인
      if (proposal.postpay_ratio && proposal.postpay_ratio > 0 && proposal.last_pay_date === today) {
        const amount = Math.floor((proposal.total_amount * proposal.postpay_ratio) / 100)
        paymentRequests.push({
          contract_id: contract.id,
          proposal_id: proposal.id,
          client_name: contract.client_name,
          client_email: contract.client_email,
          freelancer_name: contract.freelancer_name,
          freelancer_email: contract.freelancer_email,
          title: contract.title,
          amount: amount,
          currency: contract.currency || 'USD',
          payment_type: 'postpay',
          payment_date: today,
          order_id: `PAY_${contract.id}_POSTPAY_${Date.now()}`
        })
      }
    }

    // 3. 각 결제 요청에 대해 처리
    for (const paymentRequest of paymentRequests) {
      try {
        // Nicepay 결제 요청 생성
        const nicepayRequest: NicepayRequest = {
          clientId: nicepayClientId,
          method: 'card',
          orderId: paymentRequest.order_id,
          amount: paymentRequest.amount,
          goodsName: `${paymentRequest.title} - ${paymentRequest.payment_type === 'prepay' ? '선불' : paymentRequest.payment_type === 'midpay' ? '중간지급' : '후불'} 결제`,
          returnUrl: `${nicepayReturnUrl}?order_id=${paymentRequest.order_id}`,
          fnError: (result: any) => {
            console.error('Nicepay 결제 요청 실패:', result)
          }
        }

        // 결제 요청 로그 저장
        const { error: logError } = await supabase
          .from('payment_requests')
          .insert([{
            contract_id: paymentRequest.contract_id,
            proposal_id: paymentRequest.proposal_id,
            order_id: paymentRequest.order_id,
            amount: paymentRequest.amount,
            currency: paymentRequest.currency,
            payment_type: paymentRequest.payment_type,
            payment_date: paymentRequest.payment_date,
            status: 'requested',
            nicepay_request: nicepayRequest,
            created_at: new Date().toISOString()
          }])

        if (logError) {
          console.error('결제 요청 로그 저장 실패:', logError)
        }

        // EmailJS로 결제 요청 이메일 전송
        await sendPaymentRequestEmail(paymentRequest, nicepayRequest)

        console.log(`결제 요청 완료: ${paymentRequest.order_id}`)

      } catch (error) {
        console.error(`결제 요청 처리 실패 (${paymentRequest.order_id}):`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${paymentRequests.length}개의 결제 요청이 처리되었습니다.`,
        payment_requests: paymentRequests
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Edge Function 실행 오류:', error)
    
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

// EmailJS를 통한 결제 요청 이메일 전송
async function sendPaymentRequestEmail(paymentRequest: PaymentRequest, nicepayRequest: NicepayRequest) {
  try {
    const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID')!
    const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID')!
    const emailjsUserId = Deno.env.get('EMAILJS_USER_ID')!

    const emailData = {
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsUserId,
      template_params: {
        to_email: paymentRequest.client_email,
        to_name: paymentRequest.client_name,
        from_name: paymentRequest.freelancer_name,
        contract_title: paymentRequest.title,
        payment_type: paymentRequest.payment_type === 'prepay' ? '선불' : 
                     paymentRequest.payment_type === 'midpay' ? '중간지급' : '후불',
        amount: paymentRequest.amount.toLocaleString(),
        currency: paymentRequest.currency,
        payment_date: paymentRequest.payment_date,
        order_id: paymentRequest.order_id,
        payment_url: `https://pay.nicepay.co.kr/v1/js/?clientId=${nicepayRequest.clientId}&method=${nicepayRequest.method}&orderId=${nicepayRequest.orderId}&amount=${nicepayRequest.amount}&goodsName=${encodeURIComponent(nicepayRequest.goodsName)}&returnUrl=${encodeURIComponent(nicepayRequest.returnUrl)}`
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

    console.log(`결제 요청 이메일 전송 완료: ${paymentRequest.order_id}`)

  } catch (error) {
    console.error('결제 요청 이메일 전송 실패:', error)
  }
}
