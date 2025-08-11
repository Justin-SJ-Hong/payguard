import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { 
  Box, 
  Typography, 
  Divider, 
  Button, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Paper, 
  TextField, 
  Chip,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { supabase } from "../../lib/supabase";
import { emailService, ProposalEmailData } from "../../services/emailService";
import { FormData } from "../../type/proposal";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import formatNumber from "../../utils/formatNumber";

import axios from "axios";

import RejectionDialog from "../../components/RejectionDialog";
import { RejectionData } from "../../type/rejection";

function ProposalDetail() {
  const { id } = useParams(); // "/proposals/:id"
  const [proposal, setProposal] = useState<FormData | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<null | "not_logged_in" | "wrong_user">(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);

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

      // 4. 관련 테이블 데이터 병렬로 가져오기
      const [platformRes, toolRes, midpayRes, attachmentsRes] = await Promise.all([
        supabase.from("proposal_platforms").select("*").eq("proposal_id", id),
        supabase.from("proposal_tools").select("*").eq("proposal_id", id),
        supabase.from("proposal_midpays").select("*").eq("proposal_id", id).order("pay_order", { ascending: true }),
        supabase.from("proposal_attachments").select("*").eq("proposal_id", id),
      ]);

      setProposal({
        ...data,
        platforms: platformRes.data?.map((p: any) => p.platform) ?? [],
        tools: toolRes.data?.map((t: any) => t.tool) ?? [],
        midpayAmounts: midpayRes.data?.map((m: any) => ({
          amount: m.amount,
          date: m.pay_date,
        })) ?? [],
        attachments: attachmentsRes.data?.map((a: any) => ({
          url: a.file_url,
          name: a.file_name,
          type: a.file_type,
        })) ?? [],
      } as FormData);
    };

    fetchProposal();
  }, [id]);

  const handleAccept = async () => {
    // 질문사항
    // 1. 보통 계약을 할 때 수락자가 제안 수락하고 서명한 다음 제안자가 서명해서 계약 성사 + 계약서 생성을 하는 경우가 흔한지, 
    // 아니면 수락자가 제안 수락하고 수락자/제안자 동시 서명 후 계약 성사 + 계약서 생성이 되는 경우가 흔한 지 궁금합니다.
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. 제안서 상태를 'accepted'로 업데이트
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (updateError) {
        throw new Error('제안서 상태 업데이트 실패: ' + updateError.message);
      }

      // 2. 관련 테이블 데이터 조회
      const [midpayRes, platformRes, toolRes, attachmentRes] = await Promise.all([
        supabase.from("proposal_midpays").select("*").eq("proposal_id", id).order("pay_order", { ascending: true }),
        supabase.from("proposal_platforms").select("*").eq("proposal_id", id),
        supabase.from("proposal_tools").select("*").eq("proposal_id", id),
        supabase.from("proposal_attachments").select("*").eq("proposal_id", id)
      ]);

      // 3. PDFMonkey로 계약서 PDF 생성
      const pdfmonkeyApiKey = import.meta.env.VITE_PDFMONKEY_API_KEY;
      const pdfmonkeyTemplateId = import.meta.env.VITE_PDFMONKEY_TEMPLATE_ID;

      if (!pdfmonkeyApiKey || !pdfmonkeyTemplateId) {
        throw new Error('PDFMonkey 설정이 누락되었습니다.');
      }

      // 디버깅용 로그
      console.log('PDFMonkey 환경변수 확인:');
      console.log('- API Key 존재:', !!pdfmonkeyApiKey);
      console.log('- Template ID:', `"${pdfmonkeyTemplateId}"`);
      console.log('- Template ID 길이:', pdfmonkeyTemplateId?.length);

      const pdfPayload = {
        document: {
          document_template_id: pdfmonkeyTemplateId,
          status: "pending",
          payload: {
            start_date: proposal?.start_date,
            end_date: proposal?.end_date,
            client_name: proposal?.client_name,
            client_email: proposal?.email,
            sender_name: proposal?.sender_name,
            sender_email: proposal?.sender_email,
            title: proposal?.title,
            description: proposal?.description,
            scope: proposal?.scope,
            total_amount: proposal?.total_amount,
            currency: proposal?.currency,
            prepay_ratio: proposal?.prepay_ratio,
            prepay_amount: Math.floor((proposal?.total_amount || 0) * (proposal?.prepay_ratio || 0) / 100),
            first_pay_date: proposal?.first_pay_date,
            postpay_ratio: proposal?.postpay_ratio,
            postpay_amount: Math.floor((proposal?.total_amount || 0) * (proposal?.postpay_ratio || 0) / 100),
            last_pay_date: proposal?.last_pay_date,
            use_midpay: proposal?.use_midpay,
            midpay_count: proposal?.midpay_count,
            terms: proposal?.terms,
            message: proposal?.message,
            midpayAmounts: midpayRes.data || [],
            platforms: platformRes.data?.map(p => p.platform) || [],
            tools: toolRes.data?.map(t => t.tool) || [],
            attachments: attachmentRes.data || []
          }
        }
      };

      console.log('PDFMonkey payload:', pdfPayload);
      console.log('PDFMonkey payload JSON:', JSON.stringify(pdfPayload, null, 2));

      const pdfRes = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${pdfmonkeyApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pdfPayload)
      });

      if (!pdfRes.ok) {
        const pdfErrorText = await pdfRes.text();
        throw new Error(`PDF 생성 실패: ${pdfRes.status} - ${pdfErrorText}`);
      }

      const pdfData = await pdfRes.json();
      console.log('PDFMonkey 응답 전체:', pdfData);
      
      // PDF 생성 완료까지 대기
      let pdfUrl = pdfData.document?.download_url;
      let attempts = 0;
      const maxAttempts = 30; // 최대 30초 대기

      while (!pdfUrl && attempts < maxAttempts) {
        console.log(`PDF 생성 대기 중... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        // PDF 상태 재확인
        const statusRes = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdfData.document.id}`, {
          headers: {
            "Authorization": `Bearer ${pdfmonkeyApiKey}`,
            "Content-Type": "application/json"
          }
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          console.log('PDF 상태 확인:', statusData.document.status);
          pdfUrl = statusData.document?.download_url;
          
          if (statusData.document.status === 'success' && pdfUrl) {
            break;
          }
          if (statusData.document.status === 'error') {
            throw new Error('PDF 생성 중 오류가 발생했습니다.');
          }
        }
        attempts++;
      }

      if (!pdfUrl) {
        throw new Error('PDF 생성 시간이 초과되었습니다.');
      }

      console.log('PDF 생성 완료:', pdfUrl);

      // PDF를 Supabase Storage에 저장
      const pdfResponse = await fetch(pdfUrl);
      const pdfBlob = await pdfResponse.blob();
      
      const contractFileName = `contract_${id}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(contractFileName, pdfBlob, {
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error('계약서 PDF 저장 실패: ' + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(contractFileName);

      const storedPdfUrl = publicUrlData.publicUrl;
      console.log('계약서 PDF 저장 완료:', storedPdfUrl);

      // 4. SignWell 계약 생성
      const signwellApiKey = import.meta.env.VITE_SIGNWELL_API_KEY;
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

      if (!signwellApiKey) {
        throw new Error('SignWell API 키가 누락되었습니다.');
      }

      const signwellPayload = {
        test_mode: true,
        title: proposal?.title || "Freelance Contract",
        files: [
          {
            name: "Contract",
            file_url: storedPdfUrl
          }
        ],
        signers: [
          {
            name: proposal?.client_name,
            email: proposal?.email,
            role: "Client",
            order: 1
          },
          {
            name: proposal?.sender_name,
            email: proposal?.sender_email,
            role: "Freelancer",
            order: 2
          }
        ],
        redirect_url: `${appUrl}/contracts/${id}/completed`,
        redirect_decline_url: `${appUrl}/contracts/${id}/declined`
      };

      console.log('SignWell payload:', signwellPayload);

      const signwellRes = await fetch("https://api.signwell.com/v1/documents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${signwellApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signwellPayload)
      });

      if (!signwellRes.ok) {
        const signwellErrorText = await signwellRes.text();
        throw new Error(`SignWell API 오류: ${signwellRes.status} - ${signwellErrorText}`);
      }

      const signwellData = await signwellRes.json();
      console.log('SignWell 문서 생성 완료:', signwellData.id);

      // 5. contracts 테이블에 계약 정보 저장
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert([{
          proposal_id: id,
          status: "pending_signature",
          signwell_document_id: signwellData.id,
          temp_pdf_url: storedPdfUrl,
          client_name: proposal?.client_name,
          client_email: proposal?.email,
          freelancer_name: proposal?.sender_name,
          freelancer_email: proposal?.sender_email,
          title: proposal?.title,
          total_amount: proposal?.total_amount,
          currency: proposal?.currency,
          start_date: proposal?.start_date,
          end_date: proposal?.end_date,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (contractError) {
        throw new Error('계약 저장 실패: ' + contractError.message);
      }

      console.log('계약 저장 완료:', contractData.id);

      // 6. 서명 페이지로 이동
      if (signwellData.signing_url) {
        window.location.href = signwellData.signing_url;
      } else {
        alert('계약서 생성에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('계약 수락 처리 실패:', error);
      alert('계약 수락에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 서명 완료 확인 함수
  const checkSigningStatus = async (contractId: string, signwellDocumentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await axios.post(
        'https://brywgebfgffpiulmkmrw.supabase.co/functions/v1/sign-complete',
        { 
          contract_id: contractId, 
          signwell_document_id: signwellDocumentId 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );

      if (res.data.success) {
        alert('서명이 완료되었습니다!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('서명 상태 확인 실패:', error);
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
        clientName: proposal.client_name || '',
        clientEmail: proposal.email,
        senderName: proposal.sender_name || '',
        senderEmail: proposal.sender_email || '',
        title: proposal.title,
        description: proposal.description || '',
        // startDate: proposal.workPeriod?.start || '',
        // endDate: proposal.workPeriod?.end || '',
        startDate: proposal.start_date || '',
        endDate: proposal.end_date || '',
        totalAmount: proposal.total_amount,
        currency: proposal.currency || 'USD ($)',
        // prepayRatio: proposal.prepayRatio || 0,
        // postpayRatio: proposal.postpayRatio || 0,
        prepayRatio: proposal.prepay_ratio || 0,
        postpayRatio: proposal.postpay_ratio || 0,
        // useMidpay: proposal.useMidpay || false,
        useMidpay: proposal.use_midpay || false,
        // midpayCount: proposal.midpayCount,
        midpayCount: proposal.midpay_count,
        // midpayAmounts: proposal.midpayAmounts || [],
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

  const handleRejectClick = () => {
    setRejectionDialogOpen(true);
  };

  const handleRejectionConfirm = async (rejectionData: RejectionData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. 제안서 상태를 'rejected'로 업데이트
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionData.reason,
          rejection_custom_reason: rejectionData.customReason,
          allow_resubmit: rejectionData.allowResubmit,
          resubmit_deadline: rejectionData.resubmitDeadline,
        })
        .eq('id', id);

      if (updateError) {
        throw new Error('제안서 상태 업데이트 실패: ' + updateError.message);
      }

      // 2. 프론트엔드에서 EmailJS 직접 호출
      const emailjsData = {
        service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        template_id: import.meta.env.VITE_EMAILJS_REJECT_TEMPLATE_ID,
        user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name: proposal?.sender_name || '',
          to_email: proposal?.sender_email || '',
          client_name: proposal?.client_name || '',
          proposal_title: proposal?.title || '',
          rejection_reason: rejectionData.reason,
          custom_reason: rejectionData.customReason || '',
          allow_resubmit: rejectionData.allowResubmit ? '예' : '아니오',
          resubmit_deadline: rejectionData.resubmitDeadline || '',
          proposal_id: id,
        }
      };

      // EmailJS API 직접 호출
      const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailjsData)
      });

      if (!emailjsResponse.ok) {
        const errorText = await emailjsResponse.text();
        throw new Error(`EmailJS 전송 실패: ${errorText}`);
      }

      alert('제안서가 거절되었습니다.');
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('거절 처리 실패:', error);
      alert('거절 처리에 실패했습니다.');
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
      {/* <Typography><strong>클라이언트:</strong> {proposal.clientName} ({proposal.email})</Typography>
      <Typography><strong>제목:</strong> {proposal.title}</Typography>
      <Typography><strong>설명:</strong> {proposal.description}</Typography>
      <Typography><strong>계약 기간:</strong> {proposal.workPeriod?.start} ~ {proposal.workPeriod?.end}</Typography>
      <Typography><strong>총 금액:</strong> ${proposal.totalAmount}</Typography>
      <Typography><strong>선불 비율:</strong> {proposal.prepayRatio}%</Typography>
      <Typography><strong>중간 지급:</strong> {proposal.useMidpay ? `${proposal.midpayCount}회 (${proposal.midpayAmounts.map(item => item.amount).reduce((a, b) => a + b, 0)} ${proposal.currency})` : '없음'}</Typography>
      <Typography><strong>후불 비율:</strong> {proposal.postpayRatio}%</Typography>
      <Typography><strong>제안 메시지:</strong> {proposal.message}</Typography> */}
      <Box p={1}>
        {/* <Typography variant="h5" fontWeight="bold" gutterBottom>📝 계약 제안</Typography> */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>📄 계약 제안 상세</Typography>
        <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
          <Box className="flex flex-col sm:flex-row gap-2">
            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                👥 상대방 정보
              </Typography>
              <TextField 
                fullWidth
                size="small"
                label="이름"
                value={proposal.sender_name || '이름 미확인'}
                disabled
                sx={{ mb: 1 }}
              />
              <TextField 
                fullWidth
                size="small"
                label="이메일"
                value={proposal.sender_email || ''}
                disabled
                sx={{ mb: 1 }}
              />
            </Box>

            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📝 프로젝트 개요
              </Typography>
              <TextField 
                fullWidth
                size="small"
                label="프로젝트 제목"
                value={proposal.title}
                disabled
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="프로젝트 목적 및 개요"
                value={proposal.description}
                multiline
                rows={7}
                disabled
              />
            </Box>

            <Box className="flex-2">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🧰 계약 대상 플랫폼/도구 (각각 10개까지 선택 가능)
              </Typography>
              {proposal.platforms?.map((p, i) => <Chip key={i} label={p} />)}
              <br />
              {proposal.tools?.map((t, i) => <Chip key={i} label={t} />)}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📋 작업 범위
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="작업 범위를 상세히 입력해주세요"
                value={proposal.scope}
                multiline
                disabled
              />
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
          <Box className="flex flex-col sm:flex-row gap-1">
            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⏰ 작업 기간 / 중간 지급
              </Typography>
              <Box className="flex flex-col sm:flex-row justify-center">
                <DatePicker 
                  label="시작일"
                  format="YYYY-MM-DD"
                  value={proposal.start_date ? dayjs(proposal.start_date) : null}
                  readOnly
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      disabled: true,
                    },
                  }}
                />
                <Typography variant="h6" fontWeight="bold" gutterBottom>~</Typography>
                <DatePicker 
                  label="종료일"
                  format="YYYY-MM-DD"
                  value={proposal.end_date ? dayjs(proposal.end_date) : null}
                  readOnly
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      disabled: true,
                    },
                  }}
                />
              </Box>

              <Box className="flex flex-col sm:flex-row gap-1" sx={{ mt: 1 }}>
                <Box sx={{ flex: 3 }}> {/* flex: 3으로 3배 비율 */}
                  <TextField
                    label="총 계약 금액"
                    size="small"
                    value={formatNumber(proposal.total_amount)}
                    disabled
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1, mb: 1 }}> {/* flex: 1로 1배 비율 */}
                  <TextField
                    label="통화"
                    size="small"
                    value={proposal.currency}
                    disabled
                    fullWidth
                  />
                </Box>
              </Box>

              <Box className="flex flex-col sm:flex-row gap-1">
                <Box className="flex flex-row">
                  <TextField
                    label="선불 비율 (%)"
                    // fullWidth
                    size="small"
                    sx={{ minWidth: 165, flex: 1 }}
                    value={proposal.prepay_ratio}
                    disabled
                  />
                  <TextField
                    label="선불 예정일"
                    // fullWidth
                    size="small"
                    sx={{ minWidth: 165, flex: 1 }}
                    value={proposal.first_pay_date}
                    disabled
                  />
                  <TextField
                    label="후불 비율 (%)"
                    // fullWidth
                    size="small"
                    sx={{ minWidth: 165, flex: 1 }}
                    value={proposal.postpay_ratio}
                    disabled
                  />
                  <TextField
                    label="후불 예정일"
                    // fullWidth
                    size="small"
                    sx={{ minWidth: 165, flex: 1 }}
                    value={proposal.last_pay_date}
                    disabled
                  />
                </Box>
              </Box>

              <Box className="flex flex-col text-start">
                <Typography variant="body2" color="text.secondary">
                  <span>선불 금액: {formatNumber((proposal.prepay_ratio ?? 0) / 100 * (proposal.total_amount ?? 0))} {proposal.currency}</span>
                  <span>후불 금액: {formatNumber((proposal.postpay_ratio ?? 0) / 100 * (proposal.total_amount ?? 0))} {proposal.currency}</span>
                </Typography>
              </Box>
              
              <Box className="flex flex-col sm:flex-row gap-1">
                <FormControlLabel 
                  control={
                    <Checkbox
                      checked={proposal.use_midpay}
                    />
                  }
                  label="중간 지급 사용"
                />
                {proposal.use_midpay && (
                  <Box className="flex flex-col gap-4" sx={{ mt: 1 }}>
                    <TextField
                      label="중간 지급 횟수"
                      value={proposal.midpay_count}
                      disabled
                      size="small"
                    />
                  </Box>
                )}
              </Box>

            </Box>

            <Box className="flex-3">
              {proposal.use_midpay && (proposal.midpay_count ?? 0) > 0 && (
                <Box className="flex flex-wrap gap-1"> {/* Proposal과 동일한 레이아웃 */}
                  {proposal.midpayAmounts?.map((midpay, index) => (
                    <Paper key={index} variant="outlined">
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ minWidth: 200, display: 'flex' }}>
                        중간 지급 {index + 1}회 금액
                      </Typography>
                      <Box className="flex flex-col sm:flex-row">
                        <TextField
                          size="small"
                          label="금액"
                          value={formatNumber(midpay.amount) + ' ' + proposal.currency}
                          disabled
                          sx={{ width: '100%' }}
                        />
                        <TextField
                          size="small"
                          label="지급일"
                          value={midpay.date}
                          disabled
                          sx={{ width: 165 }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
          <Box className="flex flex-row gap-1">
            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📌 특약 (계약 조건)
              </Typography>
              <TextField
                fullWidth
                label="특약 사항 또는 조건"
                value={proposal.terms}
                disabled
              />
            </Box>

            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📝 제안 메시지
              </Typography>
              <TextField
                fullWidth
                label="제안 메시지"
                value={proposal.message}
                disabled
              />
            </Box>

            <Box className="flex-1">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📂 파일 첨부
              </Typography>
              {proposal.attachments && proposal.attachments.length > 0 ? (
                <Box className="flex flex-col gap-2">
                  {proposal.attachments.map((attachment, index) => (
                    <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        파일 {index + 1}:
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={async () => {
                          try {
                            const { data: { user } } = await supabase.auth.getUser();
                            console.log('현재 사용자 ID:', user?.id);

                            const filePath = (attachment as any).url;
                            if (!filePath) {
                              console.error('파일 경로가 없습니다');
                              return;
                            }

                            const urlParts = filePath.split('/');
                            const bucketIndex = urlParts.indexOf('proposal-attachments');
                            const actualPath = urlParts.slice(bucketIndex + 1).join('/');
                            console.log('파일 경로:', actualPath);
                            console.log('첫 번째 폴더:', actualPath.split('/')[0]);

                            console.log('실제 파일 경로:', actualPath);

                            const { data, error } = await supabase.storage
                              .from('proposal-attachments')
                              .download(actualPath);
                              
                            if (error) {
                              console.error('파일 다운로드 실패:', error);
                              return;
                            }

                            const url = window.URL.createObjectURL(data);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = (attachment as any).name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('파일 다운로드 중 오류:', error);
                          }
                        }}
                        sx={{ mt: 1 }}
                      >
                        {attachment.name}
                      </Button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  첨부파일 없음
                </Typography>
              )}
            </Box>
          </Box>
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
              onClick={handleAccept}
            >
              ✅ 수락
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRejectClick}
            >
              ❌ 거절
            </Button>
          </>
        )}
      </Box>

      <RejectionDialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleRejectionConfirm}
      />

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
