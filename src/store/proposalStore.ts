import { create } from 'zustand';

interface MidpayAmount {
  amount: number;
  date: string;
}

interface ProposalState {
  firstPayDate: string;
  lastPayDate: string;
  workPeriodStart: string;
  workPeriodEnd: string;
  midpayAmounts: MidpayAmount[];
  useMidpay: boolean;
  setField: <K extends keyof ProposalState>(key: K, value: ProposalState[K]) => void;
  setMidpayAmount: (index: number, value: Partial<MidpayAmount>) => void;
}

export const useProposalStore = create<ProposalState>((set) => ({
  firstPayDate: '',
  lastPayDate: '',
  workPeriodStart: '',
  workPeriodEnd: '',
  midpayAmounts: [],
  useMidpay: false,
  setField: <K extends keyof ProposalState>(key: K, value: ProposalState[K]) => set({ [key]: value } as Pick<ProposalState, K>),
  setMidpayAmount: (index: number, value: Partial<MidpayAmount>) => set((state: ProposalState) => {
    const arr = [...state.midpayAmounts];
    arr[index] = { ...arr[index], ...value };
    return { midpayAmounts: arr };
  }),
}));