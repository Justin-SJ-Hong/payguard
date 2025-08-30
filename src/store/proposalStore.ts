import { create } from 'zustand';

interface MidpayAmount {
  amount: number;
  date: string;
}

interface ProposalState {
  // 기본 정보
  trade_type: string;
  client_name: string;
  email: string;
  title: string;
  description: string;
  scope: string;
  message: string;
  terms: string;
  
  // 작업 기간
  start_date: string;
  end_date: string;
  
  // 금액 및 비율
  total_amount: number;
  currency: string;
  prepay_ratio: number;
  postpay_ratio: number;
  
  // 지급 정보
  first_pay_date: string;
  last_pay_date: string;
  use_midpay: boolean;
  midpay_count: number;
  midpayAmounts: MidpayAmount[];
  
  // 플랫폼 및 도구
  platforms: string[];
  tools: string[];
  
  // 첨부파일
  attachments: File[];
  
  // 에러 상태
  errors: {
    [key: string]: string | undefined;
  };
  
  // 액션들
  setTradeType: (value: string) => void;
  setClientName: (value: string) => void;
  setEmail: (value: string) => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setScope: (value: string) => void;
  setMessage: (value: string) => void;
  setTerms: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setTotalAmount: (value: number) => void;
  setCurrency: (value: string) => void;
  setPrepayRatio: (value: number) => void;
  setPostpayRatio: (value: number) => void;
  setFirstPayDate: (value: string) => void;
  setLastPayDate: (value: string) => void;
  setUseMidpay: (value: boolean) => void;
  setMidpayCount: (value: number) => void;
  setPlatforms: (value: string[]) => void;
  setTools: (value: string[]) => void;
  setAttachments: (value: File[]) => void;
  
  // 기존 액션들
  setMidpayAmount: (index: number, value: Partial<MidpayAmount>) => void;
  
  // 기존 setField 액션 (하위 호환성)
  setField: <K extends keyof ProposalState>(key: K, value: ProposalState[K]) => void;
  
  // 에러 관련 액션들
  setError: (field: string, message: string | undefined) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useProposalStore = create<ProposalState>((set) => ({
  // 기본값
  trade_type: "KR-KR",
  client_name: "",
  email: "",
  title: "",
  description: "",
  scope: "",
  message: "",
  terms: "",
  start_date: "",
  end_date: "",
  total_amount: 0,
  currency: "USD ($)",
  prepay_ratio: 0,
  postpay_ratio: 0,
  first_pay_date: "",
  last_pay_date: "",
  use_midpay: false,
  midpay_count: 0,
  midpayAmounts: [],
  platforms: [],
  tools: [],
  attachments: [],
  errors: {},
  
  // 액션들
  setTradeType: (value) => set({ trade_type: value }),
  setClientName: (value) => set({ client_name: value }),
  setEmail: (value) => set({ email: value }),
  setTitle: (value) => set({ title: value }),
  setDescription: (value) => set({ description: value }),
  setScope: (value) => set({ scope: value }),
  setMessage: (value) => set({ message: value }),
  setTerms: (value) => set({ terms: value }),
  setStartDate: (value) => set({ start_date: value }),
  setEndDate: (value) => set({ end_date: value }),
  setTotalAmount: (value) => set({ total_amount: value }),
  setCurrency: (value) => set({ currency: value }),
  setPrepayRatio: (value) => set({ prepay_ratio: value }),
  setPostpayRatio: (value) => set({ postpay_ratio: value }),
  setFirstPayDate: (value) => set({ first_pay_date: value }),
  setLastPayDate: (value) => set({ last_pay_date: value }),
  setUseMidpay: (value) => set({ use_midpay: value }),
  setMidpayCount: (value) => set({ midpay_count: value }),
  setPlatforms: (value) => set({ platforms: value }),
  setTools: (value) => set({ tools: value }),
  setAttachments: (value) => set({ attachments: value }),
  
  // 기존 액션들
  setField: <K extends keyof ProposalState>(key: K, value: ProposalState[K]) => set({ [key]: value } as Pick<ProposalState, K>),
  setMidpayAmount: (index: number, value: Partial<MidpayAmount>) => set((state: ProposalState) => {
    const arr = [...state.midpayAmounts];
    arr[index] = { ...arr[index], ...value };
    return { midpayAmounts: arr };
  }),
  
  // 에러 관련 액션들
  setError: (field: string, message: string | undefined) => set((state: ProposalState) => ({
    errors: { ...state.errors, [field]: message }
  })),
  clearError: (field: string) => set((state: ProposalState) => {
    const newErrors = { ...state.errors };
    delete newErrors[field];
    return { errors: newErrors };
  }),
  clearAllErrors: () => set({ errors: {} }),
}));