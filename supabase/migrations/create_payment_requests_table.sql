-- 결제 요청 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  proposal_id uuid NOT NULL,
  order_id text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  payment_type text NOT NULL CHECK (payment_type IN ('prepay', 'midpay', 'postpay')),
  payment_date date NOT NULL,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'completed', 'failed', 'cancelled')),
  nicepay_request jsonb,
  nicepay_response jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT payment_requests_pkey PRIMARY KEY (id),
  CONSTRAINT payment_requests_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE,
  CONSTRAINT payment_requests_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_payment_requests_contract_id ON public.payment_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_proposal_id ON public.payment_requests(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON public.payment_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_payment_date ON public.payment_requests(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);

-- RLS 정책 설정 (필요한 경우)
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 결제 요청을 볼 수 있도록 정책 설정
CREATE POLICY "관리자는 모든 결제 요청을 볼 수 있음" ON public.payment_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_payment_requests_updated_at 
  BEFORE UPDATE ON public.payment_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
