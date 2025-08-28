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

import RejectionDialog from "../../components/dialogs/RejectionDialog";
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
      // 3. 이메일 비교 (트림/소문자 처리, 발신자/수신자 모두 접근 허용)
      const userEmail = (user?.email || '').trim().toLowerCase();
      const recipientEmail = (data?.email || '').trim().toLowerCase();
      const senderEmail = (data?.sender_email || '').trim().toLowerCase();

      if (!userEmail) {
        setAccessDenied("not_logged_in");
        return;
      }

      const isAllowed = userEmail === recipientEmail || userEmail === senderEmail;

      if (!isAllowed) {
        setAccessDenied("wrong_user");
        return;
      }

      setAccessDenied(null);
      setProposal(data);

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
    try {
      // 1. 제안서 상태를 'pending_signature'로 업데이트
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ status: 'pending_signature' })
        .eq('id', id);
  
      if (updateError) {
        throw new Error('제안서 상태 업데이트 실패: ' + updateError.message);
      }
  
      // 2. contracts 테이블에 계약 정보 저장
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert([{
          proposal_id: id,
          status: "pending_signature",
          client_name: proposal?.client_name,
          client_email: proposal?.email,
          freelancer_name: proposal?.sender_name,
          freelancer_email: proposal?.sender_email,
          trade_type: proposal?.trade_type,
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
  
      // 3. 자체 서명 인터페이스 열기
      // openSigningInterface(contractData.id);
      // 3. 양측에 서명 요청 이메일 발송

      await sendSigningRequestEmails(contractData.id);
      
      // 4. 성공 메시지 표시
      alert('계약이 수락되었습니다! 양측에 서명 요청 이메일이 발송되었습니다.');
      
      // 5. 대시보드로 이동
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('계약 수락 처리 실패:', error);
      alert('계약 수락에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const sendSigningRequestEmails = async (contractId: string) => {
    try {
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
      
      // 클라이언트에게 서명 요청 이메일
      const clientEmailData = {
        service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        template_id: import.meta.env.VITE_EMAILJS_SIGNING_REQUEST_TEMPLATE_ID, // 새 템플릿 필요
        user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name: proposal?.client_name || '',
          to_email: proposal?.email,
          contract_title: proposal?.title || '',
          contract_amount: `${proposal?.total_amount} ${proposal?.currency}`,
          contract_period: `${proposal?.start_date} ~ ${proposal?.end_date}`,
          signing_url: `${appUrl}/contracts/${contractId}/sign?role=client`,
          proposal_id: id
        }
      };
  
      // 프리랜서에게 서명 요청 이메일
      const freelancerEmailData = {
        service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        template_id: import.meta.env.VITE_EMAILJS_SIGNING_REQUEST_TEMPLATE_ID,
        user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name: proposal?.sender_name || '',
          to_email: proposal?.sender_email || '',
          contract_title: proposal?.title || '',
          contract_amount: `${proposal?.total_amount} ${proposal?.currency}`,
          contract_period: `${proposal?.start_date} ~ ${proposal?.end_date}`,
          signing_url: `${appUrl}/contracts/${contractId}/sign?role=freelancer`,
          proposal_id: id
        }
      };
  
      // 양측 이메일 동시 발송
      await Promise.all([
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientEmailData)
        }),
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(freelancerEmailData)
        })
      ]);
  
      console.log('서명 요청 이메일 발송 완료');
      
    } catch (error) {
      console.error('서명 요청 이메일 발송 실패:', error);
      throw error;
    }
  };

  // 이메일로 서명을 받은 후 호출되는 함수
  const handleEmailSignatureComplete = async (contractId: string, role: 'client' | 'freelancer', signature: string) => {
    try {
      // 1. 해당 역할의 서명 정보 저장
      const updateData = role === 'client' 
        ? { client_signature_name: signature, client_signed_date: new Date().toISOString() }
        : { freelancer_signature_name: signature, freelancer_signed_date: new Date().toISOString() };

      const { error: updateError } = await supabase
        .from("contracts")
        .update(updateData)
        .eq('id', contractId)
        .select();

      if (updateError) {
        throw new Error('서명 정보 저장 실패: ' + updateError.message);
      }

      // 2. 양측 서명 완료 여부 확인
      const { data: contractData } = await supabase
        .from("contracts")
        .select("client_signature_name, freelancer_signature_name")
        .eq('id', contractId)
        .single();

      if (contractData?.client_signature_name && contractData?.freelancer_signature_name) {
        // 양측 서명 완료 시
        console.log('양측 서명 완료! 계약서 생성 시작');
        
        // 3. 계약서 PDF 생성
        await generateContractPDF(contractId);
        
        // 4. 제안서 상태를 'accepted'로 변경
        const { error: finalUpdateError } = await supabase
          .from('proposals')
          .update({ status: 'accepted' })
          .eq('id', id);

        if (finalUpdateError) {
          throw new Error('최종 상태 업데이트 실패: ' + finalUpdateError.message);
        }

        // 5. 양측에 계약 완료 이메일 발송
        await sendContractCompletionEmails(contractId);
        
        console.log('계약 완료!');
      } else {
        console.log(`${role} 서명 완료, 상대방 서명 대기 중`);
      }
      
    } catch (error) {
      console.error('서명 완료 처리 실패:', error);
      throw error;
    }
  };

  const sendContractCompletionEmails = async (contractId: string) => {
    try {
      // 양측에 계약 완료 알림 이메일 발송
      // ... 이메일 발송 로직
      
      console.log('계약 완료 이메일 발송 완료');
    } catch (error) {
      console.error('계약 완료 이메일 발송 실패:', error);
    }
  };

  const generateContractPDF = async (contractId: string) => {
    try {
      // 1. 관련 테이블 데이터 조회
      const [midpayRes, platformRes, toolRes, attachmentRes] = await Promise.all([
        supabase.from("proposal_midpays").select("*").eq("proposal_id", id).order("pay_order", { ascending: true }),
        supabase.from("proposal_platforms").select("*").eq("proposal_id", id),
        supabase.from("proposal_tools").select("*").eq("proposal_id", id),
        supabase.from("proposal_attachments").select("*").eq("proposal_id", id)
      ]);
  
      // 2. PDFMonkey로 계약서 PDF 생성
      const pdfmonkeyApiKey = import.meta.env.VITE_PDFMONKEY_API_KEY;
      const pdfmonkeyTemplateId = import.meta.env.VITE_PDFMONKEY_TEMPLATE_ID;
  
      if (!pdfmonkeyApiKey || !pdfmonkeyTemplateId) {
        throw new Error('PDFMonkey 설정이 누락되었습니다.');
      }
  
      const pdfPayload = {
        document: {
          document_template_id: pdfmonkeyTemplateId,
          status: "pending",
          payload: {
            id: id, // 계약 ID 추가
            start_date: proposal?.start_date,
            end_date: proposal?.end_date,
            client_name: proposal?.client_name,
            client_email: proposal?.email,
            sender_name: proposal?.sender_name,
            sender_email: proposal?.sender_email,
            trade_type: proposal?.trade_type, // 거래 유형 추가
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
            attachments: attachmentRes.data || [],
            created_at: new Date().toISOString()
          }
        }
      };
  
      console.log('PDFMonkey payload:', pdfPayload);
  
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
      console.log('PDFMonkey 응답:', pdfData);
      
      // 3. PDF 생성 완료까지 대기
      let pdfUrl = pdfData.document?.download_url;
      let attempts = 0;
      const maxAttempts = 30;
  
      while (!pdfUrl && attempts < maxAttempts) {
        console.log(`PDF 생성 중... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        // PDF 상태 재확인
        const statusRes = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdfData.document.id}`, {
          headers: {
            "Authorization": `Bearer ${pdfmonkeyApiKey}`,
            "Content-Type": "application/json"
          }
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          console.log('PDF 상태:', statusData.document.status);
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
  
      // 4. PDF를 Supabase Storage에 저장
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
  
      // 5. contracts 테이블에 PDF URL 업데이트
      const { error: updateError } = await supabase
        .from("contracts")
        .update({ 
          final_pdf_url: storedPdfUrl,
          pdf_generated_at: new Date().toISOString()
        })
        .eq('id', contractId);
  
      if (updateError) {
        console.error('PDF URL 업데이트 실패:', updateError);
      }
      
      console.log('계약서 PDF 생성 및 저장 완료');
      
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      // PDF 생성 실패해도 계약은 성사
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
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
        tradeType: proposal.trade_type,
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
          trade_type: proposal?.trade_type,
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
                label="거래 유형"
                value={proposal.trade_type === "KR-KR" ? "한국-한국" : proposal.trade_type === "KR-FR" ? "한국-해외" : "해외-해외"}
                disabled
                sx={{ mb: 1 }}
              />
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
