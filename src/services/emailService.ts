import { supabase } from "../lib/supabase";
import emailjs from '@emailjs/browser';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: File[];
}

export interface ProposalEmailData {  
  senderName: string;
  senderEmail: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  tradeType: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  prepayRatio: number;
  postpayRatio: number;
  useMidpay: boolean;
  midpayCount?: number;
  midpayAmounts?: { amount: number; date: string }[];
  scope: string;
  message?: string;
  attachments?: File[];
  previewUrl: string;
}

export const emailService = {
  sendProposalEmail: async (data: ProposalEmailData) => {
    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const from_email = user?.email || 'noreply@yourdomain.com';
    const from_name = user?.user_metadata?.name || '이름 미확인';

    const emailParams: any = {
      from_name,
      from_email,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      title: data.title,
      description: data.description,
      tradeType: data.tradeType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: `${data.totalAmount} ${data.currency}`,
      prepayRatio: `${data.prepayRatio}%`,
      postpayRatio: `${data.postpayRatio}%`,
      midpayInfo: data.useMidpay && data.midpayAmounts?.length
        ? data.midpayAmounts.map((m, i) => `${i + 1}회차: ${m.amount} (${m.date})`).join('\n')
        : '중간 지급 없음',
      scope: data.scope || '',
      message: data.message || '',
      previewUrl: data.previewUrl
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID!,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
      emailParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
    );
  },
};