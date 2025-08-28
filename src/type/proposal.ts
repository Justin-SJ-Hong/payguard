export interface FormData {
  id?: string;

  // clientName: string;
  client_name?: string;
  email: string;
  trade_type: "KR-KR" | "KR-FR" | "FR-FR";
  title: string;
  description?: string;
  scope?: string;
  // workPeriod?: {
  //   start: string;
  //   end: string;
  // };
  start_date?: string;
  end_date?: string;

  total_amount: number;
  currency?: string;
  prepay_ratio?: number;
  postpay_ratio?: number;
  // useMidpay?: boolean;
  use_midpay?: boolean;
  // midpayCount?: number;
  midpay_count?: number;
  // midpayAmounts?: Array<{
  //   amount: number;
  //   date: string;
  // }>;
  midpayAmounts?: { amount: number; date: string }[];
  // midpay_amounts?: { amount: number; date: string }[];
  // firstPayDate?: string;
  // lastPayDate?: string;
  first_pay_date?: string;
  last_pay_date?: string;
  message?: string;
  terms?: string;
  platforms?: string[];
  tools?: string[];
  attachments?: File[];
  // attachments?: { url: string; name: string; type: string }[];
  status?: string;
  sender_name?: string;
  sender_email?: string;
}