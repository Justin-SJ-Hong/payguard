import { useEffect, useState } from "react";
import { useForm, Controller, useWatch, useFormContext, FormProvider } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// 선불, 후불, 중간지급 합계 검증 컴포넌트
import TotalSplitValidator from "../../components/TotalSplitValidator";
import PlatformTagsController from "../../components/PlatformTagsController";

// 날짜 검증 컴포넌트
import DateConsistencyValidator from "../../components/DateConsistencyValidator";

// 파일 첨부 컴포넌트
import { FileUpload } from "../../components/FileUpload";

// 중간 지급 필드 컴포넌트
import RenderMidpayFields from '../../components/RenderMidpayFields';
import formatNumber from '../../utils/formatNumber';
import SplitRatioValidator from '../../utils/splitRatioValidator';

import { useProposalStore } from '../../store/proposalStore';

import { FormData } from "../../type/proposal";

function Proposal() {

  const methods = useForm<FormData>({
    defaultValues: {
      midpayCount: 0,
      midpayAmounts: [],
      useMidpay: false,
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = methods;

  const onSubmit = (data: any) => {
    console.log("제출된 제안:", data);
    // TODO: 서버에 전송
  };

  // 실시간으로 중간 지급 횟수 감시
  const midpayCount = useWatch({
    control,
    name: "midpayCount",
    defaultValue: 0,
  });

  const useMidpay = watch("useMidpay");

  useEffect(() => {
    if (useMidpay && (!midpayCount || midpayCount < 1)) {
      methods.setValue('midpayCount', 1);
    }
    if (!useMidpay) {
      methods.setValue('midpayCount', 0);
    }
  }, [useMidpay]);

  // 계산
  const totalAmount = watch("totalAmount") || 0;
  const prepayRatio = watch("prepayRatio") || 0;
  const postpayRatio = watch("postpayRatio") || 0;

  const prepayAmount = Math.floor((totalAmount * prepayRatio) / 100);
  const postpayAmount = Math.floor((totalAmount * postpayRatio) / 100);
  const midpayTotal = totalAmount - prepayAmount - postpayAmount;

  const midpayAmounts = watch("midpayAmounts") || [];
  const midpaySum = midpayAmounts.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const midpayRemain = midpayTotal - midpaySum;

  const setField = useProposalStore((state) => state.setField);

  return (
    <>
      <FormProvider {...methods}>
        <Box p={4}>
          {/* ✅ 유효성 검사 실행 */}
          <DateConsistencyValidator
            setError={methods.setError as (name: string, error: any) => void}
            clearErrors={methods.clearErrors as (name: string) => void}
          />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📝 계약 제안
          </Typography>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              👥 상대방 정보
            </Typography>
            <Box className="flex flex-col sm:flex-row gap-4">
              <Box className="flex-1">
                <TextField
                  fullWidth
                  label="이름"
                  {...register("name", { required: "이름은 필수입니다" })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Box>
              <Box className="flex-1">
                <TextField
                  fullWidth
                  label="이메일"
                  {...register("email", {
                    required: "이메일은 필수입니다",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "이메일 형식이 올바르지 않습니다",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
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
              {...register("title", { required: "계약 제목은 필수입니다" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="프로젝트 목적 및 개요"
              multiline
              rows={3}
              {...register("description")}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🧰 계약 대상 플랫폼/도구
            </Typography>
            <PlatformTagsController />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 작업 범위
            </Typography>
            <TextField
              fullWidth
              label="작업 범위를 상세히 입력해주세요"
              multiline
              rows={4}
              {...register("scope", { required: "작업 범위는 필수입니다." })}
              error={!!errors.scope}
              helperText={errors.scope?.message}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⏰ 작업 기간
            </Typography>
            <Box className="flex flex-col sm:flex-row gap-4">
              <Controller
                control={control}
                name="workPeriod.start"
                defaultValue=""
                render={({ field }) => (
                  <DatePicker
                    label="시작일"
                    value={field.value ? dayjs(field.value) : null}
                    format="YYYY-MM-DD"
                    onChange={(date) => {
                      const value = date && typeof date !== 'string' && 'format' in date
                        ? date.format('YYYY-MM-DD')
                        : '';
                      field.onChange(value); // react-hook-form 상태 업데이트
                      setField('workPeriodStart', value); // zustand 상태도 동기화
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.workPeriod?.start,
                        helperText: errors.workPeriod?.start?.message,
                      },
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="workPeriod.end"
                defaultValue=""
                render={({ field }) => (
                  <DatePicker
                    label="종료일"
                    value={field.value ? dayjs(field.value) : null}
                    format="YYYY-MM-DD"
                    onChange={(date) => {
                      const value = date && typeof date !== 'string' && 'format' in date
                        ? date.format('YYYY-MM-DD')
                        : '';
                      field.onChange(value);
                      setField('workPeriodEnd', value);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.workPeriod?.end,
                        helperText: errors.workPeriod?.end?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 계약 금액 및 분할 조건
            </Typography>

            <Box className="flex flex-col sm:flex-row gap-4" sx={{ mt: 2 }}>
              <Box className="flex-3">
                <Controller
                  name="totalAmount"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="총 계약 금액"
                      value={formatNumber(field.value)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        field.onChange(Number(rawValue));
                      }}
                      error={!!errors.totalAmount}
                      helperText={errors.totalAmount?.message}
                    />
                  )}
                />
              </Box>
              <Box className="flex-1">
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="currency-label">통화</InputLabel>
                  <Select
                    labelId="currency-label"
                    label="통화"
                    defaultValue="USD ($)"
                    {...register("currency", { required: "통화를 선택해주세요" })}
                  >
                    <MenuItem value="USD ($)">USD ($)</MenuItem>
                    <MenuItem value="EUR (€)">EUR (€)</MenuItem>
                    <MenuItem value="KRW (₩)">KRW (₩)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box className="flex flex-col gap-4" sx={{ mt: 2 }}>
              <Box className="flex flex-row">
                <TextField
                  fullWidth
                  label="선불 비율 (%)"
                  type="number"
                  {...register("prepayRatio", {
                    min: 0,
                    max: 100,
                  })}
                  error={!!errors.prepayRatio}
                  helperText={errors.prepayRatio?.message}
                  sx={{ mb: 2 }}
                />
                
                <Controller
                  control={control}
                  name="firstPayDate"
                  defaultValue=""
                  render={({field}) => (
                    <DatePicker
                      label="선불 예정일"
                      value={field.value ? dayjs(field.value) : null}
                      format="YYYY-MM-DD"
                      onChange={(date) => {
                        const value = date && typeof date !== 'string' && 'format' in date
                          ? date.format('YYYY-MM-DD')
                          : '';
                        field.onChange(value);
                        setField('firstPayDate', value);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.firstPayDate,
                          helperText: errors.firstPayDate?.message,
                        },
                      }}
                    />
                  )}
                />

                <TextField
                  fullWidth
                  label="후불 비율 (%)"
                  type="number"
                  {...register("postpayRatio", {
                    min: 0,
                    max: 100
                  })}
                  error={!!errors.postpayRatio}
                  helperText={errors.postpayRatio?.message}
                  sx={{ mb: 2 }}
                />

                <Controller
                  control={control}
                  name="lastPayDate"
                  defaultValue=""
                  render={({field}) => (
                    <DatePicker
                      label="후불 예정일"
                      value={field.value ? dayjs(field.value) : null}
                      format="YYYY-MM-DD"
                      onChange={(date) => {
                        const value = date && typeof date !== 'string' && 'format' in date
                          ? date.format('YYYY-MM-DD')
                          : '';
                        field.onChange(value);
                        setField('lastPayDate', value);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.lastPayDate,
                          helperText: errors.lastPayDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Box>

              <Box className="flex flex-col text-start">
                <Typography variant="body2" color="text.secondary">
                  선불 금액: {((watch("prepayRatio") || 0) / 100 * (watch("totalAmount") || 0)).toLocaleString()} {watch("currency")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  후불 금액: {((watch("postpayRatio") || 0) / 100 * (watch("totalAmount") || 0)).toLocaleString()} {watch("currency")}
                </Typography>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Controller
                  name="useMidpay"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      onChange={e => {
                        field.onChange(e.target.checked)
                        setField('useMidpay', e.target.checked)
                      }}
                    />
                  )}
                />
              }
              label="중간 지급 사용"
              sx={{ mt: 2 }}
            />

            {/* 중간 지급 필드 렌더링 */}
            {useMidpay && (
              <Box className="flex-1 gap-4" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="중간 지급 횟수"
                  type="number"
                  {...register("midpayCount")}
                />
              </Box>
            )}
            
          </Paper>
          {useMidpay && midpayCount > 0 && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <RenderMidpayFields
                currency={watch("currency")}
                midpayCount={midpayCount}
                control={control}
                errors={errors}
                formatNumber={formatNumber}
                midpayTotal={midpayTotal}
                midpayRemain={midpayRemain}
                midpayAmounts={midpayAmounts}
              />
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📌 특약 (계약 조건)
            </Typography>
            <TextField
              fullWidth
              label="특약 사항 또는 조건"
              multiline
              rows={4}
              {...register("terms")}
              error={!!errors.terms}
              helperText={errors.terms?.message}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3, gap: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📂 파일 첨부
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
                {errors.attachments.message?.toString()}
              </Typography>
            )}

          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              제안 메시지
            </Typography>

            <TextField
              fullWidth
              label="제안 메시지"
              multiline
              rows={4}
              {...register("message")}
              sx={{ mb: 4 }}
            />
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            제안 수락 시, 정식 계약서가 작성되며 이후 전자서명이 진행됩니다.
          </Typography>
          <br />
          <Box display="flex" gap={10} justifyContent={"center"}>
            <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
              제안 보내기
            </Button>
            <Button variant="outlined" color="secondary" type="reset">
              초기화
            </Button>
          </Box>
          <SplitRatioValidator />
          <TotalSplitValidator />
        </Box>
      </FormProvider>
    </>
  );
}

export default Proposal;
