import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type ContractType = {
  id: string;
  title: string;
  client_name: string;
  freelancer_name: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: string;
  final_pdf_url: string | null;
  created_at: string;
};

export default function ContractList() {
  const [contracts, setContracts] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        
        // Supabase에서 계약 목록 조회
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        setContracts(data || []);
      } catch (error) {
        console.error("계약 목록 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_signature': return 'warning';
      case 'accepted': return 'success';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_signature': return '서명 대기';
      case 'accepted': return '계약 완료';
      case 'completed': return '완료';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>계약 목록을 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" fontWeight="bold">
          📂 계약 목록
        </Typography>
      </Box>

      {contracts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            아직 등록된 계약이 없습니다.
          </Typography>
        </Paper>
      ) : (
        contracts.map((contract) => (
          <Paper key={contract.id} variant="outlined" sx={{ p: 3, mb: 2 }}>
            <Box className="flex justify-between items-start mb-2">
              <Typography variant="h6">{contract.title}</Typography>
              <Chip 
                label={getStatusText(contract.status)} 
                color={getStatusColor(contract.status) as any}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              클라이언트: {contract.client_name} | 프리랜서: {contract.freelancer_name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              기간: {contract.start_date} ~ {contract.end_date}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              총 금액: {contract.total_amount?.toLocaleString()} {contract.currency}
            </Typography>

            <Box className="flex gap-2">
              <Button
                variant="outlined"
                onClick={() => navigate(`/contracts/${contract.id}/view`)}
              >
                자세히 보기
              </Button>
              
              {contract.final_pdf_url && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.open(contract.final_pdf_url!, '_blank')}
                >
                  📄 PDF 다운로드
                </Button>
              )}
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
}