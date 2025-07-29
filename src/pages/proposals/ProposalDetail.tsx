import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Box, Typography, Divider, Button, CircularProgress, Alert, Snackbar, Paper, TextField } from '@mui/material'
import { supabase } from "../../lib/supabase";
import { emailService, ProposalEmailData } from "../../services/emailService";
import { FormData } from "../../type/proposal";

function ProposalDetail() {
  const { id } = useParams(); // "/proposals/:id"
  const [proposal, setProposal] = useState<FormData | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<null | "not_logged_in" | "wrong_user">(null);

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/dashboard";

  useEffect(() => {
    const fetchProposal = async () => {
      // 1. 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();

      // 2. proposal 데이터 가져오기
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", id)
        .single();
      
      console.log("user?.email:", user?.email);
      console.log("proposal data:", data);
      // 3. 이메일 비교
      if (!user) {
        setAccessDenied("not_logged_in");
      } else if (data && user.email !== data.email) {
        setAccessDenied("wrong_user");
      } else if (data && user.email === data.email) {
        setProposal(data);
      } else {
        setAccessDenied("wrong_user");
      }
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

  useEffect(() => {
    console.log("proposal 상태:", proposal);
  }, [proposal]);

  const handleResendEmail = async () => {
    if (!proposal) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      // 이메일 전송 데이터 준비
      const emailData: ProposalEmailData = {
        clientName: proposal.clientName,
        clientEmail: proposal.email,
        title: proposal.title,
        description: proposal.description || '',
        startDate: proposal.workPeriod?.start || '',
        endDate: proposal.workPeriod?.end || '',
        totalAmount: proposal.totalAmount,
        currency: proposal.currency || 'USD ($)',
        prepayRatio: proposal.prepayRatio || 0,
        postpayRatio: proposal.postpayRatio || 0,
        useMidpay: proposal.useMidpay || false,
        midpayCount: proposal.midpayCount,
        midpayAmounts: proposal.midpayAmounts || [],
        scope: '', // 제안서 상세에서는 scope 정보가 없을 수 있음
        message: proposal.message,
        previewUrl: ''
      };

      // 이메일 재전송
      await emailService.sendProposalEmail(emailData);
      
      setEmailResent(true);
      
    } catch (err) {
      console.error('이메일 재전송 실패:', err);
      setError(err instanceof Error ? err.message : '이메일 재전송에 실패했습니다.');
    } finally {
      setIsResending(false);
    }
  };


  if (accessDenied === "not_logged_in") {
    return (
      <Box>
        <Typography>로그인이 필요합니다.</Typography>
        <Button variant="contained" onClick={() => {
          window.location.href = `/login?redirect=${id}`;
        }}>
          로그인 하러가기
        </Button>
      </Box>
    );
  }
  if (accessDenied === "wrong_user") {
    return (
      <Box>
        <Typography>접근 권한이 없습니다. (다른 계정으로 로그인됨)</Typography>
        <Button variant="contained" onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = `/login?redirect=${id}`;
        }}>
          로그아웃 후 로그인
        </Button>
      </Box>
    );
  }
  if (!proposal) {
    return <Typography>불러오는 중입니다...</Typography>;
  }

  return (
    <Box className="p-6">
      <Typography variant="h5" fontWeight="bold" gutterBottom>📄 계약 제안 상세</Typography>
      <Divider sx={{ mb: 3 }} />

      {/* <Typography><strong>클라이언트:</strong> {proposal.clientName} ({proposal.email})</Typography>
      <Typography><strong>제목:</strong> {proposal.title}</Typography>
      <Typography><strong>설명:</strong> {proposal.description}</Typography>
      <Typography><strong>계약 기간:</strong> {proposal.workPeriod?.start} ~ {proposal.workPeriod?.end}</Typography>
      <Typography><strong>총 금액:</strong> ${proposal.totalAmount}</Typography>
      <Typography><strong>선불 비율:</strong> {proposal.prepayRatio}%</Typography>
      <Typography><strong>중간 지급:</strong> {proposal.useMidpay ? `${proposal.midpayCount}회 (${proposal.midpayAmounts.map(item => item.amount).reduce((a, b) => a + b, 0)} ${proposal.currency})` : '없음'}</Typography>
      <Typography><strong>후불 비율:</strong> {proposal.postpayRatio}%</Typography>
      <Typography><strong>제안 메시지:</strong> {proposal.message}</Typography> */}
      <Box p={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>📝 계약 제안</Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            👥 상대방 정보
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-4">
            <Box className="flex-1">
              <TextField 
                fullWidth
                label="이름"
                value={proposal.sender_name || '이름 미확인'}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
            <Box className="flex-1">
              <TextField 
                fullWidth
                label="이메일"
                value={proposal.sender_email || ''}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📝 프로젝트 개요
          </Typography>
          <TextField 
            fullWidth
            label="프로젝트 제목"
            value={proposal.title}
            disabled
            sx={{ mb: 2 }}
          />
        </Paper>
      </Box>

      {/* 액션 버튼들 */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleResendEmail}
          disabled={isResending}
          startIcon={isResending ? <CircularProgress size={20} /> : null}
        >
          {isResending ? '재전송 중...' : '📧 이메일 재전송'}
        </Button>
        
        {proposal.status === "pending" && (
          <>
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
          </>
        )}
      </Box>

      {/* 성공/실패 알림 */}
      <Snackbar
        open={emailResent}
        autoHideDuration={6000}
        onClose={() => setEmailResent(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setEmailResent(false)} severity="success" sx={{ width: '100%' }}>
          ✅ 제안서 이메일이 재전송되었습니다!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          ❌ {error}
        </Alert>
      </Snackbar>
    </Box>

  )
}

export default ProposalDetail
