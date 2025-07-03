import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";

export type FormData = {
  // 상대방 정보
  name: string;
  email: string;

  // 작업 개요
  title: string;
  description?: string;

  // 계약 조건
  totalAmount: number;
  prepayRatio?: number;

  // 중간 지급
  midpayCount?: number;
  midpayAmount?: number;

  useMidpay: boolean;
  postpayRatio?: number;  // ✅ 추가
  message?: string;       // ✅ 추가
};

function Proposal() {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: any) => {
    console.log("제출된 제안:", data);
    // TODO: 서버에 전송
  };

  return (
    <Box p={4}>
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
          📝 작업 개요
        </Typography>
        <TextField
          fullWidth
          label="계약 제목"
          {...register("title", { required: "계약 제목은 필수입니다" })}
          error={!!errors.title}
          helperText={errors.title?.message}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="작업 설명"
          multiline
          rows={3}
          {...register("description")}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          💰 계약 금액 및 분할 조건
        </Typography>
        <Box className="flex flex-col sm:flex-row gap-4">
          <Box className="flex-1">
            <TextField
              fullWidth
              label="총 계약 금액 (USD)"
              type="number"
              {...register("totalAmount", { required: true })}
            />
          </Box>
          <Box className="flex-1">
            <TextField
              fullWidth
              label="선불 비율 (%)"
              type="number"
              {...register("prepayRatio")}
            />
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
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          }
          label="중간 지급 사용"
          sx={{ mt: 2 }}
        />
        <Box className="flex flex-col sm:flex-row gap-4">
          <Box className="flex-1">
            <TextField
              fullWidth
              label="중간 지급 횟수"
              type="number"
              {...register("midpayCount")}
            />
          </Box>
          <Box className="flex-1">
            <TextField
              fullWidth
              label="중간 지급 금액"
              type="number"
              {...register("midpayAmount")}
            />
          </Box>
        </Box>
        <TextField
          fullWidth
          label="후불 비율 (%)"
          type="number"
          {...register("postpayRatio")}
          sx={{ mt: 2 }}
        />
      </Paper>

      <TextField
        fullWidth
        label="제안 메시지"
        multiline
        rows={4}
        {...register("message")}
        sx={{ mb: 4 }}
      />

      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
          제안 보내기
        </Button>
        <Button variant="outlined" color="secondary" type="reset">
          초기화
        </Button>
      </Box>
    </Box>
  );
}

export default Proposal;
