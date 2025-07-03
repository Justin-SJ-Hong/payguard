import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Box, Typography,Divider, Button } from '@mui/material'
import { supabase } from "../../lib/supabase";

interface Proposal {
  id?: string;
  clientName: string;
  email: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  prepayRatio?: number;
  useMidpay?: boolean;
  midpayCount?: number;
  midpayAmount?: number;
  postpayRatio?: number;
  message?: string;
  status?: String;
}

function ProposalDetail() {
  const { id } = useParams(); // "/proposals/:id"
  const [proposal, setProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setProposal(data);
    };

    fetchProposal();
  }, [id]);

  const handleRespond = async (status: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/proposals/${id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("응답 실패");

      alert(`계약 제안을 ${status === "accepted" ? "수락" : "거절"}했습니다.`);
      // 필요하면 페이지 이동
      window.location.href = "/proposals";
    } catch (err) {
      console.error(err);
      alert("처리에 실패했습니다.");
    }
  };


  if (!proposal) return <Typography>불러오는 중입니다...</Typography>;

  return (
    <Box className="p-6">
      <Typography variant="h5" fontWeight="bold" gutterBottom>📄 계약 제안 상세</Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography><strong>클라이언트:</strong> {proposal.clientName} ({proposal.email})</Typography>
      <Typography><strong>제목:</strong> {proposal.title}</Typography>
      <Typography><strong>설명:</strong> {proposal.description}</Typography>
      <Typography><strong>계약 기간:</strong> {proposal.startDate} ~ {proposal.endDate}</Typography>
      <Typography><strong>총 금액:</strong> ${proposal.totalAmount}</Typography>
      <Typography><strong>선불 비율:</strong> {proposal.prepayRatio}%</Typography>
      <Typography><strong>중간 지급:</strong> {proposal.useMidpay ? `${proposal.midpayCount}회 (${proposal.midpayAmount} USD)` : '없음'}</Typography>
      <Typography><strong>후불 비율:</strong> {proposal.postpayRatio}%</Typography>
      <Typography><strong>제안 메시지:</strong> {proposal.message}</Typography>

      // ProposalDetail.tsx 또는 ProposalView.tsx 내부
      {proposal.status === "pending" && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleRespond("accepted")}
          >
            ✅ 수락
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleRespond("rejected")}
          >
            ❌ 거절
          </Button>
        </Box>
      )}
    </Box>

  )
}

export default ProposalDetail
