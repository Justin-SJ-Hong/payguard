export interface FormData {
  id?: string;

  clientName: string;
  email: string;
  title: string;
  description?: string;
  scope?: string;
  workPeriod?: {
    start: string;
    end: string;
  };
  totalAmount: number;
  currency?: string;
  prepayRatio?: number;
  postpayRatio?: number;
  useMidpay?: boolean;
  midpayCount?: number;
  midpayAmounts?: Array<{
    amount: number;
    date: string;
  }>;
  firstPayDate?: string;
  lastPayDate?: string;
  message?: string;
  terms?: string;
  platforms?: string[];
  tools?: string[];
  attachments?: File[];
  status?: string;
  sender_name?: string;
  sender_email?: string;
}