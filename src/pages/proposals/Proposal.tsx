import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

// 선불, 후불, 중간지급 합계 검증 컴포넌트
import TotalSplitValidator from "../../components/validation/TotalSplitValidator";
import PlatformController from "../../components/business/PlatformController";
import ToolController from "../../components/business/ToolController";


// 날짜 검증 컴포넌트
import DateConsistencyValidator from "../../components/validation/DateConsistencyValidator";

// 파일 첨부 컴포넌트
import { FileUpload } from "../../components/forms/FileUpload";

// 중간 지급 필드 컴포넌트
import RenderMidpayFields from '../../components/business/RenderMidpayFields';
import formatNumber from '../../utils/formatNumber';
import SplitRatioValidator from '../../utils/splitRatioValidator';

import { useProposalStore } from '../../store/proposalStore';
import { emailService, ProposalEmailData } from '../../services/emailService';
import { supabase } from '../../lib/supabase';

import { FormData } from "../../type/proposal";

function Proposal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Zustand 스토어에서 상태 가져오기
  const {
    // 기본 상태
    trade_type,
    client_name,
    email,
    title,
    description,
    start_date,
    end_date,
    total_amount,
    currency,
    prepay_ratio,
    postpay_ratio,
    use_midpay,
    midpay_count,
    first_pay_date,
    last_pay_date,
    scope,
    message,
    terms,
    platforms,
    tools,
    attachments,
    midpayAmounts,
    errors,
    
    // 액션들
    setTradeType,
    setClientName,
    setEmail,
    setTitle,
    setDescription,
    setStartDate,
    setEndDate,
    setTotalAmount,
    setCurrency,
    setPrepayRatio,
    setPostpayRatio,
    setUseMidpay,
    setMidpayCount,
    setFirstPayDate,
    setLastPayDate,
    setScope,
    setMessage,
    setTerms,
    setPlatforms,
    setTools,
    setAttachments,
    
    // 기존 액션들
    setMidpayAmount,
    
    // 에러 관련 액션들
    setError,
    clearError,
    clearAllErrors,
  } = useProposalStore();

  const [localPrepayRatio, setLocalPrepayRatio] = useState(0);
  const [localPostpayRatio, setLocalPostpayRatio] = useState(0);
  const [localTotalAmount, setLocalTotalAmount] = useState(0);
  const [localCurrency, setLocalCurrency] = useState("USD ($)");
  const [localMidpayRatio, setLocalMidpayRatio] = useState(0);

  // Zustand 스토어 상태 변경을 감시하여 로컬 상태 업데이트
  useEffect(() => {
    setLocalPrepayRatio(prepay_ratio || 0);
  }, [prepay_ratio]);

  useEffect(() => {
    setLocalPostpayRatio(postpay_ratio || 0);
  }, [postpay_ratio]);

  useEffect(() => {
    setLocalTotalAmount(total_amount || 0);
  }, [total_amount]);

  useEffect(() => {
    setLocalCurrency(currency || "USD ($)");
  }, [currency]);

  const watchedPrepayRatio = localPrepayRatio;
  const watchedPostpayRatio = localPostpayRatio;
  const watchedTotalAmount = localTotalAmount;
  const watchedCurrency = localCurrency;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    clearAllErrors();
    
    // 제출 가능 여부 재검증
    if (!canSubmit()) {
      setSubmitError('제출 조건을 만족하지 않습니다. 비율 합계가 100%이고, 필요한 예정일을 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("제출된 제안:", data);
      
      // 🚀 제안서 데이터를 Supabase에 저장
      // 1. 사용자 정보와 제안서 메인 데이터를 병렬로 처리
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('사용자 인증 정보를 찾을 수 없습니다.');
      }

      // profiles 테이블에서 사용자 정보 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();

      const { data: proposalData, error: dbError } = await supabase
        .from('proposals')
        .insert([{
          sender_name: profile?.name || user?.email || '이름 미확인',
          sender_email: user?.email,
          client_name: client_name,
          email: email,
          trade_type: trade_type,
          title: title,
          description: description,
          start_date: start_date,
          end_date: end_date,
          total_amount: total_amount,
          currency: currency || 'USD ($)',
          prepay_ratio: prepay_ratio,
          postpay_ratio: postpay_ratio,
          use_midpay: use_midpay,
          midpay_count: midpay_count,
          first_pay_date: first_pay_date && first_pay_date.trim() !== "" ? first_pay_date : null,
          last_pay_date: last_pay_date && last_pay_date.trim() !== "" ? last_pay_date : null,
          scope: scope,
          message: message,
          terms: terms,
          user_id: user?.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error('제안서 저장에 실패했습니다: ' + dbError.message);
      }

      const proposalId = proposalData.id;

      // 🚀 2. 중간지급 데이터 저장 (병렬 처리를 위해 Promise 배열에 추가)
      let midpayData: Array<{
        proposal_id: string;
        pay_order: number;
        amount: number;
        pay_date: string;
      }> = [];
      
      if (use_midpay && (midpayAmounts ?? []).length > 0) {
        midpayData = (midpayAmounts ?? []).map((item: any, index: number) => ({
          proposal_id: proposalId,
          pay_order: index + 1,
          amount: Number(item?.amount) || 0,
          pay_date: item?.date || new Date().toISOString().split('T')[0]
        }));
      }

      // 🚀 3. 플랫폼과 도구 데이터 준비 (병렬 처리를 위해 Promise 배열에 추가)
      let platformData: Array<{
        proposal_id: string;
        platform: string;
      }> = [];
      
      if ((platforms ?? []).length > 0) {
        platformData = (platforms ?? []).map((platform: string) => ({
          proposal_id: proposalId,
          platform
        }));
      }

      let toolData: Array<{
        proposal_id: string;
        tool: string;
      }> = [];
      
      if ((tools ?? []).length > 0) {
        toolData = (tools ?? []).map((tool: string) => ({
          proposal_id: proposalId,
          tool
        }));
      }

      // 🚀 4. 모든 하위 데이터를 병렬로 저장
      const subDataPromises = [];

      if (midpayData.length > 0) {
        subDataPromises.push(
          supabase.from('proposal_midpays').insert(midpayData)
        );
      }

      if (platformData.length > 0) {
        subDataPromises.push(
          supabase.from('proposal_platforms').insert(platformData)
        );
      }

      if (toolData.length > 0) {
        subDataPromises.push(
          supabase.from('proposal_tools').insert(toolData)
        );
      }

      // 병렬로 하위 데이터 저장
      if (subDataPromises.length > 0) {
        const subDataResults = await Promise.all(subDataPromises);
        
        // 에러 체크
        for (const result of subDataResults) {
          if (result.error) {
            throw new Error('하위 데이터 저장에 실패했습니다: ' + result.error.message);
          }
        }
      }

      // 🚀 5. 첨부파일을 병렬로 업로드 (파일이 여러 개일 때)
      if ((attachments ?? []).length > 0) {
        const userId = user.id; // 이미 위에서 가져온 user 사용
        const fileUploadPromises: Promise<void>[] = [];

        for (const file of (attachments ?? [])) {
          // 파일명 안전하게 처리 (한글, 특수문자 등)
          const fileExtension = file.name.split('.').pop();
          const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
          const filePath = `${userId}/${proposalId}/${safeFileName}`;
          
          // 파일 업로드와 메타데이터 저장을 하나의 Promise로 묶기
          const fileUploadPromise = (async () => {
            // Storage에 파일 업로드
            const { error: uploadError } = await supabase.storage
              .from('proposal-attachments')
              .upload(filePath, file);

            if (uploadError) {
              throw new Error('파일 업로드에 실패했습니다: ' + uploadError.message);
            }

            // 파일 URL 생성
            const { data: { publicUrl } } = supabase.storage
              .from('proposal-attachments')
              .getPublicUrl(filePath);

            // DB에 첨부파일 메타데이터 저장
            const { error: attachmentError } = await supabase
              .from('proposal_attachments')
              .insert([{
                proposal_id: proposalId,
                file_url: publicUrl,
                file_name: file.name,
                file_type: file.type,
                uploaded_at: new Date().toISOString()
              }]);

            if (attachmentError) {
              throw new Error('첨부파일 메타데이터 저장에 실패했습니다: ' + attachmentError.message);
            }
          })();

          fileUploadPromises.push(fileUploadPromise);
        }

        // 🚀 모든 파일을 병렬로 업로드
        await Promise.all(fileUploadPromises);
      }

      // 이메일 전송 데이터 준비
      const emailData: ProposalEmailData = {
        clientName: client_name || '',
        clientEmail: email,
        senderName: profile?.name || user?.email || '이름 미확인',
        senderEmail: user?.email || '',
        title: title,
        description: description || '',
        tradeType: trade_type,
        startDate: start_date || '',
        endDate: end_date || '',
        totalAmount: total_amount,
        currency: currency || 'USD ($)',
        prepayRatio: prepay_ratio || 0,
        postpayRatio: postpay_ratio || 0,
        useMidpay: use_midpay || false,
        midpayCount: midpay_count,
        midpayAmounts: midpayAmounts?.map((item: any) => ({ amount: Number(item?.amount) || 0, date: item?.date || '' })) || [],
        scope: scope || '',
        message: message,
        attachments: attachments,
        previewUrl: `${window.location.origin}/proposals/${proposalId}`,
      };

      // 이메일 전송
      await emailService.sendProposalEmail(emailData);
      
      setEmailSent(true);
      
      // 폼 초기화 (Zustand 스토어 상태 초기화)
      setTradeType("KR-KR");
      setClientName("");
      setEmail("");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setTotalAmount(0);
      setCurrency("USD ($)");
      setPrepayRatio(0);
      setPostpayRatio(0);
      setFirstPayDate("");
      setLastPayDate("");
      setUseMidpay(false);
      setMidpayCount(0);
      setScope("");
      setMessage("");
      setTerms("");
      setPlatforms([]);
      setTools([]);
      setAttachments([]);
      
      // 로컬 상태도 초기화
      setLocalPrepayRatio(0);
      setLocalPostpayRatio(0);
      setLocalTotalAmount(0);
      setLocalCurrency("USD ($)");
      setLocalMidpayRatio(0);
      
      // 성공 메시지 표시 후 대시보드로 이동
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (err) {
      console.error('제안서 전송 실패:', err);
      setSubmitError(err instanceof Error ? err.message : '제안서 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Zustand 스토어 상태 사용
  const midpayCount = midpay_count;
  const useMidpay = use_midpay;

  useEffect(() => {
    if (useMidpay && (!midpayCount || midpayCount < 1)) {
      setMidpayCount(1);
    }
    if (!useMidpay) {
      setMidpayCount(0);
      // 중간 지급 사용 해제 시 선불/후불 비율 초기화
      setPrepayRatio(0);
      setPostpayRatio(0);
      // 로컬 상태도 초기화
      setLocalPrepayRatio(0);
      setLocalPostpayRatio(0);
      // 중간 지급 비율도 초기화
      setLocalMidpayRatio(0);
    }
  }, [useMidpay, midpayCount, setMidpayCount, setPrepayRatio, setPostpayRatio]);

  // 계산
  const totalAmount = total_amount || 0;
  const prepayRatio = prepay_ratio || 0;
  const postpayRatio = postpay_ratio || 0;

  const prepayAmount = Math.floor((totalAmount * prepayRatio) / 100);
  const postpayAmount = Math.floor((totalAmount * postpayRatio) / 100);
  const midpayTotal = totalAmount - prepayAmount - postpayAmount;

  const midpayAmountsArray = midpayAmounts || [];
  const midpaySum = midpayAmountsArray.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  const midpayRemain = midpayTotal - midpaySum;

  // 현재 비율 상태를 확인하는 함수
  const getCurrentPaymentStatus = () => {
    const hasPrepay = (watchedPrepayRatio || 0) > 0;
    const hasPostpay = (watchedPostpayRatio || 0) > 0;
    const hasMidpay = useMidpay && (midpayCount ?? 0) > 0 && (localMidpayRatio || 0) > 0;
    
    return { hasPrepay, hasPostpay, hasMidpay };
  };

  // 제출 가능 여부를 확인하는 함수
  const canSubmit = () => {
    const { hasPrepay, hasPostpay, hasMidpay } = getCurrentPaymentStatus();
    const totalRatio = (watchedPrepayRatio || 0) + (watchedPostpayRatio || 0) + (localMidpayRatio || 0);
    
    // 비율 합계가 100%가 아니면 제출 불가
    if (totalRatio !== 100) return false;
    
    // 비율이 있는 항목은 반드시 날짜가 있어야 함 (빈 문자열도 체크)
    if (hasPrepay && (!first_pay_date || first_pay_date === "")) return false;
    if (hasPostpay && (!last_pay_date || last_pay_date === "")) return false;
    
    return true;
  };



  return (
    <>
      <Box p={1}>
        {/* ✅ 유효성 검사 실행 */}
        <DateConsistencyValidator
          setError={setError}
          clearErrors={clearError}
        />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📝 계약 제안
          </Typography>

          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
            {/* <Typography variant="h6" fontWeight="bold" gutterBottom>
              👥 상대방 정보
            </Typography> */}
            <Box className="flex flex-col sm:flex-row gap-2">
              <Box className="flex-1">
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                  👥 상대방 정보
                </Typography>
                
                {/* 거래 유형 선택 */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  거래 유형을 선택해주세요
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={trade_type === "KR-KR"}
                        onChange={() => setTradeType("KR-KR")}
                      />
                    }
                    label="한국-한국"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={trade_type === "KR-FR"}
                        onChange={() => setTradeType("KR-FR")}
                      />
                    }
                    label="한국-해외"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={trade_type === "FR-FR"}
                        onChange={() => setTradeType("FR-FR")}
                      />
                    }
                    label="해외-해외"
                  />
                </Box>
                
                <TextField
                  fullWidth
                  size="small"
                  label="이름"
                  value={client_name}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (e.target.value.trim()) {
                      clearError("client_name");
                    } else {
                      setError("client_name", "이름은 필수입니다");
                    }
                  }}
                  error={!!errors.client_name}
                  helperText={errors.client_name}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="이메일"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value.trim()) {
                      clearError("email");
                    } else {
                      setError("email", "이메일은 필수입니다");
                    }
                  }}
                  error={!!errors.email}
                  helperText={errors.email}
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
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) {
                      clearError("title");
                    } else {
                      setError("title", "계약 제목은 필수입니다");
                    }
                  }}
                  error={!!errors.title}
                  helperText={errors.title}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="프로젝트 목적 및 개요"
                  multiline
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>

              <Box className="flex-2">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🧰 계약 대상 플랫폼/도구 (각각 10개까지 선택 가능)
                </Typography>
                <PlatformController />
                <ToolController />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📋 작업 범위
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="작업 범위를 상세히 입력해주세요"
                  multiline
                  rows={4}
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value);
                    if (e.target.value.trim()) {
                      clearError("scope");
                    } else {
                      setError("scope", "작업 범위는 필수입니다.");
                    }
                  }}
                  error={!!errors.scope}
                  helperText={errors.scope}
                />
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
            <Box className={`flex flex-col sm:flex-row gap-1 ${!useMidpay || !(midpayCount ?? 0) ? 'w-full' : ''}`}>
              <Box className={useMidpay && (midpayCount ?? 0) > 0 ? "flex-1" : "w-full"}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⏰ 작업 기간 / 중간 지급
                </Typography>
                <Box className="flex flex-col sm:flex-row justify-center">
                  <TextField
                    label="시작일"
                    value={start_date || ''}
                    placeholder="YYYY-MM-DD"
                    fullWidth
                    size="small"
                    error={!!errors.start_date}
                    helperText={errors.start_date}
                    inputProps={{
                      pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                      maxLength: 10
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      // YYYY-MM-DD 형식으로 자동 포맷팅
                      if (value.length === 4 && !value.includes('-')) {
                        value = value + '-';
                      } else if (value.length === 7 && value.split('-').length === 2) {
                        value = value + '-';
                      }
                      setStartDate(value);
                    }}
                  />

                  <Typography variant="h6" fontWeight="bold" gutterBottom>~</Typography>

                  <TextField
                    label="종료일"
                    value={end_date || ''}
                    placeholder="YYYY-MM-DD"
                    fullWidth
                    size="small"
                    error={!!errors.end_date}
                    helperText={errors.end_date}
                    inputProps={{
                      pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                      maxLength: 10
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      // YYYY-MM-DD 형식으로 자동 포맷팅
                      if (value.length === 4 && !value.includes('-')) {
                        value = value + '-';
                      } else if (value.length === 7 && value.split('-').length === 2) {
                        value = value + '-';
                      }
                      setEndDate(value);
                    }}
                  />
                </Box>

                <Box className="flex flex-col sm:flex-row gap-1" sx={{ mt: 1 }}>
                  <Box className="flex-3">
                    <TextField
                      fullWidth
                      size="small"
                      label="총 계약 금액"
                      value={formatNumber(total_amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        setTotalAmount(Number(rawValue));
                      }}
                      error={!!errors.total_amount}
                      helperText={errors.total_amount}
                    />
                  </Box>
                  <Box className="flex-1">
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel id="currency-label">통화</InputLabel>
                      <Select
                        labelId="currency-label"
                        size="small"
                        label="통화"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <MenuItem value="USD ($)">USD ($)</MenuItem>
                        <MenuItem value="EUR (€)">EUR (€)</MenuItem>
                        <MenuItem value="KRW (₩)">KRW (₩)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box className={`flex flex-col sm:flex-row gap-1 ${!useMidpay ? 'w-full' : ''}`}>
                  <Box className={`flex ${!useMidpay ? 'flex-col sm:flex-row w-full' : 'flex-row'}`}>
                    <TextField
                      // fullWidth
                      size="small"
                      label={(watchedPrepayRatio || 0) > 0 ? "" : "선불 비율 (%)"}
                      type="number"
                      placeholder={(watchedPrepayRatio || 0) > 0 || (watchedPostpayRatio || 0) > 0 ? '' : '0'}
                      value={prepay_ratio || 0}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        // 입력 중에도 즉시 로컬 상태 업데이트
                        setLocalPrepayRatio(value);
                        setPrepayRatio(value);
                        
                        // useMidpay가 false일 때만 자동 계산
                        if (!useMidpay && value >= 0 && value <= 100) {
                          const postpayValue = 100 - value;
                          setPostpayRatio(postpayValue);
                          setLocalPostpayRatio(postpayValue);
                          // 선불 비율 입력 시 후불 비율도 즉시 업데이트하여 비율 합계에 반영
                          console.log(`선불 비율 ${value}% 입력 → 후불 비율 ${postpayValue}% 자동 계산`);
                        }
                      }}
                      sx={{ 
                        minWidth: !useMidpay ? '25%' : 165, 
                        flex: !useMidpay ? 'none' : 1,
                        width: !useMidpay ? '25%' : 165
                      }}
                      error={!!errors.prepay_ratio}
                      helperText={errors.prepay_ratio}
                    />

                    <TextField
                      label="선불 예정일"
                      value={first_pay_date || ''}
                      placeholder="YYYY-MM-DD"
                      size="small"
                      sx={{
                        minWidth: !useMidpay ? '25%' : 165, 
                        flex: !useMidpay ? 'none' : 1,
                        width: !useMidpay ? '25%' : 165
                      }}
                      error={!!errors.first_pay_date}
                      helperText={errors.first_pay_date}
                      inputProps={{
                        pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                        maxLength: 10
                      }}
                      onChange={(e) => {
                        let value = e.target.value;
                        // YYYY-MM-DD 형식으로 자동 포맷팅
                        if (value.length === 4 && !value.includes('-')) {
                          value = value + '-';
                        } else if (value.length === 7 && value.split('-').length === 2) {
                          value = value + '-';
                        }
                        setFirstPayDate(value);
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label={(watchedPostpayRatio || 0) > 0 ? "" : "후불 비율 (%)"}
                      type="number"
                      placeholder={(watchedPrepayRatio || 0) > 0 || (watchedPostpayRatio || 0) > 0 ? '' : '0'}
                      value={postpay_ratio || 0}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        // 입력 중에도 즉시 로컬 상태 업데이트
                        setLocalPostpayRatio(value);
                        setPostpayRatio(value);
                        
                        // useMidpay가 false일 때만 자동 계산
                        if (!useMidpay && value >= 0 && value <= 100) {
                          const prepayValue = 100 - value;
                          setPrepayRatio(prepayValue);
                          setLocalPrepayRatio(prepayValue);
                          // 후불 비율 입력 시 선불 비율도 즉시 업데이트하여 비율 합계에 반영
                          console.log(`후불 비율 ${value}% 입력 → 선불 비율 ${prepayValue}% 자동 계산`);
                        }
                      }}
                      error={!!errors.postpay_ratio}
                      helperText={errors.postpay_ratio}
                      sx={{ 
                        minWidth: !useMidpay ? '25%' : 165, 
                        flex: !useMidpay ? 'none' : 1,
                        width: !useMidpay ? '25%' : 'auto'
                      }}
                    />

                    <TextField
                      label="후불 예정일"
                      value={last_pay_date || ''}
                      placeholder="YYYY-MM-DD"
                      size="small"
                      sx={{
                        minWidth: !useMidpay ? '25%' : 165, 
                        flex: !useMidpay ? 'none' : 1,
                        width: !useMidpay ? '25%' : 165
                      }}
                      error={!!errors.last_pay_date}
                      helperText={errors.last_pay_date}
                      inputProps={{
                        pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                        maxLength: 10
                      }}
                      onChange={(e) => {
                        let value = e.target.value;
                        // YYYY-MM-DD 형식으로 자동 포맷팅
                        if (value.length === 4 && !value.includes('-')) {
                          value = value + '-';
                        } else if (value.length === 7 && value.split('-').length === 2) {
                          value = value + '-';
                        }
                        setLastPayDate(value);
                      }}
                    />
                  </Box>
                </Box>

                <Box className="flex flex-col text-start">
                  <Typography variant="body2" color="text.secondary" sx={{ gap: 1, display: 'flex', mb: 1, flexWrap: 'wrap' }}>
                    <span style={{ marginRight: '20px', fontWeight: 'bold' }}>
                      💰 선불 금액: {((watchedPrepayRatio || 0) / 100 * (watchedTotalAmount || 0)).toLocaleString()} {watchedCurrency}
                    </span>
                    <span style={{ marginRight: '20px', fontWeight: 'bold' }}>
                      💰 후불 금액: {((watchedPostpayRatio || 0) / 100 * (watchedTotalAmount || 0)).toLocaleString()} {watchedCurrency}
                    </span>
                    <span style={{ 
                      marginRight: '20px', 
                      fontWeight: 'bold', 
                      color: (Number(watchedPrepayRatio) || 0) + (Number(watchedPostpayRatio) || 0) + (localMidpayRatio || 0) === 100 ? '#4caf50' : '#1976d2'
                    }}>
                      📊 비율 합계: {(Number(watchedPrepayRatio) || 0) + (Number(watchedPostpayRatio) || 0) + (localMidpayRatio || 0)}%
                    </span>
                    {watchedTotalAmount > 0 && (Number(watchedPrepayRatio) || 0) + (Number(watchedPostpayRatio) || 0) + (localMidpayRatio || 0) !== 100 && (
                      <span style={{ color: '#f57c00', fontWeight: 'bold' }}>
                        ⚠️ 100%가 되어야 합니다
                      </span>
                    )}
                    {watchedTotalAmount > 0 && (Number(watchedPrepayRatio) || 0) + (Number(watchedPostpayRatio) || 0) + (localMidpayRatio || 0) === 100 && (
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                        ✅ 완벽합니다!
                      </span>
                    )}
                  </Typography>
                  
                  {/* 상세한 제출 조건 안내 메시지 */}
                  {(() => {
                    const { hasPrepay, hasPostpay, hasMidpay } = getCurrentPaymentStatus();
                    const totalRatio = (watchedPrepayRatio || 0) + (watchedPostpayRatio || 0) + (localMidpayRatio || 0);
                    
                    if (totalRatio === 100) {
                      if (hasPrepay && hasPostpay && hasMidpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 선불 + 중간 + 후불: 모든 예정일을 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasPrepay && hasMidpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 선불 + 중간: 선불 예정일과 중간 지급 정보를 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasMidpay && hasPostpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 중간 + 후불: 중간 지급 정보와 후불 예정일을 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasPrepay && hasPostpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 선불 + 후불: 두 예정일을 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasPrepay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 선불만: 선불 예정일만 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasPostpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 후불만: 후불 예정일만 입력하면 제출 가능합니다
                          </Typography>
                        );
                      } else if (hasMidpay) {
                        return (
                          <Typography variant="body2" color="info.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                            💡 중간만: 중간 지급 정보만 입력하면 제출 가능합니다
                          </Typography>
                        );
                      }
                    } else {
                      return (
                        <Typography variant="body2" color="warning.main" sx={{ mb: 1, fontStyle: 'italic' }}>
                          ⚠️ 비율 합계가 100%가 되어야 제출 가능합니다 (현재: {totalRatio}%)
                        </Typography>
                      );
                    }
                  })()}
                </Box>

                <Box className="flex flex-col sm:flex-row gap-1">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={use_midpay}
                        onChange={(e) => setUseMidpay(e.target.checked)}
                      />
                    }
                    label="중간 지급 사용"
                  />
                  {useMidpay && (
                    <Box className="flex-1" sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="중간 지급 횟수"
                        type="number"
                        value={midpay_count || 0}
                        onChange={(e) => setMidpayCount(Number(e.target.value))}
                      />
                    </Box>
                  )}
                </Box>
                
              </Box>

              {useMidpay && (midpayCount ?? 0) > 0 && (
                <Box className="flex-3">
                  <RenderMidpayFields
                    currency={watchedCurrency}
                    midpayCount={midpayCount ?? 0}
                    formatNumber={formatNumber}
                    midpayTotal={Math.floor((watchedTotalAmount * (100 - (watchedPrepayRatio || 0) - (watchedPostpayRatio || 0)) / 100))}
                    midpayRemain={Math.floor((watchedTotalAmount * (100 - (watchedPrepayRatio || 0) - (watchedPostpayRatio || 0)) / 100)) - midpaySum}
                    midpayAmounts={midpayAmounts}
                    totalContractAmount={watchedTotalAmount || 0}
                    onMidpayChange={(totalMidpayRatio) => {
                      // 중간 지급 비율을 로컬 상태에 저장
                      setLocalMidpayRatio(totalMidpayRatio);
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>

          

          <Paper variant="outlined" sx={{ p: 1, mb: 1}}>
            <Box className="flex flex-row gap-1">
              <Box className="flex-1">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📌 특약 (계약 조건)
                </Typography>
                <TextField
                  fullWidth
                  label="특약 사항 또는 조건"
                  multiline
                  rows={20}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  error={!!errors.terms}
                  helperText={errors.terms}
                />
              </Box>

              <Box className="flex-1">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  제안 메시지
                </Typography>

                <TextField
                  fullWidth
                  label="제안 메시지"
                  multiline
                  rows={20}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 4 }}
                />
              </Box>

              <Box className="flex-1">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📂 파일 첨부 (최대 5개까지 가능)
                </Typography>
                <Typography>
                    png, jpeg, pdf, word, ppt, excel 파일 가능합니다.
                </Typography>
                <Typography>
                    오픈오피스, 리브레오피스도 지원합니다!!
                </Typography>
                <br />
                <FileUpload />
                {errors.attachments && (
                  <Typography color="error" variant="body2" mt={1}>
                    {errors.attachments}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            제안 수락 시, 정식 계약서가 작성되며 이후 전자서명이 진행됩니다.
          </Typography>
          <br />
          <Box display="flex" gap={10} justifyContent={"center"}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => onSubmit({
                trade_type: trade_type as "KR-KR" | "KR-FR" | "FR-FR",
                client_name,
                email,
                title,
                description,
                start_date,
                end_date,
                total_amount,
                currency,
                prepay_ratio,
                postpay_ratio,
                use_midpay,
                midpay_count,
                first_pay_date,
                last_pay_date,
                scope,
                message,
                terms,
                platforms,
                tools,
                attachments,
                midpayAmounts: midpayAmountsArray
              })}
              disabled={isSubmitting || !canSubmit()}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? '전송 중...' : '제안 보내기'}
            </Button>
            <Button variant="outlined" color="secondary" type="reset" disabled={isSubmitting}>
              초기화
            </Button>
          </Box>

          {/* 성공/실패 알림 */}
          <Snackbar
            open={emailSent}
            autoHideDuration={6000}
            onClose={() => setEmailSent(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setEmailSent(false)} severity="success" sx={{ width: '100%' }}>
              ✅ 제안서가 성공적으로 전송되었습니다!
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!submitError}
            autoHideDuration={6000}
            onClose={() => setSubmitError(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSubmitError(null)} severity="error" sx={{ width: '100%' }}>
              ❌ {submitError}
            </Alert>
          </Snackbar>
          <SplitRatioValidator />
          <TotalSplitValidator />
        </Box>
      </>
    );
}

export default Proposal;
