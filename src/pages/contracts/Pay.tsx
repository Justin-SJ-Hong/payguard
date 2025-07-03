import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ko } from "date-fns/locale";

type Contract = {
  id: string;
  title: string;
  clientName: string;
  totalAmount: number;
};

type DepositFormValues = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  dueDate: Date | null;
  memo?: string;
};

export default function Pay() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormValues>();

  useEffect(() => {
    if (!id) return;

    // 📡 계약 정보 가져오기
    fetch(`/api/contracts/${id}`)
      .then((res) => res.json())
      .then((data) => setContract(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = (data: DepositFormValues) => {
    console.log("📨 입금안내 전송:", { ...data, contractId: id });
    // 전송 API 호출 위치
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress />
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box className="p-6 text-center">
        <Typography color="error">계약 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box className="p-6 max-w-3xl mx-auto">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          💸 입금 안내
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📄 계약 정보
          </Typography>
          <Typography>계약명: {contract.title}</Typography>
          <Typography>클라이언트: {contract.clientName}</Typography>
          <Typography>총 금액: ${contract.totalAmount.toFixed(2)}</Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏦 계좌 정보
          </Typography>
          <TextField
            fullWidth
            label="은행명"
            {...register("bankName", { required: "은행명은 필수입니다" })}
            error={!!errors.bankName}
            helperText={errors.bankName?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="계좌번호"
            {...register("accountNumber", { required: "계좌번호는 필수입니다" })}
            error={!!errors.accountNumber}
            helperText={errors.accountNumber?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="예금주"
            {...register("accountHolder", { required: "예금주는 필수입니다" })}
            error={!!errors.accountHolder}
            helperText={errors.accountHolder?.message}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📅 입금 기한
          </Typography>
          <Controller
            control={control}
            name="dueDate"
            defaultValue={null}
            rules={{ required: "입금 기한은 필수입니다" }}
            render={({ field }) => (
              <DatePicker
                label="입금 기한"
                {...field}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dueDate,
                    helperText: errors.dueDate?.message,
                    sx: { mt: 1 },
                  },
                }}
              />
            )}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📝 전달 메모 (선택)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="클라이언트에게 전달할 메모를 입력하세요"
            {...register("memo")}
          />
        </Paper>

        <Box className="flex justify-end gap-4">
          <Button variant="outlined" color="inherit">
            계약서 보기
          </Button>
          <Button variant="contained" color="success" onClick={handleSubmit(onSubmit)}>
            입금 요청 메일 발송
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
